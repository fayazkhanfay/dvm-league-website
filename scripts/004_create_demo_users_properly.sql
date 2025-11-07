-- Create demo users using Supabase's auth admin functions
-- This script creates users in auth.users and the trigger will auto-create profiles

-- Create GP user
DO $$
DECLARE
  gp_user_id uuid;
  specialist_user_id uuid;
BEGIN
  -- Create GP user with email and password
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
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'gp@dvmleague.com',
    crypt('password123', gen_salt('bf')), -- Hashed password
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

  -- Update the GP profile with additional details
  UPDATE public.profiles
  SET 
    full_name = 'Dr. John Doe',
    role = 'gp',
    clinic_name = 'Main Street Animal Hospital'
  WHERE id = gp_user_id;

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
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'specialist@dvmleague.com',
    crypt('password123', gen_salt('bf')), -- Hashed password
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

  -- Update the Specialist profile with additional details
  UPDATE public.profiles
  SET 
    full_name = 'Dr. Jane Smith',
    role = 'specialist',
    clinic_name = 'Specialist Veterinary Services',
    specialty = 'Cardiology'
  WHERE id = specialist_user_id;

  RAISE NOTICE 'Demo users created successfully!';
  RAISE NOTICE 'GP User ID: %', gp_user_id;
  RAISE NOTICE 'Specialist User ID: %', specialist_user_id;
END $$;
