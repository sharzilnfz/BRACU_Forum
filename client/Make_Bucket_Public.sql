-- Check if the bucket is marked as public
SELECT id, name, public FROM storage.buckets WHERE id = 'bracuForum_profile';

-- If public = false, run this to make it public:
UPDATE storage.buckets SET public = true WHERE id = 'bracuForum_profile';
