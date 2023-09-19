class User:
    def __init__(self, email: str, screen_name: str, department: int, permissions: str):
        self.user_id = email  # the login_manager required an id
        # self.email = email
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

    def get_permissions(self) -> str:
        return self.permissions

    def get_department(self) -> str:
        return self.department
