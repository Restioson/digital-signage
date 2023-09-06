from datetime import datetime
from typing import Optional

from server.free_form_content.caption import Caption
from server.free_form_content.captioned_content import CaptionedContent
from server.util import combine


class Link(CaptionedContent):
    """A link to be displayed on the board along with a caption."""

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
