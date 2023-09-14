import typing
from flask import render_template
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
        return render_template(f"layouts/{self.layout_template}", **values)


TEMPLATES = [
    (
        "Simple",
        Template(
            layout_template="simple.j2.xml",
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
        "Chris Hani (Learning Lounge)",
        Template(
            layout_template="chris_hani.j2.xml",
            properties=[
                TemplateProperty(
                    "bg_content_url",
                    "Background image for content page (URL)",
                    "string",
                    default="https://static.vecteezy.com/system/resources/previews/008/"
                    "139/407/large_2x/the-scientists-chemists-researcher-discover-the-"
                    "chemical-formula-write-on-whiteboard-in-laboratory-the-researcher-"
                    "discover-vaccine-or-drug-for-treatment-patients-infected-covid19-"
                    "photo.jpg",
                ),
                TemplateProperty(
                    "bg_loadshedding_url",
                    "Background image for loadshedding (URL)",
                    "string",
                    default="https://media.istockphoto.com/id/1408155641/photo/"
                    "concept-of-loadshedding.jpg?s=612x612&w=0&k=20&c="
                    "yjAcwlmeUfjxW62emflmKoIQ3yjyBowK7H4JdlliIIg=",
                ),
                TemplateProperty(
                    "calendar_iframe",
                    "Calendar embed code (iframe)",
                    "string",
                    default='<iframe src="https://calendar.google.com/calendar/embed?'
                    "height=600&wkst=2&bgcolor=%23ffffff&ctz=Africa%2FJohannesburg&"
                    "showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&mode="
                    "AGENDA&showTz=0&showCalendars=0&src=MDRkZjNjZTQ2M2EzNjgzZmNhY"
                    "mY1NWJiYTY4ZWZlOTNmMWU0ZTMyZTQ2MzNlMDBiYjRhZDY0YWI0ODMxZjQwNU"
                    'Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23795548" style='
                    '"border:solid 1px #777" width="800" height="600"'
                    'frameborder="0" scrolling="no"></iframe>',
                ),
                TemplateProperty(
                    "calendar_scale",
                    "Calendar scale (e.g 2 for 2x size)",
                    "string",
                    default="3",
                ),
                TemplateProperty(
                    "room_name",
                    "Room name",
                    "string",
                    default="my room",
                ),
                TemplateProperty(
                    "font_size",
                    "Base font size (px or pt)",
                    "string",
                    default="16px",
                ),
                TemplateProperty(
                    "time_format",
                    "Time format",
                    "string",
                    default="h:mm:ss a",
                ),
                TemplateProperty(
                    "date_format",
                    "Date format",
                    "string",
                    default="[<span class='date'>]D[</span>]"
                    "[<span class='month'>]MMMM[</span>]"
                    "[<br>]"
                    "[<span class='day'>]dddd[</span>]",
                ),
                TemplateProperty(
                    "fetch_amount", "Number of content posts to fetch", "string"
                ),
                TemplateProperty(
                    "page_size",
                    "Number of posts to display at a time (blank for all)",
                    "string",
                ),
                TemplateProperty(
                    "content_rotation_secs", "Time per page of content (secs)", "string"
                ),
                TemplateProperty("streams", "Content streams", "content_streams"),
                TemplateProperty(
                    "page_secs",
                    "Time per screen (e.g loadshedding, calendar, custom pages)",
                    "string",
                    default=15,
                ),
                TemplateProperty(
                    "custom_pages",
                    "Custom pages (HTML)",
                    "pages",
                ),
            ],
        ),
    ),
    (
        "Content Only",
        Template(
            layout_template="content_only.j2.xml",
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
