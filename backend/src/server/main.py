from flask import Flask

from flask import Blueprint

config_view = Blueprint("config_view", __name__)


def create_app():
    app = Flask(__name__)
    app.register_blueprint(config_view)
    return app


@config_view.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


global_app = create_app()
