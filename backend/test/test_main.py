import pytest
from server.main import create_app


@pytest.fixture()
def app():
    app = create_app(testing=True)
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


def test_api_content(client):
    res = client.get("/api/content")
    print(res)
    assert res.json == {
        "content": [
            {"title": "Test 1", "body": "This is a test"},
            {"title": "Test 2", "body": "This is a second test"},
        ]
    }

    res = client.post(
        "/api/content",
        data={
            "type": "text",
            "title": "titleX",
            "body": "bodyX",
        },
    )

    assert res.json == {"id": None, "title": "titleX", "body": "bodyX"}
