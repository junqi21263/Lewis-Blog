CREATE TABLE IF NOT EXISTS site_pages (
  id TEXT PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  content_json TEXT NOT NULL,
  seo_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS gear_items (
  id TEXT PRIMARY KEY,
  name_json TEXT NOT NULL,
  description_json TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Camera', 'Lens', 'Phone', 'Drone', 'Audio', 'Accessories')),
  maker TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'archived')),
  archive_uses INTEGER NOT NULL DEFAULT 0 CHECK (archive_uses >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  image_alt_json TEXT NOT NULL DEFAULT '{}',
  tags_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_site_pages_page_key ON site_pages(page_key);
CREATE INDEX IF NOT EXISTS idx_gear_items_category ON gear_items(category);
CREATE INDEX IF NOT EXISTS idx_gear_items_status ON gear_items(status);
CREATE INDEX IF NOT EXISTS idx_gear_items_sort_order ON gear_items(sort_order ASC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_gear_items_featured ON gear_items(is_featured);

INSERT OR IGNORE INTO site_pages (id, page_key, content_json, seo_json, created_at, updated_at)
VALUES (
  'about',
  'about',
  '{
    "zh-CN": {
      "eyebrow": "About - Lewis Photograph Blog",
      "headline": "一个关于克制影像与缓慢写作的个人归档。",
      "description": "Lewis Photograph Blog 是一个关于旅行、摄影、建筑与影像的私人编辑档案，气质安静、克制，并为后续真实写作预留空间。",
      "body": "网站围绕可持续的编辑原语组织：文章、影像与影片。文本目前刻意保持简洁，便于后续替换而不破坏界面结构。\\n\\n视觉系统偏好高对比、大留白、serif 标题、mono 标签，以及以图像为中心的叙事方式。它的目标是承载个人作品，而不是制造装饰感。",
      "heroImage": "/images/northern-light.jpg",
      "imageAlt": "A quiet Nordic shoreline used as an about page editorial image.",
      "imageFit": "cover",
      "imagePositionX": "center",
      "imagePositionY": "center",
      "imageAspectRatio": "cinema"
    },
    "zh-TW": {
      "eyebrow": "About - Lewis Photograph Blog",
      "headline": "一個關於克制影像與緩慢寫作的個人歸檔。",
      "description": "Lewis Photograph Blog 是一個關於旅行、攝影、建築與影像的私人編輯檔案，氣質安靜、克制，並為後續真實寫作保留空間。",
      "body": "網站圍繞可持續的編輯原語組織：文章、影像與影片。文本目前刻意保持簡潔，便於之後替換而不破壞介面結構。\\n\\n視覺系統偏好高對比、大留白、serif 標題、mono 標籤，以及以圖像為中心的敘事方式。它的目標是承載個人作品，而非製造裝飾感。",
      "heroImage": "/images/northern-light.jpg",
      "imageAlt": "A quiet Nordic shoreline used as an about page editorial image.",
      "imageFit": "cover",
      "imagePositionX": "center",
      "imagePositionY": "center",
      "imageAspectRatio": "cinema"
    },
    "en-US": {
      "eyebrow": "About - Lewis Photograph Blog",
      "headline": "A personal journal for restrained images and deliberate writing.",
      "description": "Lewis Photograph Blog is a small editorial archive for travel, photography, architecture, and films. The tone is quiet, tactile, and built for slow replacement with personal writing.",
      "body": "The site is organized around durable editorial primitives: entries, images, and films. Text stays intentionally simple for now so it can be replaced later without reshaping the interface.\\n\\nThe visual system favors high contrast, generous whitespace, serif headlines, mono labels, and image-led storytelling. It is designed to hold personal work without becoming decorative.",
      "heroImage": "/images/northern-light.jpg",
      "imageAlt": "A quiet Nordic shoreline used as an about page editorial image.",
      "imageFit": "cover",
      "imagePositionX": "center",
      "imagePositionY": "center",
      "imageAspectRatio": "cinema"
    }
  }',
  '{
    "zh-CN": {
      "title": "About",
      "description": "关于 Lewis Photograph Blog 的创作方法、视觉系统与归档理念。"
    },
    "zh-TW": {
      "title": "About",
      "description": "關於 Lewis Photograph Blog 的創作方法、視覺系統與歸檔理念。"
    },
    "en-US": {
      "title": "About",
      "description": "About Lewis Photograph Blog, a personal journal for restrained images and deliberate writing."
    }
  }',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);
