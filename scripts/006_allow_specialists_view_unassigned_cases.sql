-- Migration: Allow specialists to view unassigned cases
-- Purpose: Enable specialists to see available cases in the "Available Cases" tab
-- that are pending assignment (status = 'pending_assignment' and specialist_id IS NULL)

-- Add policy for specialists to view unassigned cases
CREATE POLICY "Specialists can view unassigned cases"
ON cases
FOR SELECT
TO authenticated
USING (
  -- Check if user is a specialist
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.role = 'specialist'
  )
  -- AND the case is unassigned
  AND specialist_id IS NULL
  AND status = 'pending_assignment'
);

-- Note: This policy works alongside "Specialists can view their assigned cases"
-- Specialists can now see:
-- 1. Cases assigned to them (existing policy)
-- 2. Unassigned cases available to accept (this new policy)
