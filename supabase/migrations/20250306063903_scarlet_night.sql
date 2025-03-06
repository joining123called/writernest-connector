/*
  # Storage Bucket and Policy Setup

  1. New Buckets
    - Creates 'avatars' bucket for user profile images
    - Creates 'assignment_files' bucket for assignment attachments
    
  2. Security
    - Enables RLS on storage.objects
    - Sets up policies for:
      - Public avatar access
      - Avatar uploads by users
      - Assignment file uploads by owners
      - Assignment file access by owners
      - Admin access to all files
*/

-- Create avatars bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('assignment_files', 'assignment_files', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can access their assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can access all files" ON storage.objects;

-- Create policy for public avatar access
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Create policy for avatar uploads
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for assignment file uploads
CREATE POLICY "Users can upload assignment files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignment_files'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM assignment_details
    WHERE assignment_details.id::text = (storage.foldername(name))[2]
    AND assignment_details.user_id = auth.uid()
  )
);

-- Create policy for assignment file access
CREATE POLICY "Users can access their assignment files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignment_files'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM assignment_details
    WHERE assignment_details.id::text = (storage.foldername(name))[2]
    AND assignment_details.user_id = auth.uid()
  )
);

-- Create policy for admins to access all files
CREATE POLICY "Admins can access all files"
ON storage.objects FOR ALL
USING (
  auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);