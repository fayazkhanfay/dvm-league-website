-- 022_allow_storage_deletion.sql

-- Allow users to delete their own objects from the case-bucket
-- "owner" is a hidden column in storage.objects automatically set to auth.uid() on client-side uploads

CREATE POLICY "Users can delete their own storage objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'case-bucket' 
  AND owner = auth.uid()
);