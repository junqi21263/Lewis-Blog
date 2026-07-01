ALTER TABLE posts ADD COLUMN title_json TEXT;
ALTER TABLE posts ADD COLUMN excerpt_json TEXT;
ALTER TABLE posts ADD COLUMN content_json TEXT;
ALTER TABLE posts ADD COLUMN seo_title_json TEXT;
ALTER TABLE posts ADD COLUMN seo_description_json TEXT;

UPDATE posts
SET
  title_json = COALESCE(title_json, json_object('zh-CN', COALESCE(title, ''))),
  excerpt_json = COALESCE(excerpt_json, json_object('zh-CN', COALESCE(excerpt, ''))),
  content_json = COALESCE(content_json, json_object('zh-CN', COALESCE(content, ''))),
  seo_title_json = COALESCE(seo_title_json, json_object('zh-CN', COALESCE(seo_title, COALESCE(title, '')))),
  seo_description_json = COALESCE(seo_description_json, json_object('zh-CN', COALESCE(seo_description, COALESCE(excerpt, ''))))
WHERE
  title_json IS NULL
  OR excerpt_json IS NULL
  OR content_json IS NULL
  OR seo_title_json IS NULL
  OR seo_description_json IS NULL;
