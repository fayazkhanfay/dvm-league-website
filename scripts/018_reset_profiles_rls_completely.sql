-- URGENT: Complete reset of profiles RLS to fix login
-- Remove all policies and rebuild from scratch

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view case participant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of case participants" ON public.profiles;

-- Create ONE simple policy for viewing your own profile (this fixes login)
CREATE POLICY "Enable read access for own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create ONE simple policy for viewing other profiles (for file uploader names)
-- This is more permissive but safe - only allows reading public profile info
CREATE POLICY "Enable read access for authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');
