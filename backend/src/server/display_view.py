import json

import flask
from flask import Blueprint, render_template

from server.database import DatabaseController

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/")
def default_display_group():
    """Return the display view page for the default display group"""
    return display_group(1)


@blueprint.route("/<int:group_id>")
def display_group(group_id: int):
    """Return the display view page for a given group"""
    group = DatabaseController.get().fetch_display_group_by_id(group_id)

    if not group:
        flask.abort(404)

    layout = group.layout_json

    return render_template(
        "display.j2",
        layout_json=json.loads(layout),
    )
