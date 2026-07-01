ALTER TABLE photos ADD COLUMN country TEXT;
ALTER TABLE photos ADD COLUMN city TEXT;
ALTER TABLE photos ADD COLUMN latitude REAL;
ALTER TABLE photos ADD COLUMN longitude REAL;
ALTER TABLE photos ADD COLUMN iso TEXT;
ALTER TABLE photos ADD COLUMN aperture TEXT;
ALTER TABLE photos ADD COLUMN shutter_speed TEXT;
ALTER TABLE photos ADD COLUMN focal_length TEXT;
ALTER TABLE photos ADD COLUMN alt_text TEXT;

CREATE INDEX IF NOT EXISTS idx_photos_country ON photos(country);
CREATE INDEX IF NOT EXISTS idx_photos_city ON photos(city);
CREATE INDEX IF NOT EXISTS idx_photos_camera ON photos(camera);
CREATE INDEX IF NOT EXISTS idx_photos_lens ON photos(lens);
