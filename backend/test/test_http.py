import time


def test_api_content(client):
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

    print(content)
    assert content[0]["type"] == to_post[1]["type"]
    assert content[0]["title"] == to_post[1]["title"]
    assert content[0]["body"] == to_post[1]["body"]
    assert content[1]["type"] == to_post[0]["type"]
    assert content[1]["title"] == to_post[0]["title"]
    assert content[1]["body"] == to_post[0]["body"]

    assert content[0]["id"] != content[1]["id"]
    assert content[0]["posted"] > content[1]["posted"]
