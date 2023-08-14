import sqlite3
import flask

from server.free_form_content import FreeFormContent

DATABASE = "campusign.db"
DATABASE_TEST = "campusign.test.db"


class DatabaseController:
    def __init__(self, db):
        self.db = db

    @staticmethod
    def get():
        db = flask.g.get("_database", None)
        if db is None:
            db = flask.g._database = DatabaseController(sqlite3.connect(DATABASE))
        return db

    @staticmethod
    def teardown():
        db = flask.g.pop("_database", None)
        if db is not None:
            db.close()

    @staticmethod
    def create_db(app, testing=False):
        db_path = DATABASE if not testing else DATABASE_TEST
        db = sqlite3.connect(db_path)

        # Wipe tables first if testing to get a clean slate
        if testing:
            with app.open_resource("sql/drop_tables.sql", mode="r") as f:
                db.cursor().executescript(f.read())

        # Create necessary tables
        with app.open_resource("sql/schema.sql", mode="r") as f:
            db.cursor().executescript(f.read())

    def post_content(self, content: FreeFormContent):
        pass

    def close(self):
        self.db.close()
