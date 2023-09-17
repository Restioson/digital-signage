from typing import Optional

from server.display_group.template.template_property import TemplateProperty
from server.display_group.template.template_property_group import TemplatePropertyGroup

from bs4 import Tag


class TemplateProperties:
    def __init__(
        self,
        root_properties: list[TemplateProperty | TemplatePropertyGroup],
        advanced_properties: list[TemplateProperty | TemplatePropertyGroup],
    ):
        self.root = root_properties
        self.advanced = advanced_properties

    def get_property(self, variable: str) -> Optional[TemplateProperty]:
        """Get a property by its variable name"""
        return self._get_property_from_list(
            variable, self.root
        ) or self._get_property_from_list(variable, self.advanced)

    @staticmethod
    def _get_property_from_list(
        variable: str, mixed_list: list[TemplateProperty | TemplatePropertyGroup]
    ) -> Optional[TemplateProperty]:
        """Get the property from the mixed list of groups and properties"""
        for val in mixed_list:
            if isinstance(val, TemplatePropertyGroup):
                prop = val.get_property(variable)
                if prop:
                    return prop
            elif val.variable == variable:
                return val

    def __repr__(self):
        root = "\n    ".join(str(prop) for prop in self.root)
        advanced = "\n    ".join(str(prop) for prop in self.advanced)

        return (
            f"Template Properties:\n"
            f"  Root:\n    {root}\n"
            f"  Advanced:\n    {advanced}"
        )

    @staticmethod
    def get_advanced_props(tag: Tag):
        advanced = []
        for child in tag.children:
            if not isinstance(child, Tag):
                continue

            if child.name == "property":
                advanced.append(TemplateProperty.from_xml(child))
            elif child.name == "group":
                advanced.append(TemplatePropertyGroup.from_xml(child))
            else:
                raise RuntimeError(f"Invalid XML tag {child.name} in properties")
        return advanced

    @staticmethod
    def from_xml(tag: Tag):
        root = []
        advanced = []

        for child in tag:
            if not isinstance(child, Tag):
                continue

            if child.name == "property":
                root.append(TemplateProperty.from_xml(child))
            elif child.name == "group":
                root.append(TemplatePropertyGroup.from_xml(child))
            elif child.name == "advanced":
                if not advanced:
                    advanced = TemplateProperties.get_advanced_props(child)
                else:
                    raise RuntimeError("Only one instance of <advanced> is allowed")
            else:
                raise RuntimeError(f"Invalid XML tag {child.name} in properties")

        return TemplateProperties(root, advanced)
