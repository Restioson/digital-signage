import flask
from flask import Blueprint, render_template, current_app
from flask_login import login_required, current_user

from server.database import DatabaseController
from server.department import Lecturer

blueprint = Blueprint("config_view", __name__, url_prefix="/config")


@blueprint.before_request
def check_logged_in():
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()


@blueprint.route("/")
def index():
    """Return the config index page"""
    return render_template("config/index.j2")


@blueprint.route("/departments/")
def list_departments():
    """Return the departments index page"""

    return render_template(
        "config/departments/index.j2",
        departments=DatabaseController.get().fetch_all_departments(
            fetch_display_groups=True
        ),
    )


@blueprint.route("/departments/<int:department_id>/lecturers")
def list_lecturers(department_id: int):
    """Return the lecturers page which lists all lecturers in the given department"""

    dept = DatabaseController.get().fetch_department_by_id(
        department_id, fetch_lecturers=True
    )

    if not dept:
        flask.abort(404)

    return render_template(
        "config/departments/lecturers/index.j2",
        department=dept,
    )


@blueprint.route("/departments/<int:department_id>/lecturers/add")
def upload_lecturer(department_id: int):
    """Return the 'add lecturers' page"""

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/departments/lecturers/add.j2",
        lecturer=Lecturer.empty(),
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/lecturers/<int:lecturer_id>")
def edit_lecturer(department_id: int, lecturer_id: int):
    """Return the 'edit lecturers' page for the given lecturers"""
    lecturer = DatabaseController.get().fetch_lecturer_by_id(lecturer_id)

    if not lecturer:
        flask.abort(404)

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/departments/lecturers/add.j2",
        lecturer=lecturer,
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/display_group/add")
def add_display_group(department_id: int):
    """Return the page to add a display group"""
    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/display_group/add.j2",
        department_id=department_id,
    )
