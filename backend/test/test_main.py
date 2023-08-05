import pytest
from server.main import create_app


@pytest.fixture()
def app():
    app = create_app()
    app.config.update(
        {
            "TESTING": True,
        }
    )

    # setup goes here

    yield app

    # clean up goes here


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


def test_config_index(client):
    response = client.get("/config/")
    assert b"<p>Hello, config view!</p>" in response.data


def test_display_index(client):
    response = client.get("/display/")
    assert b"<p>Hello, display view!</p>" in response.data
