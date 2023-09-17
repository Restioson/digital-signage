import sqlite3
from typing import Any

from bs4 import BeautifulSoup
from flask import render_template_string
from markupsafe import Markup, escape

from server.display_group.template import TemplateProperties
from server.display_group.template import TemplateProperty


class PageTemplate:
    """A PageTemplate is a template for a page within DisplayGroup that has
    Jinja2 template XML to be filled out with a list of specified properties."""

    def __init__(
        self,
        name: str,
        layout_template: str,
        properties: TemplateProperties,
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

    @staticmethod
    def register_filters(app):
        app.jinja_env.filters["is_property"] = lambda val: isinstance(
            val, TemplateProperty
        )

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
        return PageTemplate(
            soup.find("name").text,
            xml,
            TemplateProperties.from_xml(soup.find("properties")),
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
