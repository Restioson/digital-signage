from flask import Blueprint

blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route("/content")
def get_content():
    return {
        "content": [
            {"title": "Test 1", "body": "This is a test"},
            {"title": "Test 2", "body": "This is a second test"},
        ]
    }
