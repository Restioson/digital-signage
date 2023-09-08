INSERT INTO
  departments (id, name, bio)
VALUES
  (1, 'Default', 'Default department');
INSERT INTO
  display_groups (id, name, department, layout_json)
VALUES
  (
    1,
    'Default',
    1,
    '{ "type": "container", "children": [ {"type": "clock"}, {"type": "department"}, {"type": "content_stream", "streams": [1]} ] }'
  );
INSERT INTO
  content_streams (id, name)
VALUES
  (1, 'UCT Announcements');
