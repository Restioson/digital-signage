from flask import Blueprint, render_template

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/")
def hello_world():
    return render_template("display.j2")
