from flask import Flask
from server import config_view, display_view, index, api, login, registration
from server.database import DatabaseController


def create_app(testing=False):
    """Create and configure the flask app"""

    app = Flask(
        __name__,
        static_folder="../../../frontend/static",
        template_folder="../../../frontend/templates",
    )

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
