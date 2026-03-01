-- Supabase Migration: Create watch_progress table for iTube Video Player
-- This table stores user watch progress for resume functionality

CREATE TABLE watch_progress (
  id BIGSERIAL PRIMARY KEY,
  video_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  watched_time FLOAT NOT NULL DEFAULT 0,
  total_duration FLOAT NOT NULL DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one record per user per video
  UNIQUE(video_id, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_watch_progress_video_user 
ON watch_progress(video_id, user_id);

CREATE INDEX idx_watch_progress_user 
ON watch_progress(user_id);

CREATE INDEX idx_watch_progress_updated 
ON watch_progress(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own watch progress
CREATE POLICY "Users can read their own watch progress"
  ON watch_progress FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can create/update their own watch progress
CREATE POLICY "Users can create/update their own watch progress"
  ON watch_progress FOR INSERT, UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can delete their own watch progress
CREATE POLICY "Users can delete their own watch progress"
  ON watch_progress FOR DELETE
  USING (auth.uid()::text = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_watch_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watch_progress_timestamp
BEFORE UPDATE ON watch_progress
FOR EACH ROW
EXECUTE FUNCTION update_watch_progress_timestamp();
