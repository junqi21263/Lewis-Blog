ALTER TABLE posts ADD COLUMN translation_locks_json TEXT NOT NULL DEFAULT '{}';

UPDATE posts
SET translation_locks_json = '{}'
WHERE translation_locks_json IS NULL OR translation_locks_json = '';
