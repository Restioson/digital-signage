INSERT INTO
  department (id, name, bio)
VALUES
  (1, 'Default', 'Default department');
INSERT INTO
  display_groups (id, name, department, layout_json)
VALUES
  (
    1,
    'Default',
    1,
    '{ "type": "container", "children": [ {"type": "clock"}, {"type": "department"}, {"type": "content_stream"} ] }'
  );
