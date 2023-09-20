import flask
from flask import Blueprint, render_template

from server.database import DatabaseController

blueprint = Blueprint("display_view", __name__, url_prefix="/display")


@blueprint.route("/<int:department_id>/<int:display_id>/")
def display(department_id: int, display_id: int):
    """Return the display view page for a given group"""
    db = DatabaseController.get()
    if not db.fetch_department_by_id(department_id):
        flask.abort(404)

    display = db.fetch_display_by_id(display_id)

    if not display:
        flask.abort(404)
    return render_template(
        "display.j2",
        display_config={
            "department": department_id,
            "layout": display.render(db),
            "displayContentStream": display.content_stream,
        },
    )
