from datetime import datetime
import json
import sqlite3
from abc import abstractmethod, ABC
from typing import Optional

class departmentinfo(ABC):
    def __init__(self, department_info_id: Optional[int], posted: Optional[datetime]):
        self.id = department_info_id
        self.posted = posted

    @abstractmethod
    def to_db_json(self) -> dict:
        """Convert this content to JSON in order to be serialized to the database"""
        raise NotImplementedError

    @abstractmethod
    def to_http_json(self) -> dict:
        """Convert this content to JSON in order to be sent over HTTP"""
        raise NotImplementedError

    
def from_form(form: dict) -> departmentinfo:
        """TODO input varification"""
        return lecturer(form["name"], form["title"], form["position"], form["office_hours"], form["office_location"], form["email"], form["phone"])
    
def from_sql(cursor: sqlite3.Cursor, row: tuple) -> departmentinfo:
        """Parse the given SQL row """
        #row = sqlite3.Row(cursor, row)
        department_info_id = row["id"]
        posted = datetime.fromtimestamp(row["posted"])
        data = json.loads(row["department_info_json"])

        return lecturer(data["name"], data["title"], data["position"], data["office_hours"], data["office_location"], data["email"], data["phone"], department_info_id=department_info_id, posted=posted)

class lecturer(departmentinfo):
    def to_db_json(self) -> dict:
        return {
            "name": self.name,
            "title": self.title,
            "position": self.position,
            "office_hours": self.office_hours,
            "office_location": self.office_location,
            "email": self.email,
            "phone": self.phone,
        }

    def to_http_json(self) -> dict:
        return {
            "name": self.name,
            "title": self.title,
            "position": self.position,
            "office_hours": self.office_hours,
            "office_location": self.office_location,
            "email": self.email,
            "phone": self.phone,
            "posted": int(self.posted.timestamp()),
            "id": self.id,
        }


    def __init__(
        self,
        name: str,
        title: str,
        position: str,
        office_hours: str,
        office_location: str,
        email: str,
        phone: str,
        department_info_id: Optional[int] = None,
        posted: Optional[datetime] = None,
    ):
        super().__init__(department_info_id, posted)
        self.name = name
        self.title = title
        self.position = position
        self.office_hours = office_hours
        self.office_location = office_location
        self.email = email
        self.phone = phone 

