import sqlite3
from pathlib import Path

import pytest

from server.database import DatabaseController
from server.main import create_app

data_folder = Path(__file__).parent / "data"


@pytest.fixture()
def app():
    app = create_app(testing=True)
    yield app


@pytest.fixture()
def unauthorized_client(app):
    return app.test_client()


@pytest.fixture()
def client(app):
    client = app.test_client()

    client.post(
        "/api/register",
        data={
            "email": "example@example.com",
            "screen_name": "User",
            "password": "password123",
        },
    )
    return client


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


@pytest.fixture()
def database(app):
    db = DatabaseController(sqlite3.connect(":memory:"))

    with app.app_context():
        db.create_db()

    yield db


@pytest.fixture()
def test_png_data():
    with open(data_folder / "test.png", "rb") as f:
        data = f.read()
    return data


@pytest.fixture()
def test_jpg_data():
    with open(data_folder / "test.jpg", "rb") as f:
        data = f.read()
    return data
