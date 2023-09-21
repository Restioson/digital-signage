from datetime import datetime
from typing import Optional

from server.free_form_content.binary_content import BinaryContent
from server.free_form_content.caption import Caption


class LocalImage(BinaryContent):
    """An image post with its data stored directly in the database"""

    def __init__(
        self,
        mime_type: str,
        image_data: bytes,
        caption: Optional[Caption],
        streams: list[int],
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(mime_type, image_data, caption, streams, content_id, posted)
        self.image_data = image_data
        self.mime_type = mime_type
        self.caption = caption

    def type(self) -> str:
        return "local_image"
