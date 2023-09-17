import sqlite3
from typing import Optional
import PIL.Image
import io
import pandas as pd


class Person:
    def __init__(
        self,
        title: str,
        name: str,
        mime_type: str,
        image_data: bytes,
        position: str,
        office_hours: str,
        office_location: str,
        email: str,
        phone: str,
        lecturer_id: Optional[int] = None,
    ):
        self.title = title
        self.name = name
        self.mime_type = mime_type
        self.image_data = image_data
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
            "",
            "",
            None,
        )

    @staticmethod
    def from_form(form: dict, files: dict):
        """forms person from data inputted in the configuration form"""
        title = form["title"] if not pd.isna(form["title"]) else ""
        full_name = form["name"] if not pd.isna(form["name"]) else ""
        position = form["position"] if not pd.isna(form["position"]) else ""
        office_hours = form["office_hours"] if not pd.isna(form["office_hours"]) else ""
        office_location = (
            form["office_location"] if not pd.isna(form["office_location"]) else ""
        )
        email = form["email"] if not pd.isna(form["email"]) else ""
        phone = form["phone"] if not pd.isna(form["phone"]) else ""

        image_data = files["image_data"].read()
        if image_data:
            image = PIL.Image.open(io.BytesIO(image_data))
            image.verify()
            mime = image.get_format_mimetype()
        else:
            mime = ""
            image_data = ""
        return Person(
            title,
            full_name,
            mime,
            image_data,
            position,
            office_hours,
            office_location,
            email,
            phone,
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
            image_data="",
            mime_type="",
        )
