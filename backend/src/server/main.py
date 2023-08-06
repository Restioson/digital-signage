from flask import Flask
from server import config_view, display_view, index


def create_app():
    app = Flask(__name__)
    app.register_blueprint(config_view.blueprint)
    app.register_blueprint(display_view.blueprint)
    app.register_blueprint(index.blueprint)
    return app


backend_server = create_app()
