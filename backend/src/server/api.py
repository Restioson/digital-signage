from http import HTTPStatus

import flask
from flask import Blueprint, Response

from server import free_form_content
from server import department
from server.database import DatabaseController
from server.free_form_content import BinaryContent

blueprint = Blueprint("api", __name__, url_prefix="/api")


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


@blueprint.route("/department", methods=["POST", "GET"])
def department_route():
    if flask.request.method == "GET":
        return {
            "department": [
                post.to_http_json()
                for post in DatabaseController.get().fetch_all_lecturers()
            ]
        }
    else:
        lecturer_id = DatabaseController.get().post_department(
            department.from_form(flask.request.form)
        )

        return {"id": lecturer_id}



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
