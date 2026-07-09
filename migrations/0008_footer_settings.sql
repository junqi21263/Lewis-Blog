INSERT OR IGNORE INTO site_settings (key, value, value_type, created_at, updated_at)
VALUES (
  'footer_json',
  '{"zh-CN":{"brand":"Lewis.","description":"关于旅行、摄影、影像与安静写作的个人归档。","copyright":"© 2026 Lewis Lee.","location":"Guangzhou · China"},"zh-TW":{"brand":"Lewis.","description":"關於旅行、攝影、影像與安靜寫作的個人歸檔。","copyright":"© 2026 Lewis Lee.","location":"Guangzhou · China"},"en-US":{"brand":"Lewis.","description":"A personal archive for travel, photography, moving images, and quiet writing.","copyright":"© 2026 Lewis Lee.","location":"Guangzhou · China"}}',
  'json',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);
