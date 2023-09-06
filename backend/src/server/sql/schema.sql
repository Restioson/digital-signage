PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS lecturers (
  id INTEGER PRIMARY KEY,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  office_hours TEXT NOT NULL,
  office_location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS department (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT
);
CREATE TABLE IF NOT EXISTS display_groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department INTEGER NOT NULL REFERENCES department(id) ON DELETE CASCADE,
  layout_json TEXT NOT NULL
);
