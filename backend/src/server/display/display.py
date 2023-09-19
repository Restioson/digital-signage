import base64
import json
import os
import sqlite3
from typing import Optional

from flask import render_template
from markupsafe import Markup
from werkzeug.datastructures import ImmutableMultiDict

from server.department.file import File
from server.free_form_content.content_stream import ContentStream


class Display:
    """A Display is a display on which things are displayed.
    Each display is owned by a department and has a defined layout."""

    def __init__(
        self,
        name: str,
        pages: list[(int, dict)],
        content_streams: Optional[list[ContentStream]] = None,
        display_id: Optional[int] = None,
    ):
        self.name = name
        self.pages = pages
        self.content_streams = content_streams or []
        self.id = display_id

    # TODO refactor this if we have time. Weird that it also creates the files
    @staticmethod
    def from_form(
        department_id: int,
        form: ImmutableMultiDict,
        files: ImmutableMultiDict,
        db,
        is_preview=False,
    ):
        pages = {
            int(prop[14:]): {
                "template": template,
                "properties": dict(),
            }
            for prop, template in form.items()
            if prop.startswith("template-page-")
        }

        if "display_id" in form:
            display_id = form["display_id"]

            if not is_preview:
                db.delete_files_for_display(
                    department_id, int(display_id)
                )  # Wipe old files

        elif not is_preview:
            display_id = db.reserve_display_id(department_id)
        else:
            display_id = None

        for prop, file in files.items():
            tokens = prop.split("-", maxsplit=4)
            page_no = int(tokens[1])
            variable_name = tokens[3]
            page = pages[page_no]
            ext = os.path.splitext(file.filename)[1]

            if not is_preview:
                name = f"_group-{display_id}-{form['name']}-{prop}{ext}"

                db.upload_department_file(
                    File(
                        name,
                        department_id,
                        file.content_type,
                        file.stream.read(),
                    ),
                )

                url = f"/api/departments/{department_id}/files/{name}"
            else:
                b64 = base64.b64encode(file.stream.read()).decode("utf-8")
                url = f"data:{file.content_type};base64,{b64}"

            page["properties"][variable_name] = url

        for prop in form.keys():
            if prop.startswith("page-"):
                tokens = prop.split("-", maxsplit=4)
                page_no = int(tokens[1])
                variable_name = tokens[3]
                page = pages[page_no]

                if variable_name.endswith("[]"):
                    val = form.getlist(prop)
                else:
                    val = form[prop]

                page["properties"][variable_name] = val
            elif prop.startswith("duration-page-"):
                page_no = int(prop[14:])
                pages[page_no]["duration"] = int(form[prop])

        pages = [
            (page["template"], page["duration"], page["properties"])
            for page_no, page in sorted(pages.items())
        ]

        return Display(
            name=form["name"],
            pages=pages,
            display_id=display_id,
        )

    def render(self, db):
        print(json.dumps(self.pages))
        return render_template(
            "display_layout.j2.xml",
            pages=[
                (
                    duration,
                    Markup(
                        db.fetch_page_template_by_id(template).render_template(
                            properties
                        )
                    ),
                )
                for (template, duration, properties) in self.pages
            ],
        )

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a Display object"""

        row = sqlite3.Row(cursor, row)
        return Display(
            display_id=row["id"],
            name=row["name"],
            pages=json.loads(row["pages_json"]),
        )