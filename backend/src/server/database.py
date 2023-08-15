import json
import sqlite3
import time
from typing import Optional
import flask
from server import free_form_content
from server import department_info
from server.free_form_content import FreeFormContent, BinaryContent
from server.department_info import departmentinfo

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

    """ Newly added stuff """
    """ table - department_info """
    """ posted,json form{id, name, title, position, office_hours, office_location, email, phone} """
    def post_department_info(self, department_info: departmentinfo) -> (int, int):
        """Insert the given departmentinfo and returns the inserted row id"""
        assert department_info.posted is None, (
            "departmentinfo.posted should only be set in"
            "DatabaseController.post_department_info"
        )

        post_timestamp = int(time.time())

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO department_info (posted , content_json)"
                " VALUES (?, ?)",
                (
                    post_timestamp,
                    json.dumps(department_info.to_db_json()),
                ),
            )
        return cursor.lastrowid, post_timestamp

    def fetch_all_department_info(self) -> list[departmentinfo]:
        cursor = self.db.cursor()
        cursor.row_factory = department_info.from_sql
        return list(
            cursor.execute(
                "SELECT id, posted, department_info_json FROM department_info "
                "ORDER BY posted DESC"
            )
        )

    def fetch_department_info_by_id(self, department_info_id: int) -> Optional[departmentinfo]:
        cursor = self.db.cursor()
        cursor.row_factory = department_info.from_sql
        return next(
            cursor.execute(
                "SELECT id, posted, department_info_json FROM department_info"
                " WHERE id = ?",
                (department_info_id,),
            ),
            None,
        )

    """ Newly added stuff """
