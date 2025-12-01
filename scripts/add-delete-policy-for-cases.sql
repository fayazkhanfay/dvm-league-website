-- Add DELETE policy for cases table so GPs can delete their own draft cases
-- Updated to only allow deletion of draft cases
CREATE POLICY "GPs can delete their own draft cases"
ON cases
FOR DELETE
TO authenticated
USING (
  gp_id = auth.uid()
  AND status = 'draft'
);
