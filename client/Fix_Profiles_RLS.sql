-- IMPORTANT: Run this in your Supabase Dashboard > SQL Editor
-- This fixes the issue where users see "BRACU Student" for other people's posts.

-- 1. Enable reading of profiles for everyone (so you can see who posted what)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING ( true );

-- 2. Ensure users can insert their own profile during signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- 3. Ensure users can update THEIR OWN profile only
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING ( auth.uid() = id );
