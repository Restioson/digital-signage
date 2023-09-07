import flask
from flask import Blueprint, render_template, current_app
from flask_login import current_user

from server.database import DatabaseController
from server.department import Person

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


@blueprint.route("/departments/<int:department_id>/persons")
def list_persons(department_id: int):
    """Return the persons page which lists all persons in the given department"""

    dept = DatabaseController.get().fetch_department_by_id(
        department_id, fetch_persons=True
    )

    if not dept:
        flask.abort(404)

    return render_template(
        "config/departments/persons/index.j2",
        department=dept,
    )


@blueprint.route("/departments/<int:department_id>/persons/add")
def upload_person(department_id: int):
    """Return the 'add persons' page"""

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/departments/persons/add.j2",
        person=Person.empty(),
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/persons/<int:person_id>")
def edit_person(department_id: int, person_id: int):
    """Return the 'edit persons' page for the given persons"""
    person = DatabaseController.get().fetch_person_by_id(person_id)

    if not person:
        flask.abort(404)

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/departments/persons/add.j2",
        person=person,
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


@blueprint.route("/departments/<int:department_id>/files")
def load_files(department_id: int):
    """Return the 'department files page"""

    department = DatabaseController.get().fetch_department_by_id(department_id)

    if not department:
        flask.abort(404)

    return render_template(
        "config/departments/files.j2",
        department=department,
    )
