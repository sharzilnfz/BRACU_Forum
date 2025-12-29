-- Run this to check your storage setup
-- Copy the results and share them

-- 1. Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'bracuForum_profile';

-- 2. Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Check uploaded files
SELECT * FROM storage.objects WHERE bucket_id = 'bracuForum_profile' ORDER BY created_at DESC LIMIT 10;
