import time
from pathlib import Path

from server.util import combine

data_folder = Path(__file__).parent / "data"


def test_post_local_image(client, test_png_data, test_jpg_data):
    """Test that local images can be posted (both JPG and PNG)"""

    jpg_res = client.post(
        "/api/content",
        data={
            "type": "local_image",
            "image_data": open(data_folder / "test.jpg", "rb"),
            "content_stream": "1",
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
            "content_stream": "1",
        },
    )

    assert png_res.json["id"] != jpg_res.json["id"], "ID should be unique"
    assert (
        png_res.json["posted"] > jpg_res.json["posted"]
    ), "PNG should be posted after JPG"

    res = client.get("/api/content?stream=1")
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
    res = client.post(
        "/api/content",
        data={"type": "remote_image", "src": "testurl", "content_stream": "1"},
    )
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    res = client.get("/api/content?stream=1")
    content = res.json["content"]
    assert len(content) == 1

    assert content[0]["src"] == "testurl"


def test_post_link(client):
    res = client.post(
        "/api/content", data={"type": "link", "url": "testurl", "content_stream": "1"}
    )
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    res = client.get("/api/content?stream=1")
    content = res.json["content"]
    assert len(content) == 1

    assert content[0]["url"] == "testurl"


def test_post_captioned_link(client):
    res = client.post(
        "/api/content",
        data={
            "type": "link",
            "url": "testurl",
            "caption_body": "Test caption",
            "content_stream": "1",
        },
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
            "content_stream": "1",
        },
    )
    assert res.json["id"] is not None
    assert res.json["posted"] is not None

    res = client.get("/api/content?stream=1")
    content = res.json["content"]
    assert len(content) == 2

    assert content[1]["caption"]["body"] == "Test caption"
    assert content[0]["caption"]["title"] == "Title"
    assert content[0]["caption"]["body"] == "Body"


def test_can_access_public_routes(client):
    assert client.get("/").status == "200 OK"
    assert client.get("/static/config.css").status == "200 OK"
    assert client.get("/static/config.css").status == "200 OK"


def assert_redirects_login(res):
    assert res.status == "302 FOUND"
    assert res.location.startswith("/login/")


def test_cant_access_private_routes(unauthorized_client):
    client = unauthorized_client
    assert_redirects_login(client.get("/config/"))
    assert_redirects_login(client.post("/api/content", data={}))
    assert_redirects_login(client.post("/api/departments/1/people", data={}))
    assert_redirects_login(client.delete("/api/departments/1/people/1", data={}))
    assert_redirects_login(client.post("/api/departments/1/displays", data={}))
    assert_redirects_login(client.post("/api/content_streams", data={}))


def test_post_text(client):
    """Test that content can be posted over the web API and then
    successfully retrieved"""
    res = client.get("/api/content?stream=1")

    assert res.json == {"content": []}

    to_post = [
        {
            "type": "text",
            "title": "title1",
            "body": "body1",
            "content_stream": "1",
        },
        {
            "type": "text",
            "title": "title2",
            "body": "body2",
            "content_stream": "1",
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

    res = client.get("/api/content?stream=1")
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
    for route in ["people", "people/add", "people/20", "display/add"]:
        path = f"/config/departments/10000/{route}"
        assert client.get(path).status == "404 NOT FOUND", f"Expected 404 from {path}"

    assert (
        client.get("/display/10000/1/").status == "404 NOT FOUND"
    ), "Expected 404 from /display/10000/1"


def test_post_content_stream(client):
    stream_ids = []
    for target in [{"department": 1}, {"display": 1}, dict()]:
        res = client.post(
            "/api/content_streams",
            data=combine(target, {"name": "stream", "permissions": "writeable"}),
        )
        assert res.status == "200 OK"
        stream_ids.append(res.json["id"])

    content_ids = dict()
    for stream in stream_ids:
        data = {
            "type": "text",
            "title": "title1",
            "body": "body1",
            "content_stream": stream,
        }
        res = client.post("/api/content", data=data)
        assert res.status == "200 OK"
        content_ids[stream] = res.json["id"]

    assert len(client.get("/api/content").json["content"]) == 0

    for stream, content_id in content_ids.items():
        res = client.get(f"/api/content?stream={stream}")
        assert res.status == "200 OK"
        stream_content = res.json["content"]
        assert len(stream_content) == 1
        assert stream_content[0]["id"] == content_id

    stream_1_and_2 = client.get(
        f"/api/content?stream={stream_ids[0]}&stream={stream_ids[1]}"
    ).json["content"]
    assert len(stream_1_and_2) == 2
    assert any(
        content["id"] == content_ids[stream_ids[0]] for content in stream_1_and_2
    )
    assert any(
        content["id"] == content_ids[stream_ids[1]] for content in stream_1_and_2
    )

    all_streams = client.get(
        f"/api/content?{'&'.join(f'stream={stream}' for stream in stream_ids)}"
    ).json["content"]
    assert len(all_streams) == 3
