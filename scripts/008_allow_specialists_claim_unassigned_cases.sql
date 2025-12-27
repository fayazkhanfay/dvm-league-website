-- Allow specialists to claim (UPDATE) unassigned cases
-- This enables the "Accept & Claim This Case" functionality

-- Drop the policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Specialists can claim unassigned cases" ON cases;

-- Create the policy to allow specialists to update unassigned cases
CREATE POLICY "Specialists can claim unassigned cases"
ON cases
FOR UPDATE
TO authenticated
USING (
  -- Can only update if case is currently unassigned
  specialist_id IS NULL 
  AND status = 'pending_assignment'
  -- And the user is a specialist
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'specialist'
  )
)
WITH CHECK (
  -- After update, specialist_id must be set to the current user
  specialist_id = auth.uid()
  -- And status must be updated from pending_assignment
  AND status != 'pending_assignment'
);
