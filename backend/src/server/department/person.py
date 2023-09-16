import sqlite3
from typing import Optional
import PIL.Image
import io


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
            "mime_type": self.mime_type,
            "image_data": self.image_data,
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
        image_data = files["image_data"].read()
        image = PIL.Image.open(io.BytesIO(image_data))
        image.verify()
        mime = image.get_format_mimetype()
        return Person(
            form["title"],
            form["name"],
            mime,
            image_data,
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
            mime_type=row["mime_type"],
            image_data=row["image_data"],
            position=row["position"],
            office_hours=row["office_hours"],
            office_location=row["office_location"],
            email=row["email"],
            phone=row["phone"],
        )
