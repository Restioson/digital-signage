from http import HTTPStatus
import json
import pandas as pd
import flask
from flask import Blueprint, Response, redirect, url_for, current_app, render_template
from flask_login import (
    login_user,
    logout_user,
    current_user,
)
from server import free_form_content
from server.database import DatabaseController
from server.department.file import File
from server.department.person import Person
from server.display_group import DisplayGroup
from server.free_form_content import BinaryContent
from server.free_form_content.content_stream import ContentStream
from server.user import User
from server.valid_redirect import url_has_allowed_host_and_scheme


blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route("/loadshedding_schedule", methods=["GET"])
def loadshedding():
    """
    Returns the stored loadshedding schedule
    Right now it is locked to the region of UCT
    """
    schedule_data = DatabaseController.get().fetch_loadshedding_schedule(1)
    schedule_json = json.dumps(schedule_data, indent=4)
    response = Response(schedule_json, content_type="application/json")

    return response


@blueprint.route("/health", methods=["GET"])
def health():
    """The health check endpoint.

    This returns whether the server is healthy.
    """

    return {"healthy": True}


@blueprint.route("/content_streams", methods=["POST", "GET"])
def list_content_streams():
    """The /api/content_streams endpoint.

    POSTing to this endpoint with a form representing a new content stream
    will create the content stream and return its id.
    """

    db = DatabaseController.get()

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    stream_id = db.create_content_stream(ContentStream.from_form(flask.request.form))

    return {"id": stream_id}


@blueprint.route("/content", methods=["POST", "GET"])
def content():
    """The /api/content endpoint.

    GETting this endpoint will return a list of all the content in the given streams
    (which are given by query parameters) in the reverse order of posting
    (most recent to least recent). Binary blobs will not be fetched and must be
    fetched separately using the /api/content/<id>/blob endpoint.

    POSTing to this endpoint with a form representing a new content post will create
    the post in the given stream and return the ID and post time upon success.
    """

    streams = flask.request.args.getlist("stream")
    limit = int(last if (last := flask.request.args.get("last")) else 0) or None

    if flask.request.method == "GET":
        return {
            "content": [
                post.to_http_json()
                for post in DatabaseController.get().fetch_content_in_streams(
                    streams, limit=limit
                )
            ]
        }
    else:
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()

        content_id, posted = DatabaseController.get().post_content(
            free_form_content.from_form(flask.request.form, flask.request.files)
        )

        return {"id": content_id, "posted": posted}


@blueprint.route("/departments/<int:department_id>/people", methods=["POST", "GET"])
def people_route(department_id: int):
    """The /api/departments/<id>/people end point
    GETing this endpoint fetches all the departments people from the database

    POSTing to this end point inserts a new person into the database
    """
    dept = DatabaseController.get().fetch_department_by_id(
        department_id, fetch_people=True
    )

    if not dept:
        flask.abort(404)

    if flask.request.method == "GET":
        return {"people": [person.to_http_json() for person in dept.people]}
    else:
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()

        person_id = DatabaseController.get().upsert_person(
            Person.from_form(flask.request.form), department_id
        )

        return {"id": person_id}


@blueprint.route(
    "/departments/<int:department_id>/people/<int:person_id>", methods=["DELETE"]
)
def person(department_id: int, person_id: int):
    """The /api/departments/<dept_id>/people/<id> endpoint.

    DELETEing this endpoint deletes the given person in the database.
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    if not DatabaseController.get().fetch_department_by_id(
        department_id, fetch_people=True
    ):
        flask.abort(404)

    if DatabaseController.get().delete_person(person_id):
        return {"deleted": True}
    else:
        flask.abort(404)


@blueprint.route("/departments/<int:department_id>/uploadtable", methods=["POST"])
def upload_table(department_id: int):
    """The /api/departments/<dept_id>/upload_table endpoint.
    POSTing this endpoint uploads the posted table to its database
    """

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    try:
        excel_file = flask.request.files["add_table"]
        df = pd.read_excel(excel_file, engine="openpyxl")
        people = []
        # Iterate through rows in the uploaded excel creating people
        for index, row in df.iterrows():
            person = Person(
                row["title"],
                row["full_name"],
                row["position"],
                row["office_hours"],
                row["office_location"],
                row["email"],
                row["phone"],
            )
            people.append(person)
        # Seperate loops so that any error in the whole table
        # is caught before any entry is added
        # loop through people to add each to the table
        db = DatabaseController.get()
        for person in people:
            db.upsert_person(person, department_id)
        return {
            "id": "response needed",
            "response": "Excel file is a valid file. Upload successful",
        }
    except Exception:
        return flask.abort(400)


@blueprint.route("/register", methods=["POST"])
def registration_route():
    form = flask.request.form

    if flask.request.method == "POST":
        if not (DatabaseController.get().user_exists(form["email"])):
            DatabaseController.get().insert_user(
                form["email"],
                form["screen_name"],
                form["password"],
            )
            user = User(form["email"], form["screen_name"])
            login_user(user)
            return redirect(url_for("config_view.index"))

        else:
            flask.abort(401)


@blueprint.route("/login", methods=["POST", "GET"])
def login_route():
    form = flask.request.form

    if DatabaseController.get().user_exists(form["email"]):
        user = DatabaseController.get().try_login(form["email"], form["password"])
        if user:
            login_user(user)

            redirect_to = flask.request.args.get("next")
            # url_has_allowed_host_and_scheme should check if the url is safe
            if not url_has_allowed_host_and_scheme(redirect_to, flask.request.host):
                return flask.abort(400)

            return flask.redirect(redirect_to or flask.url_for("config_view.index"))
        else:
            return flask.abort(401)
            # custom error
    else:
        return flask.abort(401)
        # custom error


@blueprint.route("/logout", methods=["GET"])
def logout_route():
    logout_user()
    return redirect(url_for("login.login"))


@blueprint.route("/content/<int:content_id>/blob", methods=["GET"])
def content_blob(content_id: int):
    """Fetch the blob (Binary Large OBject) associated with the given content.

    Returns 404 if the content is not BinaryContent.
    """
    post = DatabaseController.get().fetch_content_by_id(content_id, fetch_blob=True)

    if isinstance(post, BinaryContent):
        return Response(
            response=post.blob, mimetype=post.mime_type, status=HTTPStatus.OK
        )
    else:
        flask.abort(404)


@blueprint.route("/departments/<int:department_id>/display_groups", methods=["POST"])
def display_groups(department_id: int):
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    db = DatabaseController.get()
    group_id = db.create_display_group(
        DisplayGroup.from_form(
            department_id, flask.request.form, flask.request.files, db
        ),
        department_id,
    )
    return {"id": group_id}


@blueprint.route("/departments/<int:department_id>/preview_display", methods=["POST"])
def preview_display(department_id: int):
    """Preview the given display group without actually creating it"""

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    db = DatabaseController.get()
    group = DisplayGroup.from_form(
        department_id,
        flask.request.form,
        flask.request.files,
        db,
        is_preview=True,
    )
    return render_template(
        "display.j2",
        display_config={
            "department": department_id,
            "layout": group.render(db),
        },
    )


@blueprint.route("/department/<int:department_id>/files", methods=["POST", "GET"])
def upload_department_files(department_id: int):
    """The /api/department/files endpoint.

    POSTing to this endpoint with a form representing a new file post will add a
    file to the server and return the ID and post time upon success.
    """

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    content_id = DatabaseController.get().upload_department_file(
        File.from_form(flask.request.form, flask.request.files, department_id)
    )

    return {"id": content_id}


@blueprint.route(
    "/department/<int:department_id>/<int:dislay_groups>/<string:filename>",
    methods=["GET"],
)
def get_department_files(filename: str, department_id: int):
    department_file = DatabaseController.get().fetch_file_by_id(filename, department_id)

    if department_file:
        return Response(
            response=department_file.file_data,
            mimetype=department_file.mime_type,
            status=HTTPStatus.OK,
        )
    else:
        flask.abort(404)


@blueprint.route(
    "/departments/<int:department_id>/files/<string:file_name>",
    methods=["DELETE", "GET"],
)
def file(department_id: int, file_name: str):
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    if flask.request.method == "DELETE":
        if DatabaseController.get().delete_file_by_name_and_department(
            file_name, department_id
        ):
            return {"deleted": True}
        else:
            flask.abort(404)
    else:
        file = DatabaseController.get().fetch_file_by_id(file_name, department_id)

        if isinstance(file, File):
            return Response(
                response=file.file_data, mimetype=file.mime_type, status=HTTPStatus.OK
            )
        else:
            flask.abort(404)
