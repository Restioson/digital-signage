from flask import Blueprint

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/")
def hello_world():
    return "<p>Hello, display view!</p>"
