CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY,
  posted INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (
    content_type IN ('text', 'image', 'video', 'link')
  ),
  content_json TEXT NOT NULL
);
