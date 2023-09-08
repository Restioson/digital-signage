PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY,
  stream INTEGER NOT NULL REFERENCES content_streams(id),
  posted INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (
    content_type IN (
      'text',
      'local_image',
      'remote_image',
      'video',
      'link',
      'qrcode_content'
    )
  ),
  content_json TEXT NOT NULL,
  blob_mime_type TEXT,
  content_blob BLOB,
  CHECK (
    (
      content_blob IS NULL
      AND blob_mime_type IS NULL
    )
    OR (
      content_blob IS NOT NULL
      AND blob_mime_type IS NOT NULL
    )
  )
);
CREATE INDEX IF NOT EXISTS content_by_stream ON content(stream);
CREATE TABLE IF NOT EXISTS content_streams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  display_group INTEGER REFERENCES display_groups(id) ON DELETE CASCADE,
  department INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  CHECK (
    NOT (
      department IS NOT NULL
      AND display_group IS NOT NULL
    )
  ) -- Only one (or none, for public) must be present
);
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY,
  department INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  office_hours TEXT NOT NULL,
  office_location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS person_by_department ON people(department);
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT
);
CREATE TABLE IF NOT EXISTS display_groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  layout_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS group_by_department ON display_groups(department);
CREATE TABLE IF NOT EXISTS users (
  --make email primary key
  email TEXT PRIMARY KEY,
  screen_name TEXT NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS files (
  department_id INTEGER NOT NULL REFERENCES departments(id),
  filename TEXT NOT NULL,
  file_content BLOB NOT NULL,
  mime_type TEXT NOT NULL,
  PRIMARY KEY (department_id, filename)
);
