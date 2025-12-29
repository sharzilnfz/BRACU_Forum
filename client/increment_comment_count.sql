-- SQL function to increment comment count
-- Run this in your Supabase SQL Editor

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
