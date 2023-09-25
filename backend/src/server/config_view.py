import flask
from flask import Blueprint, render_template, current_app
from flask_login import current_user

from server.database import DatabaseController, Permission
from server.department.person import Person

blueprint = Blueprint("config_view", __name__, url_prefix="/config")


@blueprint.before_request
def check_logged_in():
    """Checks if the user is logged in"""
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()


@blueprint.route("/add_posts")
def add_posts():
    """Return the add posts page"""
    # render_template loads the specified page and
    # allows values to be passed to the page
    # majority of the functions in this file use it.
    return render_template(
        "config/add_content.j2",
        content_streams=DatabaseController.get().fetch_all_content_streams(
            permissions="Write"
        ),
        departments=DatabaseController.get().fetch_all_departments(),
    )


@blueprint.route("/")
def index():
    """Return the config index page"""
    content_streams = DatabaseController.get().fetch_all_content_streams(
        # Show all streams if superuser, else only non-private ones
        permissions=None
        if current_user.permissions == "superuser"
        else Permission.READ
    )

    depts = DatabaseController.get().fetch_all_departments()

    return render_template(
        "config/index.j2",
        content_streams=content_streams,
        departments=depts,
    )


@blueprint.route("/departments/")
def list_departments():
    """Return the departments index page"""
    if current_user.department == 1:
        departments = DatabaseController.get().fetch_all_departments(
            fetch_displays=True
        )
        departments = departments.values()
    else:
        user_department = DatabaseController.get().fetch_department_by_id(
            department_id=current_user.department, fetch_displays=True
        )
        departments = [user_department]

    return render_template(
        "config/departments/index.j2",
        departments=departments,
        base=flask.request.root_url,
    )


@blueprint.route("/departments/<int:department_id>/people")
def list_people(department_id: int):
    """Return the people page which lists all people in the given department"""
    if current_user.department == department_id:
        if current_user.department == 1:
            departments = DatabaseController.get().fetch_all_departments(
                fetch_people=True
            )
            departments = departments.values()
        else:
            user_department = DatabaseController.get().fetch_department_by_id(
                department_id, fetch_people=True
            )
            departments = [user_department]

        return render_template(
            "config/departments/people/index.j2",
            departments=departments,
        )
    else:
        flask.abort(404)


@blueprint.route("/departments/<int:department_id>/people/add")
def upload_person(department_id: int):
    """Return the 'add people' page"""
    if current_user.permissions == "posting_user":
        flask.abort(401)
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
    if current_user.permissions == "posting_user":
        flask.abort(401)
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

    if current_user.permissions == "posting_user":
        flask.abort(401)

    return render_template(
        "config/departments/people/add.j2",
        person=person,
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/display/add")
def add_display(department_id: int):
    """Return the page to add a display group"""
    if current_user.permissions == "posting_user":
        flask.abort(401)
    db = DatabaseController.get()
    if not db.fetch_department_by_id(department_id):
        flask.abort(404)

    streams = db.fetch_all_content_streams(permissions="Read")
    streams.filter_to_department(department_id)

    return render_template(
        "config/display/add.j2",
        departments=db.fetch_all_departments(),
        templates=db.fetch_all_page_templates(),
        existing=None,
        streams=streams,
        department_id=department_id,
    )


@blueprint.route("/departments/<int:department_id>/display/<int:display_id>")
def edit_display(department_id: int, display_id: int):
    """Return the page to edit a display group"""
    db = DatabaseController.get()
    if not db.fetch_department_by_id(department_id):
        flask.abort(404)
    if current_user.permissions == "posting_user":
        flask.abort(401)
    streams = db.fetch_all_content_streams(permissions="Read")
    streams.filter_to_department(department_id)

    return render_template(
        "config/display/add.j2",
        departments=db.fetch_all_departments(),
        templates=db.fetch_all_page_templates(),
        existing=db.fetch_display_by_id(display_id),
        streams=streams,
        department_id=department_id,
    )


@blueprint.route("/content_stream/add")
def add_content_stream():
    """Return the page to add a content stream"""
    if current_user.permissions == "posting_user":
        flask.abort(401)
    db = DatabaseController.get()

    department = db.fetch_department_by_id(int(flask.request.args.get("department")))

    if not department:
        flask.abort(404)

    return render_template(
        "config/content_stream/add.j2",
        department=department,
        departments=db.fetch_all_departments()
        if current_user.permissions == "superuser"
        else None,
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
