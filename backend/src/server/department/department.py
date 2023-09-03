from server.department.lecturer import Lecturer


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
