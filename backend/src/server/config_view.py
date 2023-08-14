from flask import Blueprint, render_template

blueprint = Blueprint("config_view", __name__, url_prefix="/config")


@blueprint.route("/")
def hello_world():
    return render_template("config.j2")
