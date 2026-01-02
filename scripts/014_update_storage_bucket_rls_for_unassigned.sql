-- Update storage bucket RLS to allow specialists to download files from unassigned cases

-- 1. Drop old storage policies
DROP POLICY IF EXISTS "Users can view files for their accessible cases" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files for their accessible cases" ON storage.objects;

-- 2. Create new SELECT policy for viewing/downloading files
CREATE POLICY "Users can view files for their accessible cases"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-bucket'
    AND (
      EXISTS (
        SELECT 1 
        FROM public.case_files
        JOIN public.cases ON cases.id = case_files.case_id
        WHERE case_files.file_path = storage.objects.name
        AND (
          -- I am the GP owner
          cases.gp_id = auth.uid()
          -- OR I am the assigned specialist
          OR cases.specialist_id = auth.uid()
          -- OR it's unassigned and I'm a specialist (shopping for cases)
          OR (cases.specialist_id IS NULL AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'specialist'
          ))
        )
      )
    )
  );

-- 3. Create new INSERT policy for uploading files (only assigned participants)
CREATE POLICY "Users can upload files for their accessible cases"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-bucket'
    AND (
      EXISTS (
        SELECT 1 
        FROM public.case_files
        JOIN public.cases ON cases.id = case_files.case_id
        WHERE case_files.file_path = storage.objects.name
        AND (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
      )
    )
  );
