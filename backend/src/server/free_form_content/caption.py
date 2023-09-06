from typing import Optional

from server.util import combine


class Caption:
    """A caption for some content with a body and optional title"""

    def __init__(self, title: Optional[str], body: str):
        self.title = title
        self.body = body

    def to_db_json(self) -> dict:
        obj = {"body": self.body}
        return combine(obj, {"title": self.title}) if self.title else obj
