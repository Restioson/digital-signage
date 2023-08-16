from flask import Blueprint, render_template

blueprint = Blueprint("config_view", __name__, url_prefix="/config")


@blueprint.route("/")
def index():
    """Return the config index page"""
    return render_template("config/index.j2")


@blueprint.route("/department/lecturer")
def upload_lecturer():
    """Return the lecturer config page"""
    return render_template("config/department/lecturer.j2")
