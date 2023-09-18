import flask
from flask import Blueprint, render_template

from server.database import DatabaseController

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/")
def default_display():
    """Return the display view page for the default display group"""
    return display(1, 1)


@blueprint.route("/<int:department_id>/<int:display_id>/")
def display(department_id: int, display_id: int):
    """Return the display view page for a given group"""
    db = DatabaseController.get()
    display = db.fetch_display_by_id(display_id)
    if not db.fetch_department_by_id(department_id):
        flask.abort(404)
    if not display:
        flask.abort(404)
    return render_template(
        "display.j2",
        display_config={
            "department": department_id,
            "layout": display.render(db),
        },
    )
