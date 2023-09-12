import flask


class File:
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
