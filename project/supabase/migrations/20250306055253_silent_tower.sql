/*
  # Update Database Functions with Explicit Search Path

  1. Changes
    - Update handle_new_user function with explicit search_path
    - Update get_current_user_role function with explicit search_path
    - Update generate_unique_assignment_id function with explicit search_path
    - Update generate_unique_reference_number function with explicit search_path

  2. Security
    - All functions now have explicit search_path set to public
    - Added SECURITY DEFINER to all functions
    - Added proper schema qualification
*/

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_prefix TEXT;
  ref_number TEXT;
BEGIN
  -- Determine role prefix based on user role
  role_prefix := CASE 
    WHEN COALESCE(new.raw_user_meta_data->>'role', 'client') = 'admin' THEN 'ADM'
    WHEN COALESCE(new.raw_user_meta_data->>'role', 'client') = 'writer' THEN 'WRT'
    ELSE 'CLT'
  END;

  -- Generate unique reference number
  ref_number := public.generate_unique_reference_number(role_prefix);

  -- Insert new profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    reference_number
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'fullName', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    ref_number
  );
  RETURN new;
END;
$$;

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update generate_unique_assignment_id function
CREATE OR REPLACE FUNCTION public.generate_unique_assignment_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  done BOOL;
BEGIN
  done := FALSE;
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

-- Update generate_unique_reference_number function
CREATE OR REPLACE FUNCTION public.generate_unique_reference_number(role_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ref TEXT;
  done BOOL;
BEGIN
  done := FALSE;
  WHILE NOT done LOOP
    -- Generate a random 6-digit number
    new_ref := role_prefix || TO_CHAR(FLOOR(RANDOM() * 900000 + 100000), 'FM999999');
    
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
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO postgres, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_unique_assignment_id() TO postgres, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_unique_reference_number(text) TO postgres, anon, authenticated;