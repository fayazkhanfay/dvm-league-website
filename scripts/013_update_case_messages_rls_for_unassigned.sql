-- Update the case_messages table RLS to allow specialists to view messages for unassigned cases
-- (This matches what you already ran manually, but keeping it here for completeness)

-- 1. Drop the old policy
DROP POLICY IF EXISTS "Participants can view messages" ON public.case_messages;

-- 2. Create new policy that allows viewing messages for assigned OR unassigned cases
CREATE POLICY "Participants can view messages"
  ON public.case_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_messages.case_id
      AND (
        -- I am the GP owner
        c.gp_id = auth.uid() 
        -- OR I am the assigned specialist
        OR c.specialist_id = auth.uid() 
        -- OR it's unassigned and I'm a specialist (shopping for cases)
        OR (c.specialist_id IS NULL AND EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role = 'specialist'
        ))
      )
    )
  );

-- Note: The INSERT policy remains the same (only assigned participants can send messages)
