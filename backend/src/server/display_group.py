import sqlite3
from typing import Optional


class DisplayGroup:
    """A DisplayGroup is a template for how a display should look. Many displays
    can look the same, hence they are grouped like this. Each display group is
    owned by a department and has a defined layout."""

    def __init__(
        self,
        name: str,
        department_id: int,
        layout_json: str,
        group_id: Optional[int] = None,
    ):
        self.name = name
        self.department_id = department_id
        self.layout_json = layout_json
        self.id = group_id

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a DisplayGroup object"""

        row = sqlite3.Row(cursor, row)
        return DisplayGroup(
            group_id=row["id"],
            name=row["name"],
            department_id=row["department"],
            layout_json=row["layout_json"],
        )
