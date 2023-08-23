import sqlite3


class User:
    def __init__(self, email: str, screen_name: str, password: str):
        self.email = email
        self.screen_name = screen_name
        self.password = password

    def to_http_json(self) -> dict:
        """Sends data in json format to be posted through http"""
        return {
            "email": self.email,
            "screen_name": self.screen_name,
            "pass_word": self.password,
        }

    @staticmethod
    def from_form(form: dict):
        """forms user from data inputted in the registration form"""
        return User(form["email"], form["screen_name"], form["password"])

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row in the table user"""
        row = sqlite3.Row(cursor, row)
        return User(
            email=row["email"],
            screen_name=row["screen_name"],
            password=row["pass_word"],
        )
