-- Complete setup script that creates auth users and profiles
-- This script should be run in the Supabase SQL Editor or via the v0 script runner

-- Step 1: Create auth users with passwords
-- Note: In Supabase, we need to use the auth.users table directly
-- The password will be 'password123' for both demo users

DO $$
DECLARE
  gp_user_id UUID;
  specialist_user_id UUID;
BEGIN
  -- Create GP user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'gp@dvmleague.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = NOW()
  RETURNING id INTO gp_user_id;

  -- Get the GP user ID if it already existed
  IF gp_user_id IS NULL THEN
    SELECT id INTO gp_user_id FROM auth.users WHERE email = 'gp@dvmleague.com';
  END IF;

  -- Create Specialist user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'specialist@dvmleague.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('password123', gen_salt('bf')),
    updated_at = NOW()
  RETURNING id INTO specialist_user_id;

  -- Get the Specialist user ID if it already existed
  IF specialist_user_id IS NULL THEN
    SELECT id INTO specialist_user_id FROM auth.users WHERE email = 'specialist@dvmleague.com';
  END IF;

  -- Create GP profile
  INSERT INTO public.profiles (id, email, full_name, role, clinic_name, specialty)
  VALUES (
    gp_user_id,
    'gp@dvmleague.com',
    'Dr. John Doe',
    'gp',
    'Main Street Animal Hospital',
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    clinic_name = EXCLUDED.clinic_name;

  -- Create Specialist profile
  INSERT INTO public.profiles (id, email, full_name, role, clinic_name, specialty)
  VALUES (
    specialist_user_id,
    'specialist@dvmleague.com',
    'Dr. Jane Smith',
    'specialist',
    'Specialist Veterinary Services',
    'Cardiology'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    clinic_name = EXCLUDED.clinic_name,
    specialty = EXCLUDED.specialty;

  RAISE NOTICE 'Demo users created successfully!';
  RAISE NOTICE 'GP User ID: %', gp_user_id;
  RAISE NOTICE 'Specialist User ID: %', specialist_user_id;
END $$;
