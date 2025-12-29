-- =============================================
-- BRACU Forum - Comments System Database Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Create the comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_thread_id ON comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_by ON comments(created_by);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Policy: Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert comments
CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (auth.uid() = created_by);

-- 5. Create function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count(thread_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE threads
  SET comment_count = COALESCE(comment_count, 0) + 1
  WHERE id = thread_id;
END;
$$;

-- 6. Create function to decrement comment count (for deletions)
CREATE OR REPLACE FUNCTION decrement_comment_count(thread_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE threads
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
  WHERE id = thread_id;
END;
$$;

-- 7. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Create trigger to auto-increment comment count on insert
CREATE OR REPLACE FUNCTION auto_increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET comment_count = COALESCE(comment_count, 0) + 1
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_comment_count
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_comment_count();

-- 9. Create trigger to auto-decrement comment count on delete
CREATE OR REPLACE FUNCTION auto_decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
  WHERE id = OLD.thread_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_comment_count
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_comment_count();

-- 10. Ensure threads table has comment_count column
-- (Run this only if the column doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE threads ADD COLUMN comment_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 11. Update existing threads to have correct comment counts
UPDATE threads t
SET comment_count = (
  SELECT COUNT(*)
  FROM comments c
  WHERE c.thread_id = t.id
);

-- =============================================
-- Verification Queries (Optional - for testing)
-- =============================================

-- Check if table was created
SELECT * FROM comments LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'comments';

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'comments';

-- =============================================
-- Success! Your comments system is now set up.
-- =============================================
