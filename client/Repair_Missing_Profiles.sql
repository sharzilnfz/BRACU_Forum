-- RUN THIS IN SUPABASE SQL EDITOR
-- This will fix the "BRACU Student" issue by creating profile rows for users that don't have them.

-- 1. Backfill missing profiles from Auth Metadata (excluding updated_at which doesn't exist)
INSERT INTO public.profiles (id, full_name, username)
SELECT 
    id, 
    -- Try to get name from metadata, fallback to email prefix or 'Student'
    COALESCE(raw_user_meta_data->>'full_name', 'Student'),
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Enable Realtime for threads (fixes auto-reload for other users)
-- This ensures the dashboard updates when someone else posts
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'threads'
  ) then
    alter publication supabase_realtime add table threads;
  end if;
end;
$$;
