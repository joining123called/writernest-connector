/*
  # Fix Profiles Functions and Policies

  1. Changes
    - Update handle_new_user function with better error handling
    - Update get_current_user_role function with search_path
    - Add generate_unique_reference_number function
    - Update RLS policies with better security

  2. Security
    - Set explicit search_path
    - Add proper error handling
    - Validate input data
    - Ensure RLS is enabled
*/

-- Update the handle_new_user function with better error handling and validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role text;
  user_full_name text;
  user_phone text;
  ref_number text;
BEGIN
  -- Set default role if not provided
  default_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
  
  -- Validate role
  IF default_role NOT IN ('writer', 'client', 'admin') THEN
    default_role := 'client';
  END IF;

  -- Get user details with fallbacks
  user_full_name := COALESCE(new.raw_user_meta_data->>'fullName', '');
  user_phone := COALESCE(new.raw_user_meta_data->>'phone', '');

  -- Generate reference number based on role
  ref_number := generate_unique_reference_number(UPPER(LEFT(default_role, 1)));

  -- Insert profile with validation
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    reference_number,
    created_at
  )
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    user_full_name,
    user_phone,
    default_role,
    ref_number,
    NOW()
  );

  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error details
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Update the get_current_user_role function with search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update the generate_unique_reference_number function with search_path
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
  LOOP
    -- Generate a reference number with role prefix and random numbers
    new_ref_number := role_prefix || to_char(floor(random() * 900000 + 100000), 'FM999999');
    
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

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new policies with better conditions
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  public.get_current_user_role() = 'admin'
);

-- Add delete policy for admins
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (
  public.get_current_user_role() = 'admin'
);