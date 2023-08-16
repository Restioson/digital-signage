from flask import Blueprint, render_template

blueprint = Blueprint("config_view", __name__, url_prefix="/config")


@blueprint.route("/")
def hello_world():
    return render_template("config/index.j2")


@blueprint.route("/department/lecturer")
def display_config_department_info():
    return render_template("config/department/lecturer.j2")
