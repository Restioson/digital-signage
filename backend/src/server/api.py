import flask
from flask import Blueprint

from server import free_form_content
from server.database import DatabaseController

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
            free_form_content.from_form(flask.request.form)
        )

        return {"id": content_id, "posted": posted}
