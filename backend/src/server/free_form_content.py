from datetime import datetime
import json
import sqlite3
from abc import abstractmethod, ABC
from typing import Optional
import PIL.Image
import io


def combine(obj1: dict, obj2: dict) -> dict:
    """Combine two disjoint dictionaries and return it.
    This is a simple helper method for a common pattern
    """

    assert obj1.keys().isdisjoint(obj2), "dicts passed to combine() must be disjoint"
    combined = obj1.copy()
    combined.update(obj2)
    return combined


class FreeFormContent(ABC):
    """A piece of 'free-form' content posted to a sign. In this case,
    'free-form' means that the user directly submitted the data for
    this post to the sign, as opposed to referring to it via an external source,
    such as through a calendar widget.
    """

    def __init__(self, content_id: Optional[int], posted: Optional[datetime]):
        self.id = content_id
        self.posted = posted

    @abstractmethod
    def to_db_json(self) -> dict:
        """Convert this content to JSON in order to be serialized to the database"""
        raise NotImplementedError

    @abstractmethod
    def type(self) -> str:
        """The type of this content. One of 'link', 'text', 'local_image',
        or 'remote_image'
        """
        raise NotImplementedError

    def to_http_json(self) -> dict:
        """Convert this content to JSON in order to be sent over HTTP"""

        assert self.id is not None, "ID must be present when serializing to HTTP json"
        assert (
            self.posted is not None
        ), "Post timestamp must be present when serializing to HTTP json"

        return combine(
            self.to_db_json(),
            {
                "type": self.type(),
                "id": self.id,
                "posted": int(self.posted.timestamp()),
            },
        )


def form_has_field(form: dict, field: str) -> bool:
    """Check if the form has a field and the field is not None/empty string"""
    return field in form and form[field]


def from_form(form: dict, files: dict) -> FreeFormContent:
    """Deserialize the appropriate content object from the given form dictionary
    and files. Throws UnknownContentError if the content type is not 'text',
    'remote_image', 'local_image', or 'link'.

    The resulting content will not have the post or ID initialised.
    """

    form = dict(form)  # Make form mutable

    content_type = form["type"]

    # Replace captions with title only (empty or missing body) to be body only,
    # as this is probably what the user wanted
    has_title = form_has_field(form, "caption_title")
    has_body = form_has_field(form, "caption_body")
    if has_title and not has_body:
        form["caption_body"] = form["caption_title"]
        del form["caption_title"]

    caption = None
    if form_has_field(form, "caption_body"):
        caption = Text(
            form["caption_title"] if "caption_title" in form else None,
            form["caption_body"],
        )

    if content_type == "text":
        return Text(form["title"], form["body"])
    elif content_type == "remote_image":
        return RemoteImage(form["src"], caption)
    elif content_type == "local_image":
        # Load and verify the file, throwing an error if it isn't a valid image
        image_data = files["image_data"].read()
        image = PIL.Image.open(io.BytesIO(image_data))
        image.verify()

        mime = image.get_format_mimetype()
        return LocalImage(mime, image_data, caption)
    elif content_type == "link":
        return Link(form["url"], caption)
    elif content_type == "qrcode_content":
        return QRcodeContent(form["url"], caption)
    else:
        raise UnknownContentError("Unknown content type", form["type"])


def from_sql(cursor: sqlite3.Cursor, row: tuple) -> FreeFormContent:
    """Parse the given SQL row and return the appropriate content type.
    Throws UnknownContentError if the content type is not 'text',
    'remote_image', 'local_image', or 'link'.
    """

    row = sqlite3.Row(cursor, row)
    content_type = row["content_type"]
    content_id = row["id"]
    posted = datetime.fromtimestamp(row["posted"])
    data = json.loads(row["content_json"])
    blob_data = row["content_blob"] if "content_blob" in row.keys() else None
    mime = row["blob_mime_type"]

    caption = None
    if "caption" in data:
        title = data["caption"]["title"] if "title" in data["caption"] else None
        caption = Caption(title, data["caption"]["body"])

    if content_type == "text":
        assert blob_data is None, "Text content should not have any blob data"
        return Text(data["title"], data["body"], content_id=content_id, posted=posted)
    elif content_type == "local_image":
        return LocalImage(
            mime, blob_data, caption, content_id=content_id, posted=posted
        )
    elif content_type == "remote_image":
        return RemoteImage(data["src"], caption, content_id=content_id, posted=posted)
    elif content_type == "link":
        return Link(data["url"], caption, content_id=content_id, posted=posted)
    elif content_type == "qrcode_content":
        return QRcodeContent(data["url"], caption, content_id=content_id, posted=posted)
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


class Caption:
    """A caption for some content with a body and optional title"""

    def __init__(self, title: Optional[str], body: str):
        self.title = title
        self.body = body

    def to_db_json(self) -> dict:
        obj = {"body": self.body}
        return combine(obj, {"title": self.title}) if self.title else obj


class CaptionedContent(FreeFormContent, ABC):
    """Content that can have an optional Caption.
    Subclasses must call `super().to_db_json()` and combine it with their own properties
    """

    def __init__(
        self,
        caption: Optional[Caption],
        content_id: Optional[int],
        posted: Optional[datetime],
    ):
        super().__init__(content_id, posted)
        self.caption = caption

    def to_db_json(self) -> dict:
        return {"caption": self.caption.to_db_json()} if self.caption else {}


class Link(CaptionedContent):
    """A link to be embedded in an iframe on the board along with a caption."""

    def __init__(
        self,
        url: str,
        caption: Optional[Caption],
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(caption, content_id, posted)
        self.url = url
        self.caption = caption

    def type(self) -> str:
        return "link"

    def to_db_json(self) -> dict:
        return combine(super().to_db_json(), {"url": self.url})


class QRcodeContent(CaptionedContent):
    """A link to be displayed as a QRcode on the board along with a caption."""

    def __init__(
        self,
        url: str,
        caption: Optional[Caption],
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(caption, content_id, posted)
        self.url = url
        self.caption = caption

    def type(self) -> str:
        return "qrcode_content"

    def to_db_json(self) -> dict:
        return combine(super().to_db_json(), {"url": self.url})


class RemoteImage(CaptionedContent):
    """An image post with its data stored on a remote server"""

    def __init__(
        self,
        src: str,
        caption: Optional[Caption],
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(caption, content_id, posted)
        self.src = src

    def type(self) -> str:
        return "remote_image"

    def to_db_json(self) -> dict:
        return combine(super().to_db_json(), {"src": self.src})


class BinaryContent(CaptionedContent, ABC):
    """A piece of content which has some attached binary data. A MIME type must be
    provided for this data in order for browsers to correctly interpret it."""

    def __init__(
        self,
        mime_type: str,
        blob: bytes,
        caption: Optional[Caption],
        content_id: Optional[int],
        posted: Optional[datetime],
    ):
        super().__init__(caption, content_id, posted)
        self.mime_type = mime_type
        self.blob = blob


class LocalImage(BinaryContent):
    """An image post with its data stored directly in the database"""

    def __init__(
        self,
        mime_type: str,
        image_data: bytes,
        caption: Optional[Caption],
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(mime_type, image_data, caption, content_id, posted)
        self.image_data = image_data
        self.mime_type = mime_type
        self.caption = caption

    def type(self) -> str:
        return "local_image"
