from datetime import datetime
from typing import Optional

from server.free_form_content.caption import Caption
from server.free_form_content.captioned_content import CaptionedContent
from server.util import combine


class RemoteImage(CaptionedContent):
    """An image post with its data stored on a remote server"""

    def __init__(
        self,
        src: str,
        caption: Optional[Caption],
        streams: list[int],
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(caption, streams, content_id, posted)
        self.src = src

    def type(self) -> str:
        return "remote_image"

    def to_db_json(self) -> dict:
        return combine(super().to_db_json(), {"src": self.src})
