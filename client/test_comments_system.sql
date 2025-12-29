-- =============================================
-- TESTING QUERIES FOR COMMENTS SYSTEM
-- =============================================
-- Use these queries to test and verify your comments system

-- 1. CHECK IF COMMENTS TABLE EXISTS
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- 2. CHECK RLS POLICIES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'comments';

-- 3. CHECK TRIGGERS
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'comments';

-- 4. VIEW ALL COMMENTS WITH AUTHOR INFO
SELECT 
  c.id,
  c.content,
  c.created_at,
  p.full_name as author_name,
  p.username as author_username,
  t.title as thread_title
FROM comments c
LEFT JOIN profiles p ON c.created_by = p.id
LEFT JOIN threads t ON c.thread_id = t.id
ORDER BY c.created_at DESC
LIMIT 20;

-- 5. CHECK COMMENT COUNTS ARE ACCURATE
SELECT 
  t.id,
  t.title,
  t.comment_count as stored_count,
  COUNT(c.id) as actual_count,
  CASE 
    WHEN t.comment_count = COUNT(c.id) THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM threads t
LEFT JOIN comments c ON c.thread_id = t.id
GROUP BY t.id, t.title, t.comment_count
HAVING t.comment_count > 0 OR COUNT(c.id) > 0
ORDER BY t.comment_count DESC;

-- 6. FIX MISMATCHED COMMENT COUNTS (if needed)
-- Run this if you see mismatches in query #5
UPDATE threads t
SET comment_count = (
  SELECT COUNT(*)
  FROM comments c
  WHERE c.thread_id = t.id
);

-- 7. GET MOST ACTIVE THREADS
SELECT 
  t.title,
  t.comment_count,
  t.created_at,
  p.full_name as author
FROM threads t
LEFT JOIN profiles p ON t.created_by = p.id
ORDER BY t.comment_count DESC
LIMIT 10;

-- 8. GET MOST ACTIVE COMMENTERS
SELECT 
  p.full_name,
  p.username,
  COUNT(c.id) as total_comments
FROM comments c
JOIN profiles p ON c.created_by = p.id
GROUP BY p.id, p.full_name, p.username
ORDER BY total_comments DESC
LIMIT 10;

-- 9. GET RECENT ACTIVITY
SELECT 
  'comment' as activity_type,
  c.created_at,
  p.full_name as user_name,
  t.title as thread_title,
  LEFT(c.content, 50) || '...' as preview
FROM comments c
JOIN profiles p ON c.created_by = p.id
JOIN threads t ON c.thread_id = t.id
ORDER BY c.created_at DESC
LIMIT 20;

-- 10. TEST INSERTING A COMMENT (replace UUIDs with real values)
-- First, get a thread_id and user_id:
SELECT id, title FROM threads LIMIT 1;
SELECT id, email FROM auth.users LIMIT 1;

-- Then insert (replace the UUIDs):
-- INSERT INTO comments (thread_id, content, created_by)
-- VALUES (
--   'YOUR_THREAD_ID_HERE',
--   'This is a test comment!',
--   'YOUR_USER_ID_HERE'
-- );

-- 11. VERIFY TRIGGER WORKED (check if comment_count increased)
SELECT id, title, comment_count 
FROM threads 
WHERE id = 'YOUR_THREAD_ID_HERE';

-- 12. DELETE TEST COMMENT (if you created one)
-- DELETE FROM comments 
-- WHERE content = 'This is a test comment!';

-- 13. CHECK FOR ORPHANED COMMENTS (comments without valid threads)
SELECT c.id, c.content, c.thread_id
FROM comments c
LEFT JOIN threads t ON c.thread_id = t.id
WHERE t.id IS NULL;

-- 14. CHECK FOR COMMENTS WITHOUT VALID AUTHORS
SELECT c.id, c.content, c.created_by
FROM comments c
LEFT JOIN profiles p ON c.created_by = p.id
WHERE p.id IS NULL;

-- 15. GET COMMENT STATISTICS
SELECT 
  COUNT(*) as total_comments,
  COUNT(DISTINCT thread_id) as threads_with_comments,
  COUNT(DISTINCT created_by) as unique_commenters,
  MIN(created_at) as first_comment,
  MAX(created_at) as latest_comment
FROM comments;

-- =============================================
-- CLEANUP QUERIES (USE WITH CAUTION!)
-- =============================================

-- Delete all comments (CAREFUL!)
-- DELETE FROM comments;

-- Reset all comment counts to 0
-- UPDATE threads SET comment_count = 0;

-- Recalculate all comment counts
-- UPDATE threads t
-- SET comment_count = (
--   SELECT COUNT(*) FROM comments c WHERE c.thread_id = t.id
-- );

-- =============================================
-- SUCCESS INDICATORS
-- =============================================
-- ✅ Table exists with correct columns
-- ✅ RLS policies are active (4 policies)
-- ✅ Triggers are created (3 triggers)
-- ✅ Comment counts match actual counts
-- ✅ No orphaned comments
-- ✅ Comments display in UI
-- =============================================
