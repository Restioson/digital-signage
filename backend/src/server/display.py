import sqlite3
from typing import Optional


class Display:
    """A display is a physical display. It is part of a
    department and a display group."""

    def __init__(
        self, name: str, department: int, group: int, display_id: Optional[int] = None
    ):
        self.name = name
        self.department = department
        self.group = group
        self.id = display_id

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a Display object"""

        row = sqlite3.Row(cursor, row)
        return Display(
            name=row["name"],
            department=row["department_id"],
            group=row["display_group_id"],
            display_id=row["id"],
        )

    @staticmethod
    def from_form(form: dict):
        """Parse the given form into a Display object"""
        return Display(
            name=form["name"],
            department=form["department_id"],
            group=form["display_group_id"],
            display_id=form.get("id"),
        )
