import sqlite3
from typing import Optional

from server.department.lecturer import Lecturer


# TODO: add more functionality and use in display group development
class Department:
    """A university department that has lecturers and are to be the users of this app.
    Currently unused but need for later functionality."""

    def __init__(
        self,
        name: str,
        bio: str,
        lecturers: Optional[list[Lecturer]] = None,
        department_id: Optional[int] = None,
    ):
        self.name = name
        self.bio = bio
        self.lecturers = lecturers or []
        self.id = department_id

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a Department object"""

        row = sqlite3.Row(cursor, row)
        return Department(
            department_id=row["id"],
            name=row["name"],
            bio=row["bio"],
        )
