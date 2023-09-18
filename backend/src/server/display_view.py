import flask
from flask import Blueprint, render_template

from server.database import DatabaseController

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/")
def default_display_group():
    """Return the display view page for the default display group"""
    return display_group(1, 1)


@blueprint.route("/<int:department_id>/<int:group_id>/")
def display_group(department_id: int, group_id: int):
    """Return the display view page for a given group"""
    db = DatabaseController.get()
    group = db.fetch_display_group_by_id(group_id)
    if not db.fetch_department_by_id(department_id):
        flask.abort(404)
    if not group:
        flask.abort(404)
    return render_template(
        "display.j2",
        display_config={
            "department": department_id,
            "layout": group.render(db),
        },
    )
