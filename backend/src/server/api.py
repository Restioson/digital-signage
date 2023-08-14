import flask
from flask import Blueprint

from server import free_form_content

blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route("/content", methods=["POST", "GET"])
def content():
    if flask.request.method == "GET":
        return {
            "content": [
                {"title": "Test 1", "body": "This is a test"},
                {"title": "Test 2", "body": "This is a second test"},
            ]
        }
    else:
        return free_form_content.from_form(flask.request.form).to_json()
