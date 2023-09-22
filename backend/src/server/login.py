from flask import Blueprint, render_template

blueprint = Blueprint("login", __name__, url_prefix="/login")


@blueprint.route("/")
def login():
    """Return the login page"""
    return render_template("login.j2")
