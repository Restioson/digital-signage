import sqlite3


class User:
    def __init__(self, email: str, screen_name: str, department: int, permissions: str):
        self.user_id = email
        # the login_manager required an id so the email has become the ID
        self.screen_name = screen_name
        self.department = department
        self.permissions = permissions

        # are now variables
        self.is_active = True
        self.is_authenticated = True
        self.is_anonymous = False

    # get id method changed
    def get_id(self) -> str:
        return self.user_id

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a Department object"""

        row = sqlite3.Row(cursor, row)
        return User(
            email=row["email"],
            screen_name=row["screen_name"],
            department=row["department"],
            permissions=row["permissions"],
        )

    def to_http_json(self) -> dict:
        """Serialize the given Department into its HTTP API representation"""
        return {
            "email": self.user_id,
            "username": self.screen_name,
            "department": self.department,
            "permissions": self.permissions,
        }
