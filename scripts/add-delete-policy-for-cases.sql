-- Add DELETE policy for cases table so GPs can delete their own draft cases
CREATE POLICY "GPs can delete their own cases"
ON cases
FOR DELETE
TO authenticated
USING (
  gp_id = auth.uid()
);
