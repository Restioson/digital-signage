import sqlite3
from typing import Optional

from server.free_form_content.content_stream import ContentStream


class DisplayGroup:
    """A DisplayGroup is a template for how a display should look. Many displays
    can look the same, hence they are grouped like this. Each display group is
    owned by a department and has a defined layout."""

    def __init__(
        self,
        name: str,
        layout_xml: str,
        content_streams: Optional[list[ContentStream]] = None,
        group_id: Optional[int] = None,
    ):
        self.name = name
        self.layout_xml = layout_xml
        self.content_streams = content_streams or []
        self.id = group_id

    @staticmethod
    def from_form(form: dict):
        return DisplayGroup(
            name=form["name"],
            layout_xml=form["layout_xml"],
        )

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a DisplayGroup object"""

        row = sqlite3.Row(cursor, row)
        return DisplayGroup(
            group_id=row["id"],
            name=row["name"],
            layout_xml=row["layout_xml"],
        )
