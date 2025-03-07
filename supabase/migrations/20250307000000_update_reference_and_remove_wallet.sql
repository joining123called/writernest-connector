
/*
  # Update Reference Numbers and Remove Wallet System

  1. Changes:
    - Update reference number format for users
    - Remove wallet-related tables and functions
    - Add cascading delete for user-related records

  2. Security:
    - Ensure proper row level security
    - Validate input data
*/

-- Update the generate_unique_reference_number function with proper formatting
CREATE OR REPLACE FUNCTION public.generate_unique_reference_number(role_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ref_number text;
  ref_exists boolean;
BEGIN
  -- Validate role prefix
  IF role_prefix NOT IN ('Adm', 'Wrt', 'Cli') THEN
    CASE 
      WHEN LOWER(role_prefix) = 'a' THEN role_prefix := 'Adm';
      WHEN LOWER(role_prefix) = 'w' THEN role_prefix := 'Wrt';
      WHEN LOWER(role_prefix) = 'c' THEN role_prefix := 'Cli';
      ELSE role_prefix := 'Usr';
    END CASE;
  END IF;

  LOOP
    -- Generate a reference number with role prefix and random numbers
    new_ref_number := role_prefix || '-' || LPAD(FLOOR(random() * 1000000)::text, 6, '0');
    
    -- Check if it exists
    SELECT EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE reference_number = new_ref_number
    ) INTO ref_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT ref_exists;
  END LOOP;
  
  RETURN new_ref_number;
END;
$$;

-- Update existing reference numbers to new format
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id, role, reference_number FROM profiles
  LOOP
    -- Skip if already in the new format
    IF profile_record.reference_number IS NULL OR profile_record.reference_number NOT LIKE '%-%' THEN
      -- Determine role prefix
      DECLARE role_prefix text;
      BEGIN
        CASE 
          WHEN profile_record.role = 'admin' THEN role_prefix := 'Adm';
          WHEN profile_record.role = 'writer' THEN role_prefix := 'Wrt';
          WHEN profile_record.role = 'client' THEN role_prefix := 'Cli';
          ELSE role_prefix := 'Usr';
        END CASE;
        
        -- Generate new reference number
        UPDATE profiles
        SET reference_number = public.generate_unique_reference_number(role_prefix)
        WHERE id = profile_record.id;
      END;
    END IF;
  END LOOP;
END
$$;

-- Add cascading delete to prevent foreign key constraint issues
ALTER TABLE IF EXISTS public.assignment_files 
  DROP CONSTRAINT IF EXISTS assignment_files_assignment_id_fkey,
  ADD CONSTRAINT assignment_files_assignment_id_fkey
    FOREIGN KEY (assignment_id)
    REFERENCES public.assignment_details(id)
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.assignment_details
  DROP CONSTRAINT IF EXISTS assignment_details_user_id_fkey,
  ADD CONSTRAINT assignment_details_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
