import json
import time
import typing

from server.database import DatabaseController
from server.free_form_content import Text


def test_post_and_fetch_text(database: DatabaseController):
    assert (
        len(database.fetch_all_content()) == 0
    ), "Database should start with no content"

    # Insert a piece of content
    content1_to_insert = Text("Test title 123", "test body")
    content1_id, content1_posted = database.post_content(content1_to_insert)
    assert content1_id is not None, "post_content should return a content ID"

    # Fetch content by its ID
    fetched_content1 = typing.cast(Text, database.fetch_content_by_id(content1_id))
    assert fetched_content1.type() == "text", "inserted content 1 should be text"
    assert (
        fetched_content1.title == content1_to_insert.title
    ), "inserted content 1's title should be correct"
    assert (
        fetched_content1.body == content1_to_insert.body
    ), "inserted content 1's body should be correct"

    # Fetch content using fetch_all_content()
    all_content = database.fetch_all_content()
    assert len(all_content) == 1
    fetched_content1 = typing.cast(Text, all_content[0])
    assert fetched_content1.type() == "text", "inserted content 1 should be text"
    assert (
        fetched_content1.title == content1_to_insert.title
    ), "inserted content 1's title should be correct"
    assert (
        fetched_content1.body == content1_to_insert.body
    ), "inserted content 1's body should be correct"

    content1_content_json = next(
        database.db.cursor().execute(
            "SELECT content_json FROM content WHERE id = ?", (content1_id,)
        )
    )[0]
    assert json.loads(content1_content_json) == {
        "title": "Test title 123",
        "body": "test body",
    }

    # Wait 1s to force content2 to be posted later than content1
    time.sleep(1)

    # Insert a second piece of content
    content2_to_insert = Text("Test title 456", "test body 2")
    content2_id, content2_posted = database.post_content(content2_to_insert)
    assert content2_id is not None, "post_content should return a content ID"
    assert (
        content1_posted < content2_posted
    ), "content2 should be posted later than content1"

    # Fetch content by its ID
    fetched_content2 = typing.cast(Text, database.fetch_content_by_id(content2_id))
    assert fetched_content2.type() == "text", "inserted content 2 should be text"
    assert (
        fetched_content2.title == content2_to_insert.title
    ), "inserted content 2's title should be correct"
    assert (
        fetched_content2.body == content2_to_insert.body
    ), "inserted content 2's body should be correct"

    # Fetch content using fetch_all_content()
    all_content = database.fetch_all_content()
    assert len(all_content) == 2

    fetched_content1 = typing.cast(Text, all_content[1])
    assert fetched_content1.type() == "text", "inserted content 1 should be text"
    assert (
        fetched_content1.title == content1_to_insert.title
    ), "inserted content 1's title should be correct"
    assert (
        fetched_content1.body == content1_to_insert.body
    ), "inserted content 1's body should be correct"

    fetched_content2 = typing.cast(Text, all_content[0])
    assert fetched_content2.type() == "text", "inserted content 2 should be text"
    assert (
        fetched_content2.title == content2_to_insert.title
    ), "inserted content 2's title should be correct"
    assert (
        fetched_content2.body == content2_to_insert.body
    ), "inserted content 2's body should be correct"
