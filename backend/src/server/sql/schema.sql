CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY,
  posted INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (
    content_type IN ('text', 'local_image', 'video', 'link')
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
