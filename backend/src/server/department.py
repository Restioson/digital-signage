from datetime import datetime
import json
import sqlite3
from abc import abstractmethod, ABC
from typing import Optional


class Department(ABC):
    def __init__(self, lecturer_id: Optional[int]):
        self.id = lecturer_id

    @abstractmethod
    def to_db_title(self)-> str:raise NotImplementedError
    @abstractmethod    
    def to_db_name(self)-> str:raise NotImplementedError
    @abstractmethod    
    def to_db_department(self)-> str:raise NotImplementedError
    @abstractmethod
    def to_db_position(self)-> str:raise NotImplementedError
    @abstractmethod
    def to_db_hours(self)-> str:raise NotImplementedError
    @abstractmethod     
    def to_db_location(self)-> str:raise NotImplementedError
    @abstractmethod    
    def to_db_email(self)-> str:raise NotImplementedError
    @abstractmethod    
    def to_db_phone(self)-> str:raise NotImplementedError
    @abstractmethod    
    

    @abstractmethod
    def to_http_json(self) -> dict:
        """Convert the data to JSON in order to be sent over HTTP"""
        raise NotImplementedError


def from_form(form: dict) -> Department:
    """TODO input varification"""
    return Lecturer(
        form["department"],
        form["title"],
        form["name"],
        form["position"],
        form["office_hours"],
        form["office_location"],
        form["email"],
        form["phone"])


def from_sql(cursor: sqlite3.Cursor, row: tuple) -> Department:
    """Parse the given SQL row """
    row = sqlite3.Row(cursor, row)
    lecturer_id = row["id"]
    department=row["department"]
    title=row["title"]
    name=row["full_name"]
    position=row["position"]
    hours=row["office_hours"]
    location=row["office_location"]
    email=row["email"]
    phone=row["phone"]

    return Lecturer(
        lecturer_id=lecturer_id,
        department=department,
        title=title,
        name=name,
        position=position,
        office_hours=hours,
        office_location=location,
        email=email,
        phone=phone        
        )


class Lecturer(Department):
    def to_db_title(self)-> str: return self.title
    def to_db_name(self)-> str: return self.name
    def to_db_department(self)-> str: return self.department
    def to_db_position(self)-> str: return self.position
    def to_db_hours(self)-> str: return self.office_hours
    def to_db_location(self)-> str: return self.office_location
    def to_db_email(self)-> str: return self.email
    def to_db_phone(self)-> str: return self.phone
    
    def to_db(self) -> dict:
        return {
            "department": self.department,
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

    def __init__(
        self,
        department:str,
        title: str,
        name: str,
        position: str,
        office_hours: str,
        office_location: str,
        email: str,
        phone: str,
        lecturer_id: Optional[int] = None,
    ):
        super().__init__(lecturer_id)
        self.department = department
        self.title = title
        self.name = name
        self.position = position
        self.office_hours = office_hours
        self.office_location = office_location
        self.email = email
        self.phone = phone
