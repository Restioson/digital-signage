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

    return render_template(
        "config/index.j2",
        content_streams=DatabaseController.get().fetch_all_content_streams(),
    )


@blueprint.route("/departments/")
def list_departments():
    """Return the departments index page"""

    return render_template(
        "config/departments/index.j2",
        departments=DatabaseController.get().fetch_all_departments(
            fetch_display_groups=True,
            fetch_content_streams=True,
        ),
    )


@blueprint.route("/departments/<int:department_id>/people")
def list_people(department_id: int):
    """Return the people page which lists all people in the given department"""

    dept = DatabaseController.get().fetch_department_by_id(
        department_id, fetch_people=True
    )

    if not dept:
        flask.abort(404)

    return render_template(
        "config/departments/people/index.j2",
        department=dept,
    )


@blueprint.route("/departments/<int:department_id>/people/add")
def upload_person(department_id: int):
    """Return the 'add people' page"""

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/departments/people/add.j2",
        person=Person.empty(),
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/people/add_table")
def upload_table(department_id: int):
    """Return the 'add table' page"""

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/departments/people/add_table.j2",
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/people/<int:person_id>")
def edit_person(department_id: int, person_id: int):
    """Return the 'edit people' page for the given people"""
    person = DatabaseController.get().fetch_person_by_id(person_id)

    if not person:
        flask.abort(404)

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    return render_template(
        "config/departments/people/add.j2",
        person=person,
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/display_group/add")
def add_display_group(department_id: int):
    """Return the page to add a display group"""
    db = DatabaseController.get()
    if not db.fetch_department_by_id(department_id):
        flask.abort(404)

    streams = db.fetch_all_content_streams()
    streams.filter_to_department(department_id)

    return render_template(
        "config/display_group/add.j2",
        templates=db.fetch_all_page_templates(),
        streams=streams,
        department_id=department_id,
    )


@blueprint.route("/content_stream/add")
def add_content_stream():
    """Return the page to add a content stream"""

    db = DatabaseController.get()
    group = flask.request.args.get("group")
    department = flask.request.args.get("department")

    if group and department:
        flask.abort(400)

    if group:
        group = db.fetch_display_group_by_id(int(group))
        if not group:
            flask.abort(404)
        return render_template(
            "config/content_stream/add.j2", display_group=group, department=None
        )
    elif department:
        department = db.fetch_department_by_id(int(department))
        if not department:
            flask.abort(404)
        return render_template(
            "config/content_stream/add.j2", display_group=None, department=department
        )
    else:
        return render_template(
            "config/content_stream/add.j2", display_group=None, department=None
        )


@blueprint.route("/departments/<int:department_id>/files")
def load_files(department_id: int):
    """Return the 'department files page"""

    department = DatabaseController.get().fetch_department_by_id(
        department_id, fetch_files=True
    )

    if not department:
        flask.abort(404)

    return render_template(
        "config/departments/files.j2",
        department=department,
    )
