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
from server.department import Lecturer
from server.department import File
from server.database import DatabaseController
from server.display_group import DisplayGroup
from server.free_form_content import BinaryContent
from server.user import User


blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route("/health", methods=["GET"])
def health():
    """The health check endpoint.

    This returns whether the server is healthy.
    """

    return {"healthy": True}


@blueprint.route("/content", methods=["POST", "GET"])
def content():
    """The /api/content endpoint.

    GETting this endpoint will return a list of all the content on the server
    in the reverse order of posting (most recent to least recent). Binary blobs
    will not be fetched and must be fetched separately using the /api/content/<id>/blob
    endpoint.

    POSTing to this endpoint with a form representing a new content post will create
    the post on the server and return the ID and post time upon success.
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

        content_id, posted = DatabaseController.get().post_content(
            free_form_content.from_form(flask.request.form, flask.request.files)
        )

        return {"id": content_id, "posted": posted}


@blueprint.route("/departments/<int:department_id>/lecturers", methods=["POST", "GET"])
def lecturers_route(department_id: int):
    """The /api/departments/<id>/lecturers end point
    GETing this endpoint fetches all the departments lecturers from the database

    POSTing to this end point inserts a new lecturer into the database
    """
    dept = DatabaseController.get().fetch_department_by_id(
        department_id, fetch_lecturers=True
    )

    if not dept:
        print("Not dept")
        flask.abort(404)

    if flask.request.method == "GET":
        return {"lecturers": [lecturer.to_http_json() for lecturer in dept.lecturers]}
    else:
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()

        lecturer_id = DatabaseController.get().upsert_lecturer(
            Lecturer.from_form(flask.request.form), department_id
        )

        return {"id": lecturer_id}


@blueprint.route(
    "/departments/<int:department_id>/lecturers/<int:lecturer_id>", methods=["DELETE"]
)
def lecturer(department_id: int, lecturer_id: int):
    """The /api/departments/<dept_id>/lecturers/<id> endpoint.

    DELETEing this endpoint deletes the given lecturer in the database.
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    if not DatabaseController.get().fetch_department_by_id(
        department_id, fetch_lecturers=True
    ):
        flask.abort(404)

    if DatabaseController.get().delete_lecturer(lecturer_id):
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
            return redirect(url_for("config_view.index"))
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
