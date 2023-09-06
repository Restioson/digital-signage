from datetime import datetime
from typing import Optional

from server.free_form_content.free_form_content import FreeFormContent


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
