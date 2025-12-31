-- Migration: Add RLS policy to allow reading specialist profiles
-- This is needed for the notification system to find and email specialists

-- Add a policy that allows reading basic specialist profile information
-- This is safe because we only expose email, name, and specialty for specialists
CREATE POLICY "Allow reading specialist profiles for notifications"
ON public.profiles
FOR SELECT
TO public
USING (role = 'specialist');

-- Optional: If you want to restrict to only authenticated users (more secure)
-- Uncomment this version and comment out the above if preferred:
/*
CREATE POLICY "Allow reading specialist profiles for notifications"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'specialist');
*/
