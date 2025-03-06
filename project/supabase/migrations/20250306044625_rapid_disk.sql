/*
  # Platform Assets Storage Configuration
  
  1. Changes
    - Create platform-assets storage bucket
    - Configure public access settings
    - Set up storage policies for platform assets
  
  2. Security
    - Enable RLS for storage objects
    - Add policies for upload and download permissions
*/

-- Create platform-assets bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-assets', 'platform-assets', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload platform assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to download platform assets" ON storage.objects;

-- Create policy to allow authenticated users to upload platform assets
CREATE POLICY "Allow authenticated users to upload platform assets" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'platform-assets');

-- Create policy to allow public access to platform assets
CREATE POLICY "Allow public to download platform assets" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'platform-assets');

-- Record migration in _migrations table
INSERT INTO public._migrations (name) 
VALUES ('20250306044451_fierce_island')
ON CONFLICT (name) DO NOTHING;