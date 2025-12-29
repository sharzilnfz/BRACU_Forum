-- from Supabase
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id),
  CONSTRAINT comments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  username text NOT NULL UNIQUE,
  bio text,
  created_at timestamp with time zone,
  avatar_url text,
  location text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.roles (
  role_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  CONSTRAINT roles_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.thread_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  user_id uuid NOT NULL,
  vote_type character varying NOT NULL CHECK (vote_type::text = ANY (ARRAY['upvote'::character varying, 'downvote'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT thread_votes_pkey PRIMARY KEY (id),
  CONSTRAINT thread_votes_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id),
  CONSTRAINT thread_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category character varying NOT NULL,
  tags ARRAY,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_poll boolean DEFAULT false,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  poll_options ARRAY,
  upvote_count integer DEFAULT 0,
  downvote_count integer DEFAULT 0,
  CONSTRAINT threads_pkey PRIMARY KEY (id),
  CONSTRAINT threads_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id bigint NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id)
);


-- =============================================
-- BRACU Forum - Complete Database Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- This script sets up: Comments System + Voting System

-- =============================================
-- PART 1: COMMENTS SYSTEM
-- =============================================

-- 1. Create the comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_thread_id ON comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_by ON comments(created_by);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 3. Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE USING (auth.uid() = created_by);

-- 5. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for comments updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Create trigger to auto-increment comment count
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

-- 8. Create trigger to auto-decrement comment count
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

-- 9. Ensure threads table has comment_count column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE threads ADD COLUMN comment_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- =============================================
-- PART 2: VOTING SYSTEM
-- =============================================

-- 1. Create the thread_votes table
CREATE TABLE IF NOT EXISTS thread_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- 2. Create indexes for thread_votes
CREATE INDEX IF NOT EXISTS idx_thread_votes_thread_id ON thread_votes(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_votes_user_id ON thread_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_votes_vote_type ON thread_votes(vote_type);

-- 3. Add vote count columns to threads table
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

-- 4. Enable RLS on thread_votes
ALTER TABLE thread_votes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for thread_votes
CREATE POLICY "Thread votes are viewable by everyone"
  ON thread_votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON thread_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON thread_votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON thread_votes FOR DELETE USING (auth.uid() = user_id);

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

-- 7. Create triggers for vote count updates
CREATE OR REPLACE FUNCTION auto_update_vote_counts_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_thread_vote_counts(NEW.thread_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts_on_insert
  AFTER INSERT ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_vote_counts_on_insert();

CREATE OR REPLACE FUNCTION auto_update_vote_counts_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.vote_type != NEW.vote_type THEN
    PERFORM update_thread_vote_counts(NEW.thread_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts_on_update
  AFTER UPDATE ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_vote_counts_on_update();

CREATE OR REPLACE FUNCTION auto_update_vote_counts_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_thread_vote_counts(OLD.thread_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts_on_delete
  AFTER DELETE ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_vote_counts_on_delete();

-- 8. Create trigger for thread_votes updated_at
CREATE TRIGGER update_thread_votes_updated_at
  BEFORE UPDATE ON thread_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Create toggle vote function
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
  SELECT vote_type INTO v_existing_vote
  FROM thread_votes
  WHERE thread_id = p_thread_id AND user_id = p_user_id;
  
  IF v_existing_vote IS NULL THEN
    INSERT INTO thread_votes (thread_id, user_id, vote_type)
    VALUES (p_thread_id, p_user_id, p_vote_type);
    v_result := json_build_object('action', 'inserted', 'vote_type', p_vote_type);
  ELSIF v_existing_vote = p_vote_type THEN
    DELETE FROM thread_votes
    WHERE thread_id = p_thread_id AND user_id = p_user_id;
    v_result := json_build_object('action', 'deleted', 'vote_type', NULL);
  ELSE
    UPDATE thread_votes
    SET vote_type = p_vote_type, updated_at = NOW()
    WHERE thread_id = p_thread_id AND user_id = p_user_id;
    v_result := json_build_object('action', 'updated', 'vote_type', p_vote_type);
  END IF;
  
  RETURN v_result;
END;
$$;

-- 10. Initialize counts for existing threads
UPDATE threads t
SET 
  comment_count = (SELECT COUNT(*) FROM comments c WHERE c.thread_id = t.id),
  upvote_count = (SELECT COUNT(*) FROM thread_votes WHERE thread_id = t.id AND vote_type = 'upvote'),
  downvote_count = (SELECT COUNT(*) FROM thread_votes WHERE thread_id = t.id AND vote_type = 'downvote');

-- =============================================
-- VERIFICATION
-- =============================================
-- Run these to verify setup:
-- SELECT * FROM comments LIMIT 1;
-- SELECT * FROM thread_votes LIMIT 1;
-- SELECT * FROM pg_policies WHERE tablename IN ('comments', 'thread_votes');

-- =============================================
-- SUCCESS! Setup complete.
-- =============================================
