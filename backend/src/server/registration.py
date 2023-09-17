import flask
from flask import Blueprint, render_template

blueprint = Blueprint("registration", __name__, url_prefix="/register")


@blueprint.route("/")
def register():
    """Return the registration page"""
    return render_template("register.j2", next=flask.request.args.get("next"))
