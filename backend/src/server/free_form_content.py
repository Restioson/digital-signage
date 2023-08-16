from datetime import datetime
import json
import sqlite3
from abc import abstractmethod, ABC
from typing import Optional
import PIL.Image
import io


class FreeFormContent(ABC):
    """A piece of 'free-form' content posted to a sign. In this case,
    'free-form' means that the user directly submitted the data for
    this post to the sign, as opposed to referring to it via an external source,
    such as through a calendar widget."""

    def __init__(self, content_id: Optional[int], posted: Optional[datetime]):
        self.id = content_id
        self.posted = posted

    @abstractmethod
    def to_db_json(self) -> dict:
        """Convert this content to JSON in order to be serialized to the database"""
        raise NotImplementedError

    @abstractmethod
    def type(self) -> str:
        """The type of this content. One of 'link', 'text', 'image', or 'video'"""
        raise NotImplementedError

    def to_http_json(self) -> dict:
        """Convert this content to JSON in order to be sent over HTTP"""

        assert self.id is not None, "ID must be present when serializing to HTTP json"
        assert (
            self.posted is not None
        ), "Post timestamp must be present when serializing to HTTP json"

        http_attrs = {
            "type": self.type(),
            "id": self.id,
            "posted": int(self.posted.timestamp()),
        }

        http_attrs.update(self.to_db_json())
        return http_attrs


def from_dict_and_files(form: dict, files: dict) -> FreeFormContent:
    """Deserialize the appropriate content object from the given dictionary and files.
    Throws UnknownContentError if the content type is not 'text'.

    The `form` dict might contain data from a web form or the `content_json` column
    from the `content` table in the database, while the `files` dictionary might
    contain image or video data.

    The resulting content will not have the post or ID initialised.
    """
    content_type = form["type"]
    if content_type == "text":
        return Text(form["title"], form["body"])
    elif content_type == "remote_image":
        return RemoteImage(form["src"])
    elif content_type == "local_image":
        image_data = files["image_data"].read()
        image = PIL.Image.open(io.BytesIO(image_data))
        image.verify()
        mime = image.get_format_mimetype()
        return LocalImage(mime, image_data)
    elif content_type == "link":
        return Link(form["url"])
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
    blob_data = row["content_blob"] if "content_blob" in row.keys() else None
    mime = row["blob_mime_type"]

    if content_type == "text":
        assert blob_data is None, "Text content should not have any blob data"
        return Text(data["title"], data["body"], content_id=content_id, posted=posted)
    elif content_type == "local_image":
        return LocalImage(mime, blob_data, content_id=content_id, posted=posted)
    elif content_type == "remote_image":
        return RemoteImage(data["src"], content_id=content_id, posted=posted)
    elif content_type == "link":
        return Link(data["url"], content_id=content_id, posted=posted)
    else:
        raise UnknownContentError("Unknown content type", content_type)


class UnknownContentError(Exception):
    """The type of content passed to `from_dict` was unknown"""

    def __init__(self, message, unk_type):
        super().__init__(message)
        self.unk_type = unk_type


class Text(FreeFormContent):
    """A text post with a title and body"""

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

    def type(self) -> str:
        return "text"

    def to_db_json(self) -> dict:
        return {"title": self.title, "body": self.body}


class RemoteImage(FreeFormContent):
    """An image post with its data stored on a remote server"""

    def __init__(
        self,
        src: str,
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(content_id, posted)
        self.src = src

    def type(self) -> str:
        return "remote_image"

    def to_db_json(self) -> dict:
        return {"src": self.src}


class BinaryContent(FreeFormContent, ABC):
    def __init__(
        self,
        mime_type: str,
        blob: bytes,
        content_id: Optional[int],
        posted: Optional[datetime],
    ):
        super().__init__(content_id, posted)
        self.mime_type = mime_type
        self.blob = blob


class LocalImage(BinaryContent):
    """An image post with its data stored directly in the database"""

    def __init__(
        self,
        mime_type: str,
        image_data: bytes,
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(mime_type, image_data, content_id, posted)
        self.image_data = image_data
        self.mime_type = mime_type

    def type(self) -> str:
        return "local_image"

    def to_db_json(self) -> dict:
        return {}


class Link(FreeFormContent):
    def __init__(
        self,
        url: str,
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(content_id, posted)
        self.url = url

    def type(self) -> str:
        return "link"

    def to_db_json(self) -> dict:
        return {"url": self.url}
