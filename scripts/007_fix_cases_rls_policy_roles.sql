-- Fix RLS policies on cases table to use correct roles
-- Policies that check auth.uid() should ALWAYS use role 'authenticated', not 'public'

-- Drop and recreate GP policies with correct 'authenticated' role
DROP POLICY IF EXISTS "GPs can insert new cases" ON cases;
CREATE POLICY "GPs can insert new cases"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'gp'
    )
  );

DROP POLICY IF EXISTS "GPs can update their own cases" ON cases;
CREATE POLICY "GPs can update their own cases"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (
    gp_id = auth.uid()
    AND status IN ('draft', 'pending_payment')
  )
  WITH CHECK (
    gp_id = auth.uid()
    AND status IN ('draft', 'pending_payment')
  );

DROP POLICY IF EXISTS "GPs can view their own cases" ON cases;
CREATE POLICY "GPs can view their own cases"
  ON cases
  FOR SELECT
  TO authenticated
  USING (gp_id = auth.uid());

-- Drop and recreate specialist policies with correct 'authenticated' role
DROP POLICY IF EXISTS "Specialists can view their assigned cases" ON cases;
CREATE POLICY "Specialists can view their assigned cases"
  ON cases
  FOR SELECT
  TO authenticated
  USING (
    specialist_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'specialist'
    )
  );

-- Note: The following policies are already correct but included for completeness
-- "GPs can delete their own draft cases" - already 'authenticated' ✓
-- "Specialists can view unassigned cases" - already 'authenticated' ✓
