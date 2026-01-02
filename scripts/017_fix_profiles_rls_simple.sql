-- Rollback and simplify profiles RLS to fix login issues
-- The previous policy was too complex and broke authentication

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view profiles of case participants" ON public.profiles;

-- Restore the simple policy for viewing your own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Add a separate, simpler policy for viewing other users in cases
CREATE POLICY "Users can view case participant profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Allow viewing profiles of anyone who has uploaded files to cases you can access
    id IN (
      SELECT DISTINCT case_files.uploader_id
      FROM public.case_files
      JOIN public.cases ON cases.id = case_files.case_id
      WHERE (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
    )
  );
