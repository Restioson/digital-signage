import json
import sqlite3
import time
from typing import Optional
import flask
from server import free_form_content
from server.display_group import DisplayGroup
from server.free_form_content import FreeFormContent, BinaryContent
from server.department import Lecturer, Department
from server.User import User

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
                "(posted, content_type, content_json, blob_mime_type, content_blob)"
                " VALUES (?, ?, ?, ?, ?)",
                (
                    post_timestamp,
                    content.type(),
                    json.dumps(content.to_db_json()),
                    mime,
                    blob,
                ),
            )
        return cursor.lastrowid, post_timestamp

    def fetch_all_content(self, fetch_blob=False) -> list[FreeFormContent]:
        """Fetch all content from the database. By default, the blob
        will not be fetched from the database."""
        cursor = self.db.cursor()
        cursor.row_factory = free_form_content.from_sql
        with_blob = ", content_blob" if fetch_blob else ""

        # SAFETY: this string substitution is okay since we don't use user data here
        return list(
            cursor.execute(
                "SELECT "
                f"id, posted, content_type, content_json, blob_mime_type {with_blob} "
                "FROM content "
                "ORDER BY posted DESC"
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
                f"id, posted, content_type, content_json, blob_mime_type {with_blob} "
                "FROM content"
                " WHERE id = ?",
                (content_id,),
            ),
            None,
        )

    def create_department(self, department: Department, insert_lecturers=False) -> int:
        """Create a department and return its row id. If `insert_lecturers` is `True`,
        the lecturers in the `Department` object will also be inserted."""

        assert (
            department.id is None
        ), "Department ID should only be set in create_department"

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO department (name, bio) VALUES (?, ?)",
                (department.name, department.bio),
            )
            dept_id = cursor.lastrowid

            if insert_lecturers:
                for lecturer in department.lecturers:
                    self.insert_lecturer(lecturer)

            return dept_id

    # TODO(https://github.com/Restioson/digital-signage/issues/74): once we
    # associate lecturers with depts, we can fetch a dept's lecturers here, too
    def fetch_all_departments(self) -> list[Department]:
        cursor = self.db.cursor()
        cursor.row_factory = Department.from_sql
        return list(cursor.execute("SELECT id, name, bio FROM department ORDER BY id"))

    def create_display_group(self, group: DisplayGroup) -> int:
        """Create a display ground and return its row id."""

        assert group.id is None, "Department ID should only be set in create_department"

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO display_groups (name, department, layout_json)"
                " VALUES (?, ?, ?)",
                (group.name, group.department_id, json.dumps(group.layout_json)),
            )
        return cursor.lastrowid

    def fetch_all_display_groups(self) -> list[DisplayGroup]:
        """Fetch all display groups from the database"""
        cursor = self.db.cursor()
        cursor.row_factory = DisplayGroup.from_sql
        return list(
            cursor.execute(
                "SELECT id, name, department, layout_json FROM display_groups"
            )
        )

    def fetch_display_group_by_id(self, group_id: int) -> list[DisplayGroup]:
        """Fetch the given display group from the database"""
        cursor = self.db.cursor()
        cursor.row_factory = DisplayGroup.from_sql
        return next(
            cursor.execute(
                "SELECT id, name, department, layout_json FROM display_groups"
                " WHERE id = ?",
                (group_id,),
            ),
            None,
        )

    def fetch_all_lecturers(self) -> list[Lecturer]:
        """Fetch all the departments lecturers from the database"""
        cursor = self.db.cursor()
        cursor.row_factory = Lecturer.from_sql
        return list(
            cursor.execute(
                "SELECT id, department, title, "
                "full_name, position, office_hours,"
                "office_location,email,phone FROM lecturers "
                " ORDER BY id"
            )
        )

    def upsert_lecturer(self, lecturer: Lecturer) -> int:
        """Insert (or update) the given lecturer into the database
        and returns the inserted row id"""

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "REPLACE INTO lecturers "
                "(id, department, title, full_name, position, "
                "office_hours, office_location, email, phone)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    lecturer.id,
                    lecturer.department,
                    lecturer.title,
                    lecturer.name,
                    lecturer.position,
                    lecturer.office_hours,
                    lecturer.office_location,
                    lecturer.email,
                    lecturer.phone,
                ),
            )
        return cursor.lastrowid

    def delete_lecturer(self, lecturer_id: int) -> bool:
        """Delete the given lecturer, returning whether it was in the
        database before deletion."""
        with self.db:
            cursor = self.db.cursor()
            cursor.execute("DELETE FROM lecturers WHERE id = ?", (lecturer_id,))
        return cursor.rowcount == 1

    def fetch_lecturer_by_id(self, lecturer_id: int) -> Optional[Lecturer]:
        """Fetch a specific lecturer from the database based on their ID"""
        cursor = self.db.cursor()
        cursor.row_factory = Lecturer.from_sql
        return next(
            cursor.execute(
                "SELECT id, department, title,"
                "full_name, position, office_hours,"
                "office_location, email, phone FROM lecturers"
                " WHERE id = ?",
                (lecturer_id,),
            ),
            None,
        )

    # TO-DO to add method that validates user is not in db already based on email.
    # TO-DO add actual login functionallity (compare username and password to DB)

    # checks if the user is in the db
    def user_exists(self, user: User) -> bool:
        """checks the db for the user with specified email, using count > 0"""
        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "SELECT COUNT(*) FROM users " "WHERE email = ?",
                (user.email,),
            )
            count = cursor.fetchone()[0]  # Fetch the count result
            return count == 0

    def insert_user(self, user: User) -> int:
        """Insert the given user into the user table
        and returns the inserted row id"""

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO users "
                "(email, screen_name, password)"
                " VALUES (?, ?, ?)",
                (user.email, user.screen_name, user.password),
            )
        return cursor.lastrowid
