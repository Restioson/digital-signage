import flask
from flask import Blueprint, render_template

from server.database import DatabaseController

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/")
def default_display_group():
    """Return the display view page for the default display group"""
    return display_group(1, 1)


@blueprint.route("/<int:display_id>")
def display_group(display_id: int):
    """Return the display view page for a given group"""
    db = DatabaseController.get()
    display = DatabaseController.get().fetch_display_by_id(display_id)

    if not display:
        flask.abort(404)

    group = db.fetch_display_group_by_id(display.group)

    return render_template(
        "display.j2",
        display_config={
            "department": display.department,
            "layout": group.render(db),
        },
    )
