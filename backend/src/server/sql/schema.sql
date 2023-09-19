PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT
);
CREATE TABLE IF NOT EXISTS displays (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  pages_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS content_streams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  display INTEGER REFERENCES displays(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  posted INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (
    content_type IN (
      'text',
      'local_image',
      'remote_image',
      'video',
      'link',
      'iframe_content',
      'qrcode_content',
      'local_video'
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
<<<<<<< HEAD
CREATE TABLE IF NOT EXISTS content_stream_membership (
  stream INTEGER NOT NULL REFERENCES content_streams(id) ON DELETE CASCADE,
  content INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  PRIMARY KEY (stream, content)
=======
CREATE INDEX IF NOT EXISTS content_by_stream ON content(stream);
CREATE TABLE IF NOT EXISTS content_streams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  display_group INTEGER REFERENCES display_groups(id) ON DELETE CASCADE,
  department INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  permissions TEXT NOT NULL CHECK (
    permissions IN (
      'private',
      'readable',
      'writeable'
    )
  ),
  display INTEGER REFERENCES displays(id) ON DELETE CASCADE
>>>>>>> 2bda457 (Begining of work)
);
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  image_data BLOB NOT NULL,
  position TEXT NOT NULL,
  office_hours TEXT NOT NULL,
  office_location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS person_by_department ON people(department);
CREATE INDEX IF NOT EXISTS group_by_department ON displays(department);
CREATE TABLE IF NOT EXISTS users (
  --make email primary key
  email TEXT PRIMARY KEY,
  screen_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  department INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  permissions TEXT NOT NULL CHECK (
    permissions IN (
      'superuser',
      'edituser',
      'postinguser'
    )
  )
);
CREATE TABLE IF NOT EXISTS loadshedding_schedules (
  id INTEGER PRIMARY KEY,
  schedule_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS files (
  department_id INTEGER NOT NULL REFERENCES departments(id),
  filename TEXT NOT NULL,
  file_content BLOB NOT NULL,
  mime_type TEXT NOT NULL,
  PRIMARY KEY (department_id, filename)
);
CREATE TABLE IF NOT EXISTS templates (id TEXT PRIMARY KEY, xml TEXT NOT NULL);
