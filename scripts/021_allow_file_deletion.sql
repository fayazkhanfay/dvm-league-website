-- 021_allow_file_deletion.sql

-- Enable users to delete their own files (Required for Draft Management)
CREATE POLICY "Users can delete their own files"
ON public.case_files
FOR DELETE
TO authenticated
USING (
  -- A user can only delete a file if they are the original uploader
  uploader_id = auth.uid()
);