/*
  # Fix Function Search Paths

  1. Changes
    - Add search_path parameter to generate_unique_assignment_id function
    - Add search_path parameter to generate_unique_reference_number function
    - Ensure functions are schema-qualified

  2. Security
    - Prevent search_path manipulation
    - Ensure consistent schema resolution
*/

-- Fix generate_unique_assignment_id function
CREATE OR REPLACE FUNCTION public.generate_unique_assignment_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    -- Generate a random 8-character string
    new_id := UPPER(SUBSTRING(MD5(''||NOW()::TEXT||RANDOM()::TEXT) FOR 8));
    
    -- Check if this ID already exists
    done := NOT EXISTS (
      SELECT 1 
      FROM public.assignment_details 
      WHERE assignment_code = new_id
    );
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Fix generate_unique_reference_number function
CREATE OR REPLACE FUNCTION public.generate_unique_reference_number(role_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ref text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    -- Generate a random 6-digit number
    new_ref := role_prefix || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    
    -- Check if this reference number already exists
    done := NOT EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE reference_number = new_ref
    );
  END LOOP;
  
  RETURN new_ref;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.generate_unique_assignment_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_unique_reference_number(text) TO authenticated;