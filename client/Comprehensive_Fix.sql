-- COMPREHENSIVE FIX for Profile & Storage Issues
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Ensure Columns Exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text;

-- 2. Reset Profile RLS Policies (Fixes "Permission Denied" on updates)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING ( auth.uid() = id );

-- 3. Storage Setup (Fixes "Image Upload" issues)
-- Create bucket if missing
INSERT INTO storage.buckets (id, name, public)
VALUES ('bracuForum_profile', 'bracuForum_profile', true)
ON CONFLICT (id) DO NOTHING;

-- Reset Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;

-- Allow Public Read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'bracuForum_profile' );

-- Allow Authenticated Uploads
CREATE POLICY "Authenticated users can upload profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bracuForum_profile'
  AND auth.role() = 'authenticated'
);

-- Allow Users to Update their own uploaded files
CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bracuForum_profile' 
  AND auth.uid() = owner
);

-- Allow Users to Delete their own uploaded files (optional but good)
CREATE POLICY "Users can delete own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bracuForum_profile' 
  AND auth.uid() = owner
);
