from bs4 import Tag


class TemplateProperty:
    def __init__(self, variable, name, property_type, default=None):
        self.variable = variable
        self.name = name
        self.type = property_type
        self.default = default

    def __repr__(self):
        return (
            f"Property {self.name}: {self.type}"
            f" {{{{ {self.variable} }}}} (default {self.default})"
        )

    @staticmethod
    def from_xml(tag: Tag):
        typ = tag.find("type").text
        default_tag = tag.find("default")

        default = None
        if default_tag:
            raw_default = default_tag.text
            default = raw_default if typ == "raw" else raw_default.strip()

        return TemplateProperty(
            tag.find("variable").text,
            tag.find("name").text,
            typ,
            default,
        )
