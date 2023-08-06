from flask import Blueprint

blueprint = Blueprint("index", __name__, url_prefix="/")


@blueprint.route("/")
def index():
    return """<p>Welcome to campusign</p>
            <p> <a href="/config">link to the configuration view</a> </p>
            <p> <a href="/display">link to the display view</a> </p>"""
