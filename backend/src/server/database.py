import json
import os
import sqlite3
import time
from threading import Timer
from typing import Optional
import flask
from server import free_form_content
from server.department.department import Department
from server.department.file import File
from server.department.person import Person
from server.display_group import DisplayGroup, PageTemplate
from server.free_form_content import FreeFormContent, BinaryContent
from server.free_form_content.content_stream import ContentStream
from server.grouped_content_streams import GroupedContentStreams

from werkzeug.security import generate_password_hash, check_password_hash

from server.user import User

DATABASE = "campusign.db"
DATABASE_TEST = "campusign.test.db"


class DatabaseController:
    def __init__(self, db: sqlite3.Connection):
        self.db = db

    @staticmethod
    def get():
        db = flask.g.get("_database", None)
        if db is None:
            db_path = (
                DATABASE if not flask.current_app.config["TESTING"] else DATABASE_TEST
            )
            db = flask.g._database = DatabaseController(sqlite3.connect(db_path))
        return db

    @staticmethod
    def teardown():
        """Close the database connection and remove it from the global cache"""
        db = flask.g.pop("_database", None)
        if db is not None:
            db.db.close()

    def create_db(self):
        """Create the database and run setup SQL"""
        app = flask.current_app

        # Wipe tables first if testing to get a clean slate
        if app.config["TESTING"]:
            with app.open_resource("sql/drop_tables.sql", mode="r") as f:
                self.db.cursor().executescript(f.read())

        # Create necessary tables
        with app.open_resource("sql/schema.sql", mode="r") as f:
            self.db.cursor().executescript(f.read())

        if len(self.fetch_all_departments()) == 0:
            with app.open_resource("sql/add_default_data.sql", mode="r") as f:
                self.db.cursor().executescript(f.read())

        # Wipe all templates if debugging (but not in tests as DB is already wipe)
        # This makes hot reloading work for them too
        if app.debug and not app.config["TESTING"]:
            self.db.cursor().executescript("DELETE FROM templates;")

        if len(self.fetch_all_page_templates()) == 0:
            path_prefix = "" if os.getcwd().endswith("frontend") else "frontend/"
            for path in os.scandir(f"{path_prefix}templates/layouts"):
                if not path.is_file():
                    continue

                with open(path) as f:
                    self.add_page_template(f.read())

    def post_content(self, content: FreeFormContent) -> (int, int):
        """Insert the given FreeFormContent and returns the inserted row id"""
        assert content.posted is None, (
            "FreeFormContent.posted should only be set in"
            "DatabaseController.post_content"
        )

        post_timestamp = int(time.time())

        (mime, blob) = (
            (content.mime_type, content.blob)
            if isinstance(content, BinaryContent)
            else (None, None)
        )

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO content "
                "(stream, posted, content_type, content_json,"
                " blob_mime_type, content_blob)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (
                    content.stream,
                    post_timestamp,
                    content.type(),
                    json.dumps(content.to_db_json()),
                    mime,
                    blob,
                ),
            )
        return cursor.lastrowid, post_timestamp

    def fetch_content_in_streams(
        self, streams: list[int], limit=None, fetch_blob=False
    ) -> list[FreeFormContent]:
        """Fetch all content in the given streams. By default, the blobs
        will not be fetched from the database."""
        cursor = self.db.cursor()
        cursor.row_factory = free_form_content.from_sql
        with_blob = ", content_blob" if fetch_blob else ""
        with_limit = f"LIMIT {limit}" if limit else ""

        # SAFETY: this string substitution is okay since we don't use user data here
        return list(
            cursor.execute(
                "SELECT "
                f"id, stream, posted, content_type, content_json,"
                f" blob_mime_type {with_blob} "
                "FROM content "
                f"WHERE stream IN ({ ','.join(['?'] * len(streams)) }) "
                "ORDER BY posted DESC "
                f"{with_limit}",
                streams,
            )
        )

    def fetch_content_by_id(
        self, content_id: int, fetch_blob=False
    ) -> Optional[FreeFormContent]:
        """Fetch a given piece of content from the database. By default, the blob
        will not be fetched from the database."""
        cursor = self.db.cursor()
        cursor.row_factory = free_form_content.from_sql
        with_blob = ", content_blob" if fetch_blob else ""

        # SAFETY: this string substitution is okay since we don't use user data here
        return next(
            cursor.execute(
                "SELECT "
                f"id, stream, posted, content_type, content_json,"
                f" blob_mime_type {with_blob} "
                "FROM content"
                " WHERE id = ?",
                (content_id,),
            ),
            None,
        )

    def create_department(self, department: Department, insert_people=False) -> int:
        """Create a department and return its row id. If `insert_people` is `True`,
        the people in the `Department` object will also be inserted."""

        assert (
            department.id is None
        ), "Department ID should only be set in create_department"

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO departments (name, bio) VALUES (?, ?)",
                (department.name, department.bio),
            )
            dept_id = cursor.lastrowid

            if insert_people:
                for person in department.people:
                    self.upsert_person(person, dept_id)

            return dept_id

    def fetch_all_departments(
        self, fetch_display_groups=False, fetch_content_streams=False
    ) -> list[Department]:
        """Fetch all departments (but does not fetch their people).

        If fetch_display_groups is True, display groups for this
        Department will also be fetched.

        If fetch_content_streams is True, content streams for this
        Department will also be fetched.
        """
        cursor = self.db.cursor()
        cursor.row_factory = Department.from_sql

        departments = list(
            cursor.execute("SELECT id, name, bio FROM departments ORDER BY id")
        )

        if fetch_display_groups:
            for department in departments:
                department.display_groups = self.fetch_all_display_groups_in_dept(
                    department.id
                )

        if fetch_content_streams:
            streams = self.fetch_all_content_streams()
            for department in departments:
                department.content_streams = streams.by_department.get(department.id)

                for display_group in department.display_groups:
                    display_group.content_streams = streams.by_display_group.get(
                        display_group.id
                    )

        return departments

    def fetch_department_by_id(
        self,
        department_id: int,
        fetch_people=False,
        fetch_display_groups=False,
        fetch_files=False,
    ) -> Optional[Department]:
        """Fetch the given Department by its ID"""
        cursor = self.db.cursor()
        cursor.row_factory = Department.from_sql
        dept = next(
            cursor.execute(
                "SELECT id, name, bio FROM departments WHERE id = ?", (department_id,)
            ),
            None,
        )

        if dept and fetch_people:
            cursor = self.db.cursor()
            cursor.row_factory = Person.from_sql
            dept.people = list(
                cursor.execute(
                    "SELECT id, department, title, "
                    "full_name, position, office_hours,"
                    "office_location, email, phone FROM people "
                    " WHERE department = ?"
                    " ORDER BY id",
                    (department_id,),
                )
            )

        if dept and fetch_files:
            cursor = self.db.cursor()
            cursor.row_factory = File.from_sql
            dept.files = list(
                cursor.execute(
                    "SELECT filename, department_id, file_content, "
                    "mime_type FROM files "
                    " WHERE department_id = ?"
                    " ORDER BY filename",
                    (department_id,),
                )
            )

        if dept and fetch_display_groups:
            dept.display_groups = self.fetch_all_display_groups_in_dept(dept.id)

        return dept

    def create_display_group(self, group: DisplayGroup, department_id: int) -> int:
        """Create a display ground and return its row id."""

        assert group.id is None, "Department ID should only be set in create_department"

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO display_groups (name, department, layout_xml)"
                " VALUES (?, ?, ?)",
                (group.name, department_id, group.layout_xml),
            )
        return cursor.lastrowid

    def fetch_all_display_groups_in_dept(
        self, department_id: int
    ) -> list[DisplayGroup]:
        """Fetch all display groups from the database"""
        cursor = self.db.cursor()
        cursor.row_factory = DisplayGroup.from_sql
        return list(
            cursor.execute(
                "SELECT id, name, layout_xml FROM display_groups WHERE department = ?",
                (department_id,),
            )
        )

    def fetch_display_group_by_id(self, group_id: int) -> list[DisplayGroup]:
        """Fetch the given display group from the database"""
        cursor = self.db.cursor()
        cursor.row_factory = DisplayGroup.from_sql
        return next(
            cursor.execute(
                "SELECT id, name, department, layout_xml FROM display_groups"
                " WHERE id = ?",
                (group_id,),
            ),
            None,
        )

    def upsert_person(self, person: Person, department_id: int) -> int:
        """Insert (or update) the given person into the database
        in the given department and returns the inserted row id"""

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "REPLACE INTO people "
                "(id, department, title, full_name, position, "
                "office_hours, office_location, email, phone)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    person.id,
                    department_id,
                    person.title,
                    person.name,
                    person.position,
                    person.office_hours,
                    person.office_location,
                    person.email,
                    person.phone,
                ),
            )
        return cursor.lastrowid

    def delete_person(self, person_id: int) -> bool:
        """Delete the given person, returning whether it was in the
        database before deletion."""
        with self.db:
            cursor = self.db.cursor()
            cursor.execute("DELETE FROM people WHERE id = ?", (person_id,))
        return cursor.rowcount == 1

    def fetch_person_by_id(self, person_id: int) -> Optional[Person]:
        """Fetch a specific person from the database based on their ID"""
        cursor = self.db.cursor()
        cursor.row_factory = Person.from_sql
        return next(
            cursor.execute(
                "SELECT id, department, title,"
                "full_name, position, office_hours,"
                "office_location, email, phone FROM people"
                " WHERE id = ?",
                (person_id,),
            ),
            None,
        )

    # returns user from db based on email
    def get_user(self, email: str):
        "return user list based on email"
        user_fields = []
        with self.db:
            cursor = self.db.cursor()
            cursor.row_factory = sqlite3.Row
            cursor.execute(
                "SELECT email, screen_name FROM users WHERE email = ?",
                (email,),
            )
            db_user_data = cursor.fetchone()  # Fetch the user data from the database

            user_fields.append(db_user_data[0])
            user_fields.append(db_user_data[1])

        return user_fields

    # checks if the user is in the db
    def user_exists(self, email: str) -> bool:
        """checks the db for the user with specified email, using count > 0"""
        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "SELECT COUNT(*) FROM users " "WHERE email = ?",
                (email,),
            )
            count = cursor.fetchone()[0]  # Fetch the count result
            return count > 0

    def try_login(self, email: str, password: str) -> Optional[User]:
        """Checks if the provided user has the correct credentials,
        returning their details if they do, or None otherwise."""
        with self.db:
            cursor = self.db.cursor()
            cursor.row_factory = sqlite3.Row
            cursor.execute(
                "SELECT email, screen_name, password_hash FROM users WHERE email = ?",
                (email,),
            )
            db_user_data = cursor.fetchone()
            if check_password_hash(db_user_data["password_hash"], password):
                return User(email, db_user_data["screen_name"])
            else:
                return None

    def insert_user(self, email: str, screen_name: str, password: str) -> int:
        """Insert the given user into the user table
        and returns the inserted row id"""

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO users "
                "(email, screen_name, password_hash)"
                " VALUES (?, ?, ?)",
                (
                    email,
                    screen_name,
                    generate_password_hash(password),
                ),
            )
        return cursor.lastrowid

    def create_content_stream(self, stream: ContentStream) -> int:
        """Insert the given content stream into the database and return its ID"""
        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO content_streams (name, department, display_group) "
                "VALUES (?, ?, ?)",
                (stream.name, stream.department, stream.display_group),
            )
        return cursor.lastrowid

    def fetch_all_content_streams(self) -> GroupedContentStreams:
        """Fetch all content streams from the database, grouping them
        using GroupedContentStreams"""
        cursor = self.db.cursor()
        cursor.row_factory = ContentStream.from_sql
        return GroupedContentStreams(
            list(
                cursor.execute(
                    "SELECT id, name, display_group, department FROM content_streams"
                )
            )
        )

    def update_loadshedding_schedule(self, region, schedule):
        """Updates the loadshedding schedule for the given region"""

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "UPDATE loadshedding_schedules SET schedule_json = ? WHERE id= ?",
                (
                    schedule,
                    region,
                ),
            )

    def fetch_loadshedding_schedule(self, region):
        """fetches the loadshedding schedule for the given region"""

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "SELECT schedule_json FROM loadshedding_schedules WHERE id= ?",
                (region,),
            )
            db_user_data = cursor.fetchone()
            return db_user_data

    # uploading of arbitrary files by department:
    def upload_department_file(self, dep_file: File, temp=False) -> int:
        """
        Insert the given file and returns the inserted row id.

        If temp is True, then the file will be deleted in 1 minute.
        """

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "REPLACE INTO files "
                "(filename, mime_type, file_content, department_id, temp)"
                " VALUES (?, ?, ?, ?, ?)",
                (
                    dep_file.name,
                    dep_file.mime_type,
                    dep_file.file_data,
                    dep_file.department_id,
                    temp,
                ),
            )

        Timer(
            60,
            lambda: self.delete_file_by_name_and_department(
                dep_file.name, dep_file.department_id
            ),
        ).start()

        return cursor.lastrowid

    def fetch_file_by_id(self, filename: str, department_id: int) -> Optional[File]:
        """Fetch a given piece of content from the database. By default, the blob
        will not be fetched from the database."""
        cursor = self.db.cursor()
        cursor.row_factory = File.from_sql

        return next(
            cursor.execute(
                "SELECT "
                "department_id, filename, file_content, mime_type "
                "FROM files"
                " WHERE department_id = ? AND filename = ?",
                (
                    department_id,
                    filename,
                ),
            ),
            None,
        )

    def delete_file_by_name_and_department(
        self, filename: str, department_id: int
    ) -> bool:
        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "DELETE FROM files WHERE department_id = ? AND filename = ?",
                (
                    department_id,
                    filename,
                ),
            )
        return cursor.rowcount == 1

    def fetch_all_page_templates(self) -> list[PageTemplate]:
        """Return all page templates in the database"""
        cursor = self.db.cursor()
        cursor.row_factory = PageTemplate.from_sql
        return list(cursor.execute("SELECT id, xml FROM templates"))

    def fetch_page_template_by_id(self, template_id: int) -> Optional[PageTemplate]:
        cursor = self.db.cursor()
        cursor.row_factory = PageTemplate.from_sql
        return next(
            cursor.execute(
                "SELECT id, xml FROM templates WHERE id = ?", (template_id,)
            ),
            None,
        )

    def add_page_template(self, template_xml: str) -> int:
        """Adds the given page template, returning its id"""
        with self.db:
            cursor = self.db.cursor()
            cursor.execute("INSERT INTO templates (xml) VALUES (?)", (template_xml,))
        return cursor.lastrowid
