import time
import os
from flask import Flask
from server import (
    config_view,
    display_view,
    index,
    api,
    login,
    registration,
)
from server.display import PageTemplate
from server.loadshedding import Loadshedding
from flask_login import LoginManager
from server.database import DatabaseController
from server.user import User
from threading import Thread
from dotenv import load_dotenv


def create_app(testing=False):
    """Create and configure the flask app"""
    load_dotenv()
    app = Flask(
        __name__,
        static_folder="../../../frontend/static",
        template_folder="../../../frontend/templates",
    )

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "login.login"
    app.secret_key = "uihfewheiwheiuhwiuehw"

    @login_manager.user_loader
    def load_user(user_id):
        attr_list = DatabaseController.get().get_user(user_id)
        loaded_user = User(attr_list[0], attr_list[1], attr_list[2], attr_list[3])
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
        password = os.environ.get("ADMIN_PASSWORD123") or "PASSWORD"
        # if not (DatabaseController.get().user_exists("A@ADMIN")):
        DatabaseController.get().insert_user(
            "A@ADMIN",
            "ADMIN",
            password,
            1,
            "superuser",
        )

    @app.teardown_appcontext
    def teardown_db(exception):
        DatabaseController.teardown()

    PageTemplate.register_filters(app)

    Thread(
        target=repeat_update_loadshedding,
        args=(Loadshedding.interval, app.app_context()),
        daemon=True,
    ).start()

    return app


def repeat_update_loadshedding(interval, app):
    with app:
        while True:
            Loadshedding.update_loadshedding_schedule(1, app)
            time.sleep(interval)
