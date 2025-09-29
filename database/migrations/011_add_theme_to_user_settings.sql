-- Migration 011: Add theme column to user_settings table
-- Adds theme preference support to user settings

ALTER TABLE user_settings ADD COLUMN theme VARCHAR(20) DEFAULT 'default';

-- Create index for performance on theme lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_theme ON user_settings(theme);

-- Update existing records to have default theme
UPDATE user_settings SET theme = 'default' WHERE theme IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.theme IS 'User preferred color theme (default, red, rose, orange, green, blue, yellow, violet)';