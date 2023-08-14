from datetime import datetime
import json
import sqlite3
from abc import abstractmethod, ABC
from typing import Optional


class FreeFormContent(ABC):
    def __init__(self, content_id: Optional[int], posted: Optional[datetime]):
        self.id = content_id
        self.posted = posted

    @abstractmethod
    def to_db_json(self) -> dict:
        """Convert this content to JSON in order to be serialized to the database"""
        raise NotImplementedError

    @abstractmethod
    def to_http_json(self) -> dict:
        """Convert this content to JSON in order to be sent over HTTP"""
        raise NotImplementedError

    @abstractmethod
    def type(self) -> str:
        """The type of this content. One of 'link', 'text', 'image', or 'video'"""
        raise NotImplementedError


def from_form(form: dict) -> FreeFormContent:
    """Parse the given Flask form data and return the appropriate content type.
    Throws UnknownContentError if the content type is not 'text'"""
    if form["type"] == "text":
        return Text(form["title"], form["body"])
    else:
        raise UnknownContentError("Unknown content type", form["type"])


def from_sql(cursor: sqlite3.Cursor, row: tuple) -> FreeFormContent:
    """Parse the given SQL row and return the appropriate content type.
    Throws UnknownContentError if the content type is not 'text'"""
    row = sqlite3.Row(cursor, row)
    content_type = row["content_type"]
    content_id = row["id"]
    posted = datetime.fromtimestamp(row["posted"])
    data = json.loads(row["content_json"])

    if content_type == "text":
        return Text(data["title"], data["body"], content_id=content_id, posted=posted)
    else:
        raise UnknownContentError("Unknown content type", content_type)


class UnknownContentError(Exception):
    """The type of content passed to `from_form` was unknown"""

    def __init__(self, message, unk_type):
        super().__init__(message)
        self.unk_type = unk_type


class Text(FreeFormContent):
    def type(self) -> str:
        return "text"

    def to_db_json(self) -> dict:
        return {"title": self.title, "body": self.body}

    def to_http_json(self) -> dict:
        return {
            "type": self.type(),
            "id": self.id,
            "posted": int(self.posted.timestamp()),
            "title": self.title,
            "body": self.body,
        }

    def __init__(
        self,
        title: str,
        body: str,
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(content_id, posted)
        self.title = title
        self.body = body
