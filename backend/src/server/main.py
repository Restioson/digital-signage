from flask import Flask
from server import config_view, display_view, index, api, login, registration,User, database
from server.database import DatabaseController
from flask_login import LoginManager
from server.database import DatabaseController
from server.User import User



def create_app(testing=False):
    """Create and configure the flask app"""

    app = Flask(
        __name__,
        static_folder="../../../frontend/static",
        template_folder="../../../frontend/templates",
    )

    login_manager = LoginManager()
    login_manager.init_app(app)
    app.secret_key = "uihfewheiwheiuhwiuehw"

    @login_manager.user_loader
    def load_user(user_id):
        attr_list = DatabaseController.get().get_user(user_id)
        loaded_user = User(attr_list[0],attr_list[1])
        print(loaded_user.email)
        return loaded_user

    # Register blueprints for each logical part of the app
    app.register_blueprint(registration.blueprint)
    app.register_blueprint(login.blueprint)
    app.register_blueprint(config_view.blueprint)
    app.register_blueprint(display_view.blueprint)
    app.register_blueprint(index.blueprint)
    app.register_blueprint(api.blueprint)

    if testing:
        app.config.update({"TESTING": True})

    # Setup database
    with app.app_context():
        DatabaseController.get().create_db()

    @app.teardown_appcontext
    def teardown_db(exception):
        DatabaseController.teardown()

    return app
