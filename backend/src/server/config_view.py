from flask import Blueprint

blueprint = Blueprint("config_view", __name__, url_prefix="/config")


@blueprint.route("/")
def hello_world():
    return "<p>Hello, config view!</p>"
