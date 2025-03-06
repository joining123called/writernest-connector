/*
  # Add Avatar URL and Storage Configuration
  
  1. Changes
    - Add avatar_url column to profiles table
    - Create avatars storage bucket
    - Set up storage policies for avatar uploads
  
  2. Security
    - Enable RLS for storage objects
    - Add policies for upload and view permissions
*/

-- Add avatar_url column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar view policy" ON storage.objects;

-- Create policy to allow authenticated users to upload their own avatar
CREATE POLICY "Avatar upload policy" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow anyone to view avatars
CREATE POLICY "Avatar view policy" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

-- Record migration in _migrations table
INSERT INTO public._migrations (name) 
VALUES ('20250306044418_broken_lake')
ON CONFLICT (name) DO NOTHING;