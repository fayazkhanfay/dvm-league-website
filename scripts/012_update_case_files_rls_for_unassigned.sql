-- Update the case_files table RLS to allow specialists to view files for unassigned cases

-- 1. Drop the old policies
DROP POLICY IF EXISTS "Users can view files for their accessible cases" ON public.case_files;
DROP POLICY IF EXISTS "Users can insert files for their accessible cases" ON public.case_files;

-- 2. Create new SELECT policy that allows viewing files for assigned OR unassigned cases
CREATE POLICY "Users can view files for their accessible cases"
  ON public.case_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_files.case_id
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
  );

-- 3. Create new INSERT policy (only for assigned participants)
CREATE POLICY "Users can insert files for their accessible cases"
  ON public.case_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_files.case_id
      AND (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
    )
    AND uploader_id = auth.uid()
  );
