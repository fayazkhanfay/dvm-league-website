-- Update the cases table RLS to allow specialists to view unassigned cases

-- 1. Drop the old specialist policy
DROP POLICY IF EXISTS "Specialists can view their assigned cases" ON public.cases;

-- 2. Create new policy that allows specialists to view assigned OR unassigned cases
CREATE POLICY "Specialists can view assigned or unassigned cases"
  ON public.cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'specialist'
      AND (
        -- Assigned to me
        cases.specialist_id = auth.uid()
        -- OR unassigned (shopping for cases)
        OR cases.specialist_id IS NULL
      )
    )
  );
