import json
import sqlite3
from typing import Optional

from server.util import combine


class ContentStream:
    """A content stream is a grouping of content. It can be
    - public (accessible by all display groups),
    - per-department (accessible by groups in a given department only)
    - per-group (accessible only by a given display group)

    All content is part of one and only one content stream.
    """

    def __init__(
        self,
        name: str,
        department: Optional[int] = None,
        stream_id: Optional[int] = None,
    ):
        self.name = name
        self.department = department
        self.id = stream_id

    def __repr__(self):
        return json.dumps(self.to_http_json())

    def to_http_json(self) -> dict:
        """Serialize the given ContentStream into its JSON HTTP API representation"""

        if self.department:
            grouping = {"department": self.department}
        else:
            grouping = {}

        props = {
            "id": self.id,
            "name": self.name,
        }

        return combine(props, grouping)

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a ContentStream object"""

        row = sqlite3.Row(cursor, row)
        return ContentStream(
            name=row["name"],
            department=row["department"],
            stream_id=row["id"],
        )

    @staticmethod
    def from_form(form: dict):
        """Parse the given form into a ContentStream object"""
        return ContentStream(
            name=form["name"],
            department=int(dept) if (dept := form.get("department")) else None,
        )
