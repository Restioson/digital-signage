from flask import Blueprint, render_template, current_app
from flask_login import current_user

blueprint = Blueprint("index", __name__, url_prefix="/")


@blueprint.before_request
def check_logged_in():
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()


@blueprint.route("/")
def index():
    """Return the index of the CampuSign web app, which links to other pages"""
    return render_template("index.j2")
