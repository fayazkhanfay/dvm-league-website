-- Add is_demo column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_demo IS 'Indicates if this user is in demo mode (uses test Stripe keys)';

-- Optional: Set a specific user as demo for testing
-- UPDATE profiles SET is_demo = TRUE WHERE email = 'demo@example.com';
