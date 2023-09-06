from flask import Blueprint, render_template
from flask_login import login_required

blueprint = Blueprint("index", __name__, url_prefix="/")


@blueprint.route("/")
@login_required
def index():
    """Return the index of the CampuSign web app, which links to other pages"""
    return render_template("index.j2")
