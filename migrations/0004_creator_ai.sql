CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'site',
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_documents (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('post', 'photo', 'video')),
  source_id TEXT NOT NULL,
  slug TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tldr TEXT,
  key_takeaways TEXT NOT NULL DEFAULT '[]',
  reading_difficulty TEXT,
  suggested_tags TEXT NOT NULL DEFAULT '[]',
  embedding_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(source_type, source_id)
);

CREATE TABLE IF NOT EXISTS ai_image_metadata (
  photo_id TEXT PRIMARY KEY,
  alt_text TEXT,
  caption TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  seo_description TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_ai_documents_source ON ai_documents(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_ai_documents_slug ON ai_documents(slug);
