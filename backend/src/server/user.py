class User:
    def __init__(self, email: str, screen_name: str):
        self.user_id = email  # the login_manager required an id
        # self.email = email
        self.screen_name = screen_name

        # are now variables
        self.is_active = True
        self.is_authenticated = True
        self.is_anonymous = False

    # get id method changed
    def get_id(self) -> str:
        return self.user_id

    @staticmethod
    def from_form(form: dict):
        """Deserializes user from data inputted in the registration form"""
        user_fields = []
        user_fields.append(form["email"])
        user_fields.append(form["screen_name"])
        user_fields.append(form["password"])
        return user_fields


''' @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row in the table user"""
        row = sqlite3.Row(cursor, row)

        user_fields = []
        user_fields.append(row["email"],)
        user_fields.append(row["screen_name"])
        user_fields.append(row["password"])
        return user_fields'''

# pass a list of user attributes
'''def to_http_json(user_properties) -> dict:
        """Sends data in json format to be posted through http"""
        return {
            "email": user_properties[0],
            "screen_name": user_properties[1],
            "password": user_properties[2],
        }'''
