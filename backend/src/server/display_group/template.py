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
        return render_template_string(self.layout_template, **values)


TEMPLATES = [
    (
        "Simple",
        Template(
            layout_template="""
            <container>
                <clock format="{{ clock_format }}">
                <loadshedding>
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
        "Chris Hani (Learning Lounge)",
        Template(
            layout_template="""
            <container html:id="main">
                <style>
                    #main {
                        background: url({{ background_image_url }})
                                    no-repeat center center fixed;
                        min-height: 100%;
                        -webkit-background-size: cover;
                        -moz-background-size: cover;
                        -o-background-size: cover;
                        background-size: cover;
                        display: grid;
                        grid-template-rows: auto 2fr 3fr auto;
                        grid-gap: 1em;
                        padding-left: 25px;
                        padding-right: 25px;
                    }

                    #screen-body {
                        display: flex;
                        flex-direction: column;
                    }

                    #header-text {
                        text-align: right;
                        color: blue;
                        font-size: 34pt;
                    }

                    #calendar-container {
                        display: flex;
                        flex-direction: row;
                    }

                    #calendar-container .clock {
                        text-align: left;
                        font-weight: bold;
                    }

                    #calendar-container .clock .month {
                        margin-left: 5px;
                        font-size: 22pt;
                        color: purple;
                    }

                    #calendar-container .clock .day {
                        font-size: 20pt;
                        color: purple;
                    }

                    #calendar-container > *:last-child {
                        flex: 1;
                    }

                    .scaled-iframe {
                        width: 50%;
                        height: 50%;
                        transform: scale(2);
                        transform-origin: top left;
                    }

                    #time-clock {
                        text-align: left;
                        font-weight: bold;
                        font-size: 32pt;
                        color: black;
                        -webkit-text-fill-color: white;
                        -webkit-text-stroke-width: 1px;
                        -webkit-text-stroke-color: black;
                    }

                    #stream {
                        flex-grow: 2;
                    }

                    .content-stream > div {
                        height: unset;
                    }
                </style>

                <html html:id="header-text">{{ room_name }}</html>

                <container html:id="calendar-container">
                    <clock format="{{ date_format|safe }}">
                    <container>
                        <html html:id="calendar" html:class="scaled-iframe">
                            {{ calendar_iframe|safe }}
                        </html>
                    </container>
                </container>

                <container html:id="stream">
                    <content-stream
                        fetch-amount="{{ fetch_amount }}"
                        secs-per-page="{{ content_rotation_secs }}"
                        page-size="{{ page_size }}"
                    >
                        {% for stream in streams %}
                            <stream id="{{ stream }}">
                        {% endfor %}
                    </content-stream>
                </container>

                <clock html:id="time-clock" format="{{ time_format|safe }}">
            </container>
        """,
            properties=[
                TemplateProperty(
                    "background_image_url",
                    "Background image (URL)",
                    "string",
                    default="https://static.vecteezy.com/system/resources/previews/008/"
                    "139/407/large_2x/the-scientists-chemists-researcher-discover-the-"
                    "chemical-formula-write-on-whiteboard-in-laboratory-the-researcher-"
                    "discover-vaccine-or-drug-for-treatment-patients-infected-covid19-"
                    "photo.jpg",
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
                    "room_name",
                    "Room name",
                    "string",
                    default="my room",
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
            ],
        ),
    ),
    (
        "Content Only",
        Template(
            layout_template="""
            <content-stream secs-per-page="{{ rotation_secs }}"
                page-size="{{ page_size }}">
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
