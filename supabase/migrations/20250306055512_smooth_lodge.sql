/*
  # Enable RLS for _migrations table

  1. Changes
    - Enable RLS on _migrations table
    - Add RLS policies for admin access
    - Add RLS policies for system access
  
  2. Security
    - Only admins can view and modify migrations
    - System functions can access migrations during deployment
    - All other access is denied
*/

-- Enable RLS on _migrations table
ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage migrations
CREATE POLICY "Admins can manage migrations" 
ON public._migrations 
FOR ALL 
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Create policy for system functions to access migrations
CREATE POLICY "System can access migrations" 
ON public._migrations 
FOR ALL 
USING (current_user = 'postgres' OR current_user = 'service_role')
WITH CHECK (current_user = 'postgres' OR current_user = 'service_role');

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_current_user_role() = 'admin';
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public._migrations TO postgres, service_role;
GRANT SELECT ON public._migrations TO authenticated;