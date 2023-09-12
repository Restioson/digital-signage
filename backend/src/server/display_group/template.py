import typing
from flask import render_template_string
from server.display_group.template_property import TemplateProperty


class Template:
    """A Template is a template for a DisplayGroup that has
    Jinja2 template XML to be filled out with a list of specified properties."""

    def __init__(self, layout_template: str, properties: list[TemplateProperty]):
        """

        :param layout_template: the Jinja2 XML template
        :param properties: a dictionary of property name to type.
         Supported types: content_streams, string
        """
        self.layout_template = layout_template
        self.properties = properties

    def render_template(self, values: dict[str, typing.Any]) -> str:
        """Render the template to XML"""
        print(self.layout_template, values)
        return render_template_string(self.layout_template, **values)


TEMPLATES = [
    (
        "Simple",
        Template(
            layout_template="""
            <container>
                <clock format="{{ clock_format }}">
                <rotation secs-per-page="{{ secs_per_page }}">
                    <department>
                    <content-stream
                        fetch-amount="{{ fetch_amount }}"
                        secs-per-page="{{ content_rotation_secs }}"
                        page-size="{{ page_size }}"
                    >
                        {% for stream in streams %}
                            <stream id="{{ stream }}">
                        {% endfor %}
                    </content-stream>
                </rotation>
            </container>
        """,
            properties=[
                TemplateProperty(
                    "clock_format",
                    "Clock format",
                    "string",
                    default="MMMM Do, h:mm:ss a",
                ),
                TemplateProperty(
                    "secs_per_page",
                    "Time to display each page (secs)",
                    "string",
                    default="30",
                ),
                TemplateProperty(
                    "page_size",
                    "Number of posts to display at a time (blank for all)",
                    "string",
                ),
                TemplateProperty(
                    "content_rotation_secs", "Time per page of content (secs)", "string"
                ),
                TemplateProperty(
                    "fetch_amount", "Number of content posts to fetch", "string"
                ),
                TemplateProperty("streams", "Content streams", "content_streams"),
            ],
        ),
    ),
    (
        "Content Only",
        Template(
            layout_template="""
            <content-stream secs-per-page="{{ rotation_secs }}" page-size="{{ page_size }}">
                {% for stream in streams %}
                    <stream id="{{ stream }}">
                {% endfor %}
            </content-stream>
            """,
            properties=[
                TemplateProperty(
                    "page_size",
                    "Number of posts to display at a time (blank for all)",
                    "string",
                ),
                TemplateProperty(
                    "rotation_secs", "Time per page of content (secs)", "string"
                ),
                TemplateProperty("streams", "Content streams", "content_streams"),
            ],
        ),
    ),
]
