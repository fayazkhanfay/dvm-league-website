-- Note: This script assumes demo users have been created via Supabase Auth
-- with emails: gp@dvmleague.com and specialist@dvmleague.com
-- You'll need to replace these UUIDs with actual user IDs after creating the auth users

-- Insert GP profile (replace UUID with actual auth.users.id after user creation)
-- For now, we'll use placeholder UUIDs that you'll need to update
INSERT INTO public.profiles (id, email, full_name, role, clinic_name, specialty)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'gp@dvmleague.com', 'Dr. John Doe', 'gp', 'Main Street Animal Hospital', NULL)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  clinic_name = EXCLUDED.clinic_name;

-- Insert Specialist profile (replace UUID with actual auth.users.id after user creation)
INSERT INTO public.profiles (id, email, full_name, role, clinic_name, specialty)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'specialist@dvmleague.com', 'Dr. Jane Smith', 'specialist', 'Specialist Veterinary Services', 'Cardiology')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  clinic_name = EXCLUDED.clinic_name,
  specialty = EXCLUDED.specialty;
