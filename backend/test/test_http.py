import time
from pathlib import Path

data_folder = Path(__file__).parent / "data"


def test_post_local_image(client, test_png_data, test_jpg_data):
    """Test that local images can be posted (both JPG and PNG)"""

    jpg_res = client.post(
        "/api/content",
        data={
            "type": "local_image",
            "image_data": open(data_folder / "test.jpg", "rb"),
        },
    )

    assert jpg_res.json["id"] is not None, "ID should not be None"

    # Force png to be posted after jpg
    time.sleep(1)

    png_res = client.post(
        "/api/content",
        data={
            "type": "local_image",
            "image_data": open(data_folder / "test.png", "rb"),
        },
    )

    assert png_res.json["id"] != jpg_res.json["id"], "ID should be unique"
    assert (
        png_res.json["posted"] > jpg_res.json["posted"]
    ), "PNG should be posted after JPG"

    res = client.get("/api/content")
    content = res.json["content"]
    assert len(content) == 2

    assert content[0]["type"] == "local_image", "content type should be local_image"
    assert "image_data" not in content[0], "/api/content should not return blob data"
    assert content[1]["type"] == "local_image", "content type should be local_image"
    assert "image_data" not in content[1], "/api/content should not return blob data"

    assert content[0]["id"] != content[1]["id"], "ID should be unique"
    assert content[0]["posted"] > content[1]["posted"], "PNG should be posted after JPG"

    fetched_jpg = client.get(f"/api/content/{jpg_res.json['id']}/blob")
    assert fetched_jpg.data == test_jpg_data, "Data should match after roundtrip"
    assert fetched_jpg.content_type == "image/jpeg", "content-type must be correct"

    fetched_png = client.get(f"/api/content/{png_res.json['id']}/blob")
    assert fetched_png.data == test_png_data, "Data should match after roundtrip"
    assert fetched_png.content_type == "image/png", "content-type must be correct"


def test_post_remote_image(client):
    res = client.post("/api/content", data={"type": "remote_image", "src": "testurl"})
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    res = client.get("/api/content")
    content = res.json["content"]
    assert len(content) == 1

    assert content[0]["src"] == "testurl"


def test_post_link(client):
    res = client.post("/api/content", data={"type": "link", "url": "testurl"})
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    res = client.get("/api/content")
    content = res.json["content"]
    assert len(content) == 1

    assert content[0]["url"] == "testurl"


def test_post_captioned_link(client):
    res = client.post(
        "/api/content",
        data={"type": "link", "url": "testurl", "caption_body": "Test caption"},
    )
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    time.sleep(1)

    res = client.post(
        "/api/content",
        data={"type": "link", "url": "testurl", "caption_title": "Becomes body"},
    )
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    time.sleep(1)

    res = client.post(
        "/api/content",
        data={
            "type": "link",
            "url": "testurl",
            "caption_title": "Title",
            "caption_body": "Body",
        },
    )
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    res = client.get("/api/content")
    content = res.json["content"]
    assert len(content) == 3

    assert content[2]["caption"]["body"] == "Test caption"
    assert content[1]["caption"]["body"] == "Becomes body"
    assert content[0]["caption"]["title"] == "Title"
    assert content[0]["caption"]["body"] == "Body"


def test_post_text(client):
    """Test that content can be posted over the web API and then
    successfully retrieved"""
    res = client.get("/api/content")

    assert res.json == {"content": []}

    to_post = [
        {
            "type": "text",
            "title": "title1",
            "body": "body1",
        },
        {
            "type": "text",
            "title": "title2",
            "body": "body2",
        },
    ]

    res1 = client.post(
        "/api/content",
        data=to_post[0],
    )

    assert res1.json["id"] is not None
    assert res1.json["posted"] is not None

    # Wait 1s to force content2 to be posted later than content1
    time.sleep(1)

    res2 = client.post(
        "/api/content",
        data=to_post[1],
    )

    assert res2.json["id"] != res1.json["id"]
    assert res2.json["posted"] > res1.json["posted"]

    res = client.get("/api/content")
    content = res.json["content"]
    assert len(content) == 2

    assert content[0]["type"] == to_post[1]["type"]
    assert content[0]["title"] == to_post[1]["title"]
    assert content[0]["body"] == to_post[1]["body"]
    assert content[1]["type"] == to_post[0]["type"]
    assert content[1]["title"] == to_post[0]["title"]
    assert content[1]["body"] == to_post[0]["body"]

    assert content[0]["id"] != content[1]["id"]
    assert content[0]["posted"] > content[1]["posted"]


def test_invalid_dept_should_404(client):
    for route in ["lecturers", "lecturers/add", "lecturers/20", "display_group/add"]:
        path = f"/config/departments/10000/{route}"
        assert client.get(path).status == "404 NOT FOUND", f"Expected 404 from {path}"

    assert (
        client.get("/display/10000/1").status == "404 NOT FOUND"
    ), "Expected 404 from /display/10000/1"
