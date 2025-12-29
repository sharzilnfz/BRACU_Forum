-- Run this in your Supabase Dashboard -> SQL Editor

-- Add new columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text;

-- Add a storage bucket for profile pictures if it doesn't exist
-- Note: Creating buckets via SQL is one way, but traditionally done via Dashboard or API.
-- This SQL attempts to insert into storage.buckets if checking first.
INSERT INTO storage.buckets (id, name, public)
VALUES ('bracuForum_profile', 'bracuForum_profile', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to profile pictures
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'bracuForum_profile' );

-- Policy to allow authenticated users to upload profile pictures
CREATE POLICY "Authenticated users can upload profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bracuForum_profile'
  AND auth.role() = 'authenticated'
);

-- Policy to allow users to update their own profile pictures
CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bracuForum_profile' 
  AND auth.uid() = owner
);
