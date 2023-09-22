INSERT INTO
  departments (id, name, bio)
VALUES
  (
    1,
    'UCT Admin',
    'This is the UCT admin department which is used as general department'
  );
INSERT INTO
  content_streams (id, name, department, permissions)
VALUES
  (1, 'UCT Announcements', 1, 'writeable');
INSERT INTO
  content_streams (id, name, department, permissions)
VALUES
  (2, 'UCT Urgent Announcements', 1, 'writeable');
