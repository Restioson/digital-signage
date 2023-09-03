import io
import json
import sqlite3
from datetime import datetime

import PIL.Image

from server.free_form_content import RemoteImage, Text, LocalImage, Link, Caption
from server.free_form_content.free_form_content import FreeFormContent


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
    else:
        raise UnknownContentError("Unknown content type", content_type)


class UnknownContentError(Exception):
    """The type of content passed to `from_dict` was unknown"""

    def __init__(self, message, unk_type):
        super().__init__(message)
        self.unk_type = unk_type
