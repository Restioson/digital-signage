from abc import ABC
from datetime import datetime
from typing import Optional

from server.free_form_content.caption import Caption
from server.free_form_content.captioned_content import CaptionedContent


class BinaryContent(CaptionedContent, ABC):
    """A piece of content which has some attached binary data. A MIME type must be
    provided for this data in order for browsers to correctly interpret it."""

    def __init__(
        self,
        mime_type: str,
        blob: bytes,
        caption: Optional[Caption],
        stream_id: int,
        content_id: Optional[int],
        posted: Optional[datetime],
    ):
        super().__init__(caption, stream_id, content_id, posted)
        self.mime_type = mime_type
        self.blob = blob
