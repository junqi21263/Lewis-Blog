CREATE TABLE IF NOT EXISTS fragments (
  id TEXT PRIMARY KEY,
  content_json TEXT NOT NULL DEFAULT '{}',
  location_json TEXT NOT NULL DEFAULT '{}',
  images_json TEXT NOT NULL DEFAULT '[]',
  camera TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  is_public INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1)),
  translation_locks_json TEXT NOT NULL DEFAULT '{}',
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_fragments_status_public ON fragments(status, is_public);
CREATE INDEX IF NOT EXISTS idx_fragments_published ON fragments(published_at DESC, created_at DESC);
