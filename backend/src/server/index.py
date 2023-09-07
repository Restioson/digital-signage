from flask import Blueprint, render_template

blueprint = Blueprint("index", __name__, url_prefix="/")


@blueprint.route("/")
def index():
    """Return the index of the CampuSign web app, which links to other pages"""
    return render_template("index.j2")
