import json
from http import HTTPStatus

import flask
from flask import Blueprint, Response, redirect, url_for, current_app
from flask_login import (
    login_user,
    logout_user,
    current_user,
)
from server import free_form_content
from server.department import File
from server.department import Person
from server.database import DatabaseController
from server.display_group import DisplayGroup
from server.free_form_content import BinaryContent
from server.free_form_content.content_stream import ContentStream
from server.user import User
from server.valid_redirect import url_has_allowed_host_and_scheme

blueprint = Blueprint("api", __name__, url_prefix="/api")


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

    if flask.request.method == "GET":
        return {
            "content": [
                post.to_http_json()
                for post in DatabaseController.get().fetch_content_in_streams(streams)
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

    try:
        group_id = DatabaseController.get().create_display_group(
            DisplayGroup.from_form(flask.request.form), department_id
        )
        return {"id": group_id}
    except json.JSONDecodeError as err:
        return flask.abort(400, description=f"Error in layout JSON: {err}")


@blueprint.route("/department/<int:department_id>/files", methods=["POST", "GET"])
def upload_department_files(department_id: int):
    """The /api/department/files endpoint.

    POSTing to this endpoint with a form representing a new file post will add a
    file to the server and return the ID and post time upon success.
    """

    if flask.request.method == "GET":
        return {
            "content": [
                post.to_http_json()
                for post in DatabaseController.get().fetch_all_content()
            ]
        }
    else:
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()
        # needs to create file object, passing it the form attributes
        content_id = DatabaseController.get().upload_department_files(
            File.from_form(flask.request.form, flask.request.files, department_id)
        )

        return {"id": content_id}


@blueprint.route(
    "/department/<int:department_id>/<int:dislay_groups>/<string:filename>",
    methods=["GET"],
)
def get_department_files(filename: str, department_id: int):
    """Fetch file associated with department.

    Returns 404 if the content is not BinaryContent.
    """
    department_file = DatabaseController.get().fetch_file_by_id(filename, department_id)

    return Response(
        response=department_file.file_data,
        mimetype=department_file.mime_type,
        status=HTTPStatus.OK,
    )
