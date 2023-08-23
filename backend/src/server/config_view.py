import flask
from flask import Blueprint, render_template
from flask_login import login_required

from server.database import DatabaseController
from server.department import Lecturer

blueprint = Blueprint("config_view", __name__, url_prefix="/config")


@blueprint.route("/")
@login_required
def index():
    """Return the config index page"""
    return render_template("config/index.j2")


@blueprint.route("/department/lecturers")
def list_lecturers():
    """Return the lecturers page which lists all lecturers"""
    return render_template(
        "config/department/lecturers/index.j2",
        lecturers=DatabaseController.get().fetch_all_departments(),
    )


@blueprint.route("/department/lecturers/add")
def upload_lecturer():
    """Return the 'add lecturers' page"""
    return render_template(
        "config/department/lecturers/add.j2", lecturer=Lecturer.empty()
    )


@blueprint.route("/department/lecturers/<int:lecturer_id>")
def edit_lecturer(lecturer_id: int):
    """Return the 'edit lecturers' page for the given lecturers"""
    lecturer = DatabaseController.get().fetch_lecturer_by_id(lecturer_id)

    if not lecturer:
        flask.abort(404)
    else:
        return render_template(
            "config/department/lecturers/add.j2",
            lecturer=lecturer,
        )


@blueprint.route("/display_group/add")
def add_display_group():
    """Return the page to add a display group"""
    return render_template(
        "config/display_group/add.j2",
        departments=DatabaseController.get().fetch_all_departments(),
    )
