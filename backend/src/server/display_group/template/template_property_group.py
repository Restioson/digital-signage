from typing import Optional

from bs4 import Tag

from server.display_group.template.template_property import TemplateProperty


class TemplatePropertyGroup:
    def __init__(self, name: str, properties: list[TemplateProperty]):
        self.name = name
        self.properties = properties

    def __repr__(self):
        return f"Property group {self.name}: {self.properties}"

    def get_property(self, variable: str) -> Optional[TemplateProperty]:
        """Get a property by its variable name"""
        return next(
            (prop for prop in self.properties if prop.variable == variable), None
        )

    @staticmethod
    def from_xml(tag: Tag):
        return TemplatePropertyGroup(
            tag.find("name").text,
            list(map(TemplateProperty.from_xml, tag("property"))),
        )
