from flask import Blueprint, render_template

blueprint = Blueprint("index", __name__, url_prefix="/")


@blueprint.route("/")
def index():
    return render_template("index.j2")
