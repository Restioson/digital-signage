import base64
import json
import os
import sqlite3
from typing import Optional

from flask import render_template
from markupsafe import Markup
from werkzeug.datastructures import ImmutableMultiDict

from server.department.file import File


class Display:
    """A Display is a display on which things are displayed.
    Each display is owned by a department and has a defined layout."""

    def __init__(
        self,
        name: str,
        pages: list[(int, dict)],
        content_stream: Optional[int] = None,
        display_id: Optional[int] = None,
    ):
        self.name = name
        self.pages = pages
        self.content_stream = content_stream
        self.id = display_id

    # TODO refactor this if we have time. Weird that it also creates the files
    @staticmethod
    def from_form(
        department_id: int,
        form: ImmutableMultiDict,
        files: ImmutableMultiDict,
        db,
        preview_pages=None,
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
        elif preview_pages is None:
            display_id = db.reserve_display_id(department_id)
        else:
            display_id = None

        filenames = Display._extract_files(
            department_id, form, files, pages, display_id, db, preview_pages is None
        )

        for prop in form.keys():
            if prop.startswith("page-"):
                tokens = prop.split("-", maxsplit=4)
                page_no = int(tokens[1])
                variable_name = tokens[3]
                page = pages[page_no]

                if variable_name.endswith("[]"):
                    variable_name = variable_name[:-2]
                    val = form.getlist(prop)
                else:
                    val = form[prop]

                    file_prefix = f"/api/departments/{department_id}/files/"
                    if val.startswith(file_prefix):
                        filenames.append(val[len(file_prefix) :])

                page["properties"][variable_name] = val
            elif prop.startswith("duration-page-"):
                page_no = int(prop[14:])
                pages[page_no]["duration"] = form[prop]

        # Wipe files that are no longer in use
        if "display_id" in form and preview_pages is not None:
            Display._wipe_old_files(filenames, department_id, db, display_id)

        pages = [
            # This is the format of the page in the DB
            (page["template"], page["duration"], page["properties"])
            # Sort by the page number
            for page_no, page in sorted(pages.items())
            # Filter by page number if previewing
            if preview_pages is None or page_no in preview_pages
        ]

        return Display(
            name=form["name"],
            pages=pages,
            display_id=display_id,
            content_stream=db.fetch_content_stream_for_display(display_id).id
            if display_id
            else None,
        )

    @staticmethod
    def _wipe_old_files(filenames_in_use, department_id, db, display_id):
        dept = db.fetch_department_by_id(department_id, fetch_files=True)
        for file in dept.files:
            if (
                file.name.startswith(f"_group-{display_id}")
                and file.name not in filenames_in_use
            ):
                db.delete_file_by_name_and_department(file.name, department_id)

    @staticmethod
    def _extract_files(
        department_id: int,
        form: ImmutableMultiDict,
        files: ImmutableMultiDict,
        pages,
        display_id,
        db,
        is_preview=False,
    ) -> list[str]:
        """Extract any files, uploading them, putting them into the properties as links,
        and returning their names"""
        filenames = []
        for prop, file in files.items():
            tokens = prop.split("-", maxsplit=4)
            page_no = int(tokens[1])
            variable_name = tokens[3]
            page = pages[page_no]
            ext = os.path.splitext(file.filename)[1]

            if not is_preview:
                name = f"_group-{display_id}-{form['name']}-{prop}{ext}"
                filenames.append(name)

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

        return filenames

    def render(self, db):
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
