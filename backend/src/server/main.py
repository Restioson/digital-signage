from flask import Flask
from server import config_view, display_view, index, api
from server.database import DatabaseController


def create_app(testing=False):
    app = Flask(
        __name__,
        static_folder="../../../frontend/static",
        template_folder="../../../frontend/templates",
    )
    app.register_blueprint(config_view.blueprint)
    app.register_blueprint(display_view.blueprint)
    app.register_blueprint(index.blueprint)
    app.register_blueprint(api.blueprint)

    DatabaseController.create_db(app, testing=testing)

    @app.teardown_appcontext
    def teardown_db(exception):
        DatabaseController.teardown()

    return app
