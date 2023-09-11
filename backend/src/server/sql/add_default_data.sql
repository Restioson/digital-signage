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
    '<container> <clock> <department> <content-stream><stream id="1"></content-stream> </container>'
  );
INSERT INTO
  content_streams (id, name)
VALUES
  (1, 'UCT Announcements');
