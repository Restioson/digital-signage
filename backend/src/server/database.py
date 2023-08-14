import json
import sqlite3
import time
from typing import Optional
import flask
from server import free_form_content
from server.free_form_content import FreeFormContent

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
            print(db_path)
            db = flask.g._database = DatabaseController(sqlite3.connect(db_path))
        return db

    @staticmethod
    def teardown():
        db = flask.g.pop("_database", None)
        if db is not None:
            db.close()

    def create_db(self):
        app = flask.current_app

        # Wipe tables first if testing to get a clean slate
        if app.config["TESTING"]:
            print("Dropping tables")
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

        with self.db:
            cursor = self.db.cursor()
            cursor.execute(
                "INSERT INTO content (posted, content_type, content_json)"
                " VALUES (?, ?, ?)",
                (
                    post_timestamp,
                    content.type(),
                    json.dumps(content.to_db_json()),
                ),
            )
        return cursor.lastrowid, post_timestamp

    def fetch_all_content(self) -> list[FreeFormContent]:
        cursor = self.db.cursor()
        cursor.row_factory = free_form_content.from_sql
        return list(
            cursor.execute(
                "SELECT id, posted, content_type, content_json FROM content "
                "ORDER BY posted DESC"
            )
        )

    def fetch_content_by_id(self, content_id: int) -> Optional[FreeFormContent]:
        cursor = self.db.cursor()
        cursor.row_factory = free_form_content.from_sql
        return next(
            cursor.execute(
                "SELECT id, posted, content_type, content_json FROM content"
                " WHERE id = ?",
                (content_id,),
            ),
            None,
        )

    def close(self):
        self.db.close()
