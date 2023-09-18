import sqlite3
from typing import Optional

from server.department.person import Person
from server.display import Display
from server.free_form_content.content_stream import ContentStream
from server.department.file import File


# TODO: add more functionality and use in display group development
class Department:
    """A university department that has people and are to be the users of this app.
    Currently unused but need for later functionality."""

    def __init__(
        self,
        name: str,
        bio: str,
        people: Optional[list[Person]] = None,
        displays: Optional[list[Display]] = None,
        content_streams: Optional[list[ContentStream]] = None,
        files: Optional[File] = None,
        department_id: Optional[int] = None,
    ):
        self.name = name
        self.bio = bio
        self.people = people or []
        self.display_groups = displays or []
        self.content_streams = content_streams or []
        self.id = department_id
        self.files = files

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a Department object"""

        row = sqlite3.Row(cursor, row)
        return Department(
            department_id=row["id"],
            name=row["name"],
            bio=row["bio"],
        )

    def to_http_json(self) -> dict:
        """Serialize the given Department into its HTTP API representation"""
        return {"id": self.id, "name": self.name, "bio": self.bio}
