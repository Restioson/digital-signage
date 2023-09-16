import os
import sqlite3
from typing import Optional
import uuid

from flask import render_template
from markupsafe import Markup, escape
from werkzeug.datastructures import ImmutableMultiDict

from server.department.file import File
from server.free_form_content.content_stream import ContentStream


class DisplayGroup:
    """A DisplayGroup is a template for how a display should look. Many displays
    can look the same, hence they are grouped like this. Each display group is
    owned by a department and has a defined layout."""

    def __init__(
        self,
        name: str,
        layout_xml: str,
        content_streams: Optional[list[ContentStream]] = None,
        group_id: Optional[int] = None,
    ):
        self.name = name
        self.layout_xml = layout_xml
        self.content_streams = content_streams or []
        self.id = group_id

    @staticmethod
    def from_form(
        department_id: int,
        form: ImmutableMultiDict,
        files: ImmutableMultiDict,
        db,
        is_preview=False,
    ):
        pages = {
            prop[14:]: {
                "template": db.fetch_page_template_by_id(form.get(prop)),
                "properties": dict(),
            }
            for prop in form.keys()
            if prop.startswith("template-page-")
        }

        for prop, file in files.items():
            tokens = prop.split("-", maxsplit=4)
            page_no = tokens[1]
            variable_name = tokens[3]
            page = pages[page_no]
            ext = os.path.splitext(file.filename)[1]

            prefix = uuid.uuid4().hex if is_preview else ""
            name = f"{prefix}{form['name']}-{prop}{ext}"

            db.upload_department_file(
                File(
                    name,
                    department_id,
                    file.content_type,
                    file.stream.read(),
                ),
                temp=is_preview,
            )

            url = f"/api/departments/{department_id}/files/{name}"
            pages[page_no]["properties"][variable_name] = url

        for prop in form.keys():
            if prop.startswith("page-"):
                tokens = prop.split("-", maxsplit=4)
                page_no = tokens[1]
                variable_name = tokens[3]
                page = pages[page_no]

                if variable_name.endswith("[]"):
                    val = form.getlist(prop)
                else:
                    val = form[prop]

                template_property = page["template"].properties.get_property(
                    variable_name
                )

                if not template_property:
                    raise RuntimeError(f"Unknown template property {variable_name}")

                typ = template_property.type

                if typ == "html":
                    val = Markup(val)
                elif typ == "xml-attribute":
                    val = escape(val)

                page["properties"][variable_name] = val

        pages = [
            Markup(page["template"].render_template(page["properties"]))
            for page_no, page in sorted(pages.items())
        ]

        layout_xml = render_template("display_layout.j2.xml", pages=pages)

        return DisplayGroup(
            name=form["name"],
            layout_xml=layout_xml,
        )

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        """Parse the given SQL row into a DisplayGroup object"""

        row = sqlite3.Row(cursor, row)
        return DisplayGroup(
            group_id=row["id"],
            name=row["name"],
            layout_xml=row["layout_xml"],
        )
