INSERT INTO
  departments (id, name, bio)
VALUES
  (1, 'Default', 'Default department');
INSERT INTO
  display_groups (id, name, department, layout_xml)
VALUES
  (
    1,
    'Default',
    1,
    '<container> <clock> <loadshedding> <department> <content-stream><stream id="1"></content-stream> </container>'
  );
INSERT INTO
  content_streams (id, name)
VALUES
  (1, 'UCT Announcements');
INSERT INTO
  loadshedding_schedules (id, schedule_json)
VALUES
  (1, 'default text');
