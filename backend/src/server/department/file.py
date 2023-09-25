import flask
import sqlite3


class File:
    """This is a file within a department"""

    def __init__(
        self,
        name: str,
        department_id: int,
        mime_type: str,
        file_data: bytes,
    ):
        self.name = name
        self.department_id = department_id
        self.mime_type = mime_type
        self.file_data = file_data

    @staticmethod
    def from_form(form: dict, files: dict, department_id: int):
        """forms lecturer from data inputted in the configuration form"""
        return File(
            flask.request.files["department_file_data"].filename,
            department_id,
            flask.request.files["department_file_data"].content_type,
            files["department_file_data"].read(),
        )

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row in the table Lecturer"""
        row = sqlite3.Row(cursor, row)
        return File(
            name=row["filename"],
            department_id=row["department_id"],
            mime_type=row["mime_type"],
            file_data=row["file_content"],
        )
