import sqlite3

import pytest

from server.database import DatabaseController
from server.main import create_app


@pytest.fixture()
def app():
    app = create_app(testing=True)
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


@pytest.fixture()
def database(app):
    db = DatabaseController(sqlite3.connect(":memory:"))

    with app.app_context():
        db.create_db()

    yield db
