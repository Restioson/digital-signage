import json
from http import HTTPStatus

import flask
from flask import Blueprint, Response

from server import free_form_content
from server.department import Lecturer
from server.database import DatabaseController
from server.display_group import DisplayGroup
from server.free_form_content import BinaryContent

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
        content_id, posted = DatabaseController.get().post_content(
            free_form_content.from_form(flask.request.form, flask.request.files)
        )

        return {"id": content_id, "posted": posted}


@blueprint.route("/lecturers", methods=["POST", "GET"])
def lecturers_route():
    """The /api/lecturers end point
    GETing this endpoint fetches all the departments lecturers from the database

    POSTing to this end point inserts a new lecturer into the database
    """
    if flask.request.method == "GET":
        return {
            "lecturers": [
                lecturer.to_http_json()
                for lecturer in DatabaseController.get().fetch_all_lecturers()
            ]
        }
    else:
        lecturer_id = DatabaseController.get().upsert_lecturer(
            Lecturer.from_form(flask.request.form)
        )

        return {"id": lecturer_id}


@blueprint.route("/lecturers/<int:lecturer_id>", methods=["DELETE"])
def lecturer(lecturer_id):
    """The /api/lecturers/<id> endpoint.

    DELETEing this endpoint deletes the given lecturer in the database.
    """
    if DatabaseController.get().delete_lecturer(lecturer_id):
        return {"deleted": True}
    else:
        flask.abort(404)


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


@blueprint.route("/display_groups", methods=["POST"])
def display_groups():
    try:
        group_id = DatabaseController.get().create_display_group(
            DisplayGroup.from_form(flask.request.form)
        )
        return {"id": group_id}
    except json.JSONDecodeError as err:
        return flask.abort(400, description=f"Error in layout JSON: {err}")
