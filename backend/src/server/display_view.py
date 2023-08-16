from flask import Blueprint, render_template

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/")
def display():
    """Return the display view page"""
    return render_template("display.j2")
