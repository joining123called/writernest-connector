
-- Create policy to allow authenticated users to upload to platform-assets bucket
CREATE POLICY "Allow authenticated users to upload platform assets" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'platform-assets');

-- Create policy to allow anyone to download from platform-assets bucket
CREATE POLICY "Allow public to download platform assets" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'platform-assets');
