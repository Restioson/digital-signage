import json
import sqlite3
import time
from typing import Optional
import flask
from server import free_form_content
from server.display_group import DisplayGroup
from server.free_form_content import FreeFormContent, BinaryContent
from server.department import Lecturer, Department

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
                "INSERT INTO departments (name, bio) VALUES (?, ?)",
                (department.name, department.bio),
            )
            dept_id = cursor.lastrowid

            if insert_lecturers:
                for lecturer in department.lecturers:
                    self.upsert_lecturer(lecturer, dept_id)

            return dept_id

    def fetch_all_departments(self, fetch_display_groups=False) -> list[Department]:
        """Fetch all departments (but does not fetch their lecturers).

        If fetch_display_groups is True, display groups for this
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

        return departments

    def fetch_department_by_id(
        self, department_id: int, fetch_lecturers=False, fetch_display_groups=False
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

        if dept and fetch_lecturers:
            cursor = self.db.cursor()
            cursor.row_factory = Lecturer.from_sql
            dept.lecturers = list(
                cursor.execute(
                    "SELECT id, department, title, "
                    "full_name, position, office_hours,"
                    "office_location,email,phone FROM lecturers "
                    " WHERE department = ?"
                    " ORDER BY id",
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
                "INSERT INTO display_groups (name, department, layout_json)"
                " VALUES (?, ?, ?)",
                (group.name, department_id, json.dumps(group.layout_json)),
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
                "SELECT id, name, layout_json FROM display_groups WHERE department = ?",
                (department_id,),
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

    def upsert_lecturer(self, lecturer: Lecturer, department_id: int) -> int:
        """Insert (or update) the given lecturer into the database
        in the given department and returns the inserted row id"""

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "REPLACE INTO lecturers "
                "(id, department, title, full_name, position, "
                "office_hours, office_location, email, phone)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    lecturer.id,
                    department_id,
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
