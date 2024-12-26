/*
  # Update Admin User Metadata

  1. Changes
    - Update admin user metadata to include proper role
    - Set correct app metadata
    - Ensure proper authentication settings

  2. Security
    - Maintains existing password
    - Updates only metadata fields
    - Preserves user authentication status
*/

-- Update admin user metadata
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_build_object(
    'provider', 'email',
    'providers', array['email'],
    'role', 'admin'
  ),
  raw_user_meta_data = jsonb_build_object(
    'role', 'admin',
    'full_name', 'System Admin'
  )
WHERE email = 'admin@usesafe.com';

-- Verify the update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@usesafe.com' 
    AND raw_app_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin user metadata update failed';
  END IF;
END $$;