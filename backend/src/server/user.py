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
