-- Allow specialists to update cases assigned to them
-- This policy enables specialists to submit Phase 1 plans and Phase 2 reports

CREATE POLICY "Specialists can update their assigned cases"
ON cases
FOR UPDATE
TO authenticated
USING (
  specialist_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'specialist'
  )
)
WITH CHECK (
  specialist_id = auth.uid()
);
