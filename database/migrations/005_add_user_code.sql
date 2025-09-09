-- Migration 005: Add user_code column to users table
-- Description: Add unique 8-character alphanumeric code for user identification

-- Add user_code column (nullable initially for existing users)
ALTER TABLE users ADD COLUMN user_code VARCHAR(8);

-- Add unique constraint on user_code
ALTER TABLE users ADD CONSTRAINT users_user_code_unique UNIQUE (user_code);

-- Create index for faster lookups
CREATE INDEX idx_users_user_code ON users (user_code);

-- Note: Backfill script will be run separately to generate codes for existing users
-- After backfill, we'll make the column non-nullable in a follow-up migration
