INSERT INTO
  departments (id, name, bio)
VALUES
  (1, 'Default', 'Default department');
INSERT INTO
  display_groups (id, name, department, pages_json)
VALUES
  (
    1,
    'Default',
    1,
    '[["1", 10, {"calendar_iframe": "<iframe\r\n        src=\"https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=Africa%2FJohannesburg&showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&mode=AGENDA&showTz=0&showCalendars=0&src=MDRkZjNjZTQ2M2EzNjgzZmNhYmY1NWJiYTY4ZWZlOTNmMWU0ZTMyZTQ2MzNlMDBiYjRhZDY0YWI0ODMxZjQwNUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23795548\"\r\n        style=\"border:solid 1px #777\" width=\"800\" height=\"600\"frameborder=\"0\"\r\n        scrolling=\"no\"></iframe>", "department_name": "UCT School of IT", "department_color": "#d86613", "calendar_scale": "3", "theme_color": "#003eaa", "clock_text_color": "#000000", "sidebar_logo": "https://upload.wikimedia.org/wikipedia/en/7/7c/University_of_Cape_Town_logo.svg", "time_format": "[<div class=''day''>]dddd[</div>]\r\n[<div class=''date''>]D MMMM YYYY[</div>]\r\n[<div class=''time''>]HH:mm:ss[</div>]"}]]'
  );
INSERT INTO
  content_streams (id, name)
VALUES
  (1, 'UCT Announcements');
INSERT INTO
  loadshedding_schedules (id, schedule_json)
VALUES
  (1, 'default text');
