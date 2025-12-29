-- =============================================
-- BRACU Forum - Thread Voting System Database Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Create the thread_votes table
CREATE TABLE IF NOT EXISTS thread_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per user per thread
  UNIQUE(thread_id, user_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thread_votes_thread_id ON thread_votes(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_votes_user_id ON thread_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_votes_vote_type ON thread_votes(vote_type);

-- 3. Add vote count columns to threads table (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'upvote_count'
  ) THEN
    ALTER TABLE threads ADD COLUMN upvote_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'downvote_count'
  ) THEN
    ALTER TABLE threads ADD COLUMN downvote_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE thread_votes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Policy: Anyone can read votes
CREATE POLICY "Thread votes are viewable by everyone"
  ON thread_votes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert votes
CREATE POLICY "Authenticated users can vote"
  ON thread_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own votes
CREATE POLICY "Users can update their own votes"
  ON thread_votes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON thread_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create function to update vote counts
CREATE OR REPLACE FUNCTION update_thread_vote_counts(p_thread_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE threads
  SET 
    upvote_count = (
      SELECT COUNT(*) FROM thread_votes 
      WHERE thread_id = p_thread_id AND vote_type = 'upvote'
    ),
    downvote_count = (
      SELECT COUNT(*) FROM thread_votes 
      WHERE thread_id = p_thread_id AND vote_type = 'downvote'
    )
  WHERE id = p_thread_id;
END;
$$;

-- 7. Create trigger function to update counts on insert
CREATE OR REPLACE FUNCTION auto_update_vote_counts_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_thread_vote_counts(NEW.thread_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger function to update counts on update
CREATE OR REPLACE FUNCTION auto_update_vote_counts_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If vote type changed, update counts
  IF OLD.vote_type != NEW.vote_type THEN
    PERFORM update_thread_vote_counts(NEW.thread_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger function to update counts on delete
CREATE OR REPLACE FUNCTION auto_update_vote_counts_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_thread_vote_counts(OLD.thread_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers
CREATE TRIGGER trigger_update_vote_counts_on_insert
  AFTER INSERT ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_vote_counts_on_insert();

CREATE TRIGGER trigger_update_vote_counts_on_update
  AFTER UPDATE ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_vote_counts_on_update();

CREATE TRIGGER trigger_update_vote_counts_on_delete
  AFTER DELETE ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_vote_counts_on_delete();

-- 11. Create trigger to update updated_at timestamp
CREATE TRIGGER update_thread_votes_updated_at
  BEFORE UPDATE ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Initialize vote counts for existing threads
UPDATE threads t
SET 
  upvote_count = (
    SELECT COUNT(*) FROM thread_votes 
    WHERE thread_id = t.id AND vote_type = 'upvote'
  ),
  downvote_count = (
    SELECT COUNT(*) FROM thread_votes 
    WHERE thread_id = t.id AND vote_type = 'downvote'
  );

-- 13. Create helper function to get user's vote on a thread
CREATE OR REPLACE FUNCTION get_user_vote(p_thread_id UUID, p_user_id UUID)
RETURNS VARCHAR(10)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vote_type VARCHAR(10);
BEGIN
  SELECT vote_type INTO v_vote_type
  FROM thread_votes
  WHERE thread_id = p_thread_id AND user_id = p_user_id;
  
  RETURN v_vote_type;
END;
$$;

-- 14. Create function to toggle vote (upsert)
CREATE OR REPLACE FUNCTION toggle_thread_vote(
  p_thread_id UUID,
  p_user_id UUID,
  p_vote_type VARCHAR(10)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_vote VARCHAR(10);
  v_result JSON;
BEGIN
  -- Get existing vote
  SELECT vote_type INTO v_existing_vote
  FROM thread_votes
  WHERE thread_id = p_thread_id AND user_id = p_user_id;
  
  IF v_existing_vote IS NULL THEN
    -- No existing vote, insert new one
    INSERT INTO thread_votes (thread_id, user_id, vote_type)
    VALUES (p_thread_id, p_user_id, p_vote_type);
    
    v_result := json_build_object(
      'action', 'inserted',
      'vote_type', p_vote_type
    );
  ELSIF v_existing_vote = p_vote_type THEN
    -- Same vote, remove it (toggle off)
    DELETE FROM thread_votes
    WHERE thread_id = p_thread_id AND user_id = p_user_id;
    
    v_result := json_build_object(
      'action', 'deleted',
      'vote_type', NULL
    );
  ELSE
    -- Different vote, update it
    UPDATE thread_votes
    SET vote_type = p_vote_type, updated_at = NOW()
    WHERE thread_id = p_thread_id AND user_id = p_user_id;
    
    v_result := json_build_object(
      'action', 'updated',
      'vote_type', p_vote_type
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- =============================================
-- Verification Queries (Optional - for testing)
-- =============================================

-- Check if table was created
SELECT * FROM thread_votes LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'thread_votes';

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'thread_votes';

-- Check vote counts columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'threads' 
AND column_name IN ('upvote_count', 'downvote_count');

-- =============================================
-- Success! Your voting system is now set up.
-- =============================================
