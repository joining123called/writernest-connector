
-- Add avatar_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Create policy to allow authenticated users to upload their own avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Avatar upload policy' AND bucket_id = 'avatars'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition, actions)
    VALUES (
      'Avatar upload policy',
      'avatars',
      'INSERT',
      'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1]',
      '{select, insert}'
    );
  END IF;
END
$$;

-- Create policy to allow anyone to view avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Avatar view policy' AND bucket_id = 'avatars'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition, actions)
    VALUES (
      'Avatar view policy',
      'avatars',
      'SELECT',
      'bucket_id = ''avatars''',
      '{select}'
    );
  END IF;
END
$$;
