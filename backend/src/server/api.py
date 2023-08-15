from http import HTTPStatus

import flask
from flask import Blueprint, Response

from server import free_form_content
from server.database import DatabaseController
from server.free_form_content import BinaryContent

blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route("/content", methods=["POST", "GET"])
def content():
    if flask.request.method == "GET":
        return {
            "content": [
                post.to_http_json()
                for post in DatabaseController.get().fetch_all_content()
            ]
        }
    else:
        content_id, posted = DatabaseController.get().post_content(
            free_form_content.from_dict_and_files(
                flask.request.form, flask.request.files
            )
        )

        return {"id": content_id, "posted": posted}


@blueprint.route("/content/<int:content_id>/blob", methods=["GET"])
def content_blob(content_id: int):
    post = DatabaseController.get().fetch_content_by_id(content_id, fetch_blob=True)

    if isinstance(post, BinaryContent):
        return Response(
            response=post.blob, mimetype=post.mime_type, status=HTTPStatus.OK
        )
    else:
        flask.abort(404)
