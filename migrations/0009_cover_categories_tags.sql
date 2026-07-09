ALTER TABLE posts ADD COLUMN cover_display_mode TEXT NOT NULL DEFAULT 'cover' CHECK (cover_display_mode IN ('cover', 'contain', 'original'));
ALTER TABLE posts ADD COLUMN cover_focal_x INTEGER NOT NULL DEFAULT 50 CHECK (cover_focal_x >= 0 AND cover_focal_x <= 100);
ALTER TABLE posts ADD COLUMN cover_focal_y INTEGER NOT NULL DEFAULT 50 CHECK (cover_focal_y >= 0 AND cover_focal_y <= 100);
ALTER TABLE posts ADD COLUMN cover_width INTEGER;
ALTER TABLE posts ADD COLUMN cover_height INTEGER;
ALTER TABLE posts ADD COLUMN cover_aspect_ratio REAL;

ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN color TEXT NOT NULL DEFAULT '';

INSERT OR IGNORE INTO categories (id, name, slug, description, sort_order, icon, color, created_at, updated_at)
VALUES
  ('journal', 'Journal', 'journal', 'Longform entries and editorial dispatches.', 10, 'FileText', '#f5f1e8', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('travel', 'Travel', 'travel', 'Places, routes, and slow movement.', 20, 'Map', '#d9e4dd', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('photography', 'Photography', 'photography', 'Image making, field notes, and visual essays.', 30, 'Camera', '#e6e1dc', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('street', 'Street', 'street', 'Street observations and city walks.', 40, 'Footprints', '#d8d8d8', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('film', 'Film', 'film', 'Moving image and film photography.', 60, 'Clapperboard', '#e3dfd4', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('gear', 'Gear', 'gear', 'Cameras, lenses, and working tools.', 70, 'Aperture', '#e5e5e5', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('notes', 'Notes', 'notes', 'Short notes and quiet observations.', 80, 'NotebookPen', '#ece7dd', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('life', 'Life', 'life', 'Personal fragments and everyday records.', 90, 'Circle', '#ddd8cf', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('projects', 'Projects', 'projects', 'Portfolio projects and ongoing series.', 100, 'Folder', '#e0ded8', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

INSERT OR IGNORE INTO tags (id, name, slug, created_at, updated_at)
VALUES
  ('japan', 'Japan', 'japan', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('tokyo', 'Tokyo', 'tokyo', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('leica', 'Leica', 'leica', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('kodak-gold', 'Kodak Gold', 'kodak-gold', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('black-and-white', 'Black and White', 'black-and-white', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('osaka', 'Osaka', 'osaka', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('night-walk', 'Night Walk', 'night-walk', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('film-scan', 'Film Scan', 'film-scan', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
