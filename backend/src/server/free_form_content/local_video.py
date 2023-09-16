from datetime import datetime
from typing import Optional

from server.free_form_content.binary_content import BinaryContent
from server.free_form_content.caption import Caption


class LocalVideo(BinaryContent):
    """A video post with its data stored directly in the database"""

    def __init__(
        self,
        mime_type: str,
        video_data: bytes,
        caption: Optional[Caption],
        stream_id: int,
        content_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(mime_type, video_data, caption, stream_id, content_id, posted)
        self.video_data = video_data
        self.mime_type = mime_type
        self.caption = caption

    def type(self) -> str:
        return "local_video"
