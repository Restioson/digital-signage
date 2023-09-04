from abc import ABC
from datetime import datetime
from typing import Optional

from server.free_form_content.caption import Caption
from server.free_form_content.free_form_content import FreeFormContent


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
