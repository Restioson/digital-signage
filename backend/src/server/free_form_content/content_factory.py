import io
import json
import sqlite3
from datetime import datetime

import PIL.Image

from server.free_form_content import (
    RemoteImage,
    Text,
    LocalImage,
    Link,
    IFrameContent,
    Caption,
    QRcodeContent,
    LocalVideo,
)
from server.free_form_content.free_form_content import FreeFormContent


def form_has_field(form: dict, field: str) -> bool:
    """Check if the form has a field and the field is not None/empty string"""
    return field in form and form[field]


def from_form(form: dict, files: dict) -> FreeFormContent:
    """Deserialize the appropriate content object from the given form dictionary
    and files. Throws UnknownContentError if the content type is not 'text',
    'remote_image', 'local_image', 'local_video' or 'link'.

    The resulting content will not have the post or ID initialised.
    """

    form = dict(form)  # Make form mutable

    content_type = form["type"]
    stream = int(form["content_stream"])

    caption = None
    if form_has_field(form, "caption_body") or form_has_field(form, "caption_title"):
        caption = Caption(
            form.get("caption_title"),
            form.get("caption_body"),
        )

    if content_type == "text":
        return Text(form["title"], form["body"], stream)
    elif content_type == "remote_image":
        return RemoteImage(form["src"], caption, stream)
    elif content_type == "local_image":
        # Load and verify the file, throwing an error if it isn't a valid image
        image_data = files["image_data"].read()
        image = PIL.Image.open(io.BytesIO(image_data))
        image.verify()

        mime = image.get_format_mimetype()
        return LocalImage(mime, image_data, caption, stream)
    elif content_type == "local_video":
        # Load and verify the file, throwing an error if it isn't a valid image
        video_data = files["video_data"].read()
        return LocalVideo(files["video_data"].content_type, video_data, caption, stream)
    elif content_type == "link":
        return Link(form["url"], caption, stream)
    elif content_type == "iframe_content":
        return IFrameContent(form["url"], caption, stream)
    elif content_type == "qrcode_content":
        return QRcodeContent(form["url"], caption, stream)
    else:
        raise UnknownContentError("Unknown content type", form["type"])


def from_sql(cursor: sqlite3.Cursor, row: tuple) -> FreeFormContent:
    """Parse the given SQL row and return the appropriate content type.
    Throws UnknownContentError if the content type is not 'text',
    'remote_image', 'local_image', 'local_video' or 'link'.
    """

    row = sqlite3.Row(cursor, row)
    content_type = row["content_type"]
    stream = row["stream"]
    content_id = row["id"]
    posted = datetime.fromtimestamp(row["posted"])
    data = json.loads(row["content_json"])
    blob_data = row["content_blob"] if "content_blob" in row.keys() else None
    mime = row["blob_mime_type"]

    caption = None
    if "caption" in data:
        title = data["caption"].get("title")
        caption = Caption(title, data["caption"].get("body"))

    if content_type == "text":
        assert blob_data is None, "Text content should not have any blob data"
        return Text(
            data["title"], data["body"], stream, content_id=content_id, posted=posted
        )
    elif content_type == "local_image":
        return LocalImage(
            mime, blob_data, caption, stream, content_id=content_id, posted=posted
        )
    elif content_type == "local_video":
        return LocalVideo(
            mime, blob_data, caption, stream, content_id=content_id, posted=posted
        )
    elif content_type == "remote_image":
        return RemoteImage(
            data["src"], caption, stream, content_id=content_id, posted=posted
        )
    elif content_type == "link":
        return Link(data["url"], caption, stream, content_id=content_id, posted=posted)
    elif content_type == "iframe_content":
        return IFrameContent(
            data["url"], caption, stream, content_id=content_id, posted=posted
        )
    elif content_type == "qrcode_content":
        return QRcodeContent(
            data["url"], caption, stream, content_id=content_id, posted=posted
        )
    else:
        raise UnknownContentError("Unknown content type", content_type)


class UnknownContentError(Exception):
    """The type of content passed to `from_dict` was unknown"""

    def __init__(self, message, unk_type):
        super().__init__(message)
        self.unk_type = unk_type
