import sqlite3
from typing import Optional


# TODO: add more functionality and use in display group development
class Department:
    """A unversity department that has lecturers and are to be the users of this app.
    Currently unused but need for later functionality."""

    def __init__(self, name):
        self.name = name
        self.lecturers = []

    def add_lecturer(self, lecturer):
        if isinstance(lecturer, Lecturer):
            self.lecturers.append(lecturer)
        else:
            raise ValueError("Invalid Lecturer object")


class Lecturer:
    def __init__(
        self,
        department: str,
        title: str,
        name: str,
        position: str,
        office_hours: str,
        office_location: str,
        email: str,
        phone: str,
        lecturer_id: Optional[int] = None,
    ):
        self.department = department
        self.title = title
        self.name = name
        self.position = position
        self.office_hours = office_hours
        self.office_location = office_location
        self.email = email
        self.phone = phone
        self.id = lecturer_id

    def to_http_json(self) -> dict:
        """Sends data in json format to be posted through http"""
        return {
            "department": self.department,
            "title": self.title,
            "name": self.name,
            "position": self.position,
            "office_hours": self.office_hours,
            "office_location": self.office_location,
            "email": self.email,
            "phone": self.phone,
            "id": self.id,
        }

    @staticmethod
    def from_form(form: dict):
        """forms lecturer from data inputted in the configuration form"""
        return Lecturer(
            form["department"],
            form["title"],
            form["name"],
            form["position"],
            form["office_hours"],
            form["office_location"],
            form["email"],
            form["phone"],
        )

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row in the table Lecturer"""
        row = sqlite3.Row(cursor, row)
        return Lecturer(
            lecturer_id=row["id"],
            department=row["department"],
            title=row["title"],
            name=row["full_name"],
            position=row["position"],
            office_hours=row["office_hours"],
            office_location=row["office_location"],
            email=row["email"],
            phone=row["phone"],
        )
