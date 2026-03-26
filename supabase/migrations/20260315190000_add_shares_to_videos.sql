-- Add shares column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;
