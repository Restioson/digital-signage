import sqlite3
from typing import Any
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from flask import render_template_string
from markupsafe import Markup, escape

from server.display.template import TemplateProperties
from server.display.template import TemplateProperty


class PageTemplate:
    """A PageTemplate is a template for a page within Display that has
    Jinja2 template XML to be filled out with a list of specified properties."""

    def __init__(
        self,
        name: str,
        layout_template: str,
        properties: TemplateProperties,
        intrinsic_duration: bool,
    ):
        """
        :param layout_template: the Jinja2 XML template string
        :param properties: a dictionary of property name to type.
         Supported types: content_streams, string
        """
        self.name = name
        self.layout_template = layout_template
        self.properties = properties
        self.id = None
        self.intrinsic_duration = intrinsic_duration

    @staticmethod
    def register_filters(app):
        app.jinja_env.filters["is_property"] = lambda val: isinstance(
            val, TemplateProperty
        )
        app.jinja_env.filters["youtube_code"] = youtube_code

    @staticmethod
    def from_sql(cursor: sqlite3.Cursor, row: tuple):
        row = sqlite3.Row(cursor, row)
        template = PageTemplate.from_xml_string(row["xml"])
        template.id = row["id"]
        return template

    @staticmethod
    def from_xml_string(xml: str):
        """Deserialize the given XML string into a Template"""
        soup = BeautifulSoup(xml, "lxml-xml")
        duration = soup.find("duration")
        return PageTemplate(
            soup.find("name").text,
            xml,
            TemplateProperties.from_xml(soup.find("properties")),
            duration.text == "intrinsic" if duration else False,
        )

    def __repr__(self):
        return (
            f"Template {self.name}:\n "
            f"Properties:{self.properties}\n\nLayout:{self.layout_template}"
        )

    def render_template(self, properties: dict[str, Any]) -> str:
        """Render the template to XML"""

        for prop in properties:
            template_property = self.properties.get_property(prop)

            if not template_property:
                raise RuntimeError(f"Unknown template property {prop}")

            typ = template_property.type

            if typ == "html":
                properties[prop] = Markup(properties[prop])
            elif typ == "xml-attribute":
                properties[prop] = escape(properties[prop])

        return render_template_string(self.layout_template, **properties)


def youtube_code(link: str) -> str:
    parsed = urlparse(link)

    if "youtube.com" in parsed.netloc:
        return parsed.query.split("=")[1]
    else:
        return parsed.path[1:].split("?")[0]
