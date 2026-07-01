PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  category_id TEXT,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  seo_title TEXT,
  seo_description TEXT,
  reading_time INTEGER NOT NULL DEFAULT 1 CHECK (reading_time >= 1),
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  location TEXT,
  taken_at TEXT,
  camera TEXT,
  lens TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS photo_tags (
  photo_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (photo_id, tag_id),
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  video_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('YouTube', 'Bilibili', 'Vimeo', 'Local URL')),
  duration TEXT,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  value_type TEXT NOT NULL DEFAULT 'json' CHECK (value_type IN ('json', 'string', 'number', 'boolean')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(pinned);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(featured);
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_updated_at ON photos(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_tags_tag_id ON photo_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);
CREATE INDEX IF NOT EXISTS idx_videos_updated_at ON videos(updated_at DESC);
