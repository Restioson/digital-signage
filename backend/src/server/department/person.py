import sqlite3
from typing import Optional


class Person:
    def __init__(
        self,
        title: str,
        name: str,
        position: str,
        office_hours: str,
        office_location: str,
        email: str,
        phone: str,
        lecturer_id: Optional[int] = None,
    ):
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
    def empty():
        """Create an empty Lecturer object for use in the
        Flask form (it will prefill with nothing)"""
        return Person(
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            None,
        )

    @staticmethod
    def from_form(form: dict):
        """forms person from data inputted in the configuration form"""
        return Person(
            form["title"],
            form["name"],
            form["position"],
            form["office_hours"],
            form["office_location"],
            form["email"],
            form["phone"],
            lecturer_id=form.get("id"),
        )

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row in the table Lecturer"""
        row = sqlite3.Row(cursor, row)
        return Person(
            lecturer_id=row["id"],
            title=row["title"],
            name=row["full_name"],
            position=row["position"],
            office_hours=row["office_hours"],
            office_location=row["office_location"],
            email=row["email"],
            phone=row["phone"],
        )
