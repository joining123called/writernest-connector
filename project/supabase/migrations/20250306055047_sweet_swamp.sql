/*
  # Profiles Table Setup with RLS

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - email (text, unique)
      - full_name (text)
      - phone (text)
      - role (text)
      - created_at (timestamptz)
      - reference_number (text, nullable)
      - avatar_url (text, nullable)

  2. Security
    - Enable RLS on profiles table
    - Create get_current_user_role function
    - Add RLS policies for profiles table
    - Create handle_new_user trigger function

  3. Changes
    - Add reference_number and avatar_url columns
    - Add RLS policies for admin access
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('writer', 'client', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reference_number TEXT UNIQUE,
  avatar_url TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT (public.get_current_user_role() = 'admin');
$$;

-- Create RLS policies for profiles table
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
  
  -- Create new policies
  -- Users can read their own profile
  CREATE POLICY "Users can read own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

  -- Admin users can read all profiles
  CREATE POLICY "Admins can read all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

  -- Users can update their own profile
  CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

  -- Admins can update any profile
  CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.get_current_user_role() = 'admin');
END $$;

-- Create trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
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

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;