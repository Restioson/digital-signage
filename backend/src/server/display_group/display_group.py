import sqlite3
from typing import Optional

from flask import render_template
from markupsafe import Markup, escape
from werkzeug.datastructures import ImmutableMultiDict

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
    def from_form(form: ImmutableMultiDict, db):
        pages = {
            prop[14:]: {
                "template": db.fetch_page_template_by_id(form.get(prop)),
                "properties": dict(),
            }
            for prop in form.keys()
            if prop.startswith("template-page-")
        }

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
