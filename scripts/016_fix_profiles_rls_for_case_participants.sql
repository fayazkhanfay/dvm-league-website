-- Fix profiles RLS to allow viewing names of case participants
-- This enables the case_files -> profiles join to work for uploader names

-- Add a new policy to allow viewing profiles of users you share cases with
CREATE POLICY "Users can view profiles of case participants"
  ON public.profiles FOR SELECT
  USING (
    -- Allow viewing your own profile (keep existing behavior)
    auth.uid() = id
    OR
    -- Allow viewing profiles of people you share cases with
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE (
        -- Cases where I'm the GP and they're involved (specialist or uploader)
        (cases.gp_id = auth.uid() AND (cases.specialist_id = profiles.id OR cases.gp_id = profiles.id))
        OR
        -- Cases where I'm the specialist and they're involved (GP or other uploader)
        (cases.specialist_id = auth.uid() AND (cases.gp_id = profiles.id OR cases.specialist_id = profiles.id))
      )
    )
    OR
    -- Allow viewing profiles of people who uploaded files to cases I can access
    EXISTS (
      SELECT 1 FROM public.case_files
      JOIN public.cases ON cases.id = case_files.case_id
      WHERE case_files.uploader_id = profiles.id
      AND (cases.gp_id = auth.uid() OR cases.specialist_id = auth.uid())
    )
  );

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
