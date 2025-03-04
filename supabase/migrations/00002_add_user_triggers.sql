
-- Migration: 00002_add_user_triggers
-- Description: Add triggers for handling new user creation
-- Created: 2023-06-10

-- Check if migration has already been applied
DO $$
BEGIN
  -- Check if this migration has already been applied
  IF EXISTS (SELECT 1 FROM public._migrations WHERE name = '00002_add_user_triggers') THEN
    RAISE NOTICE 'Migration 00002_add_user_triggers has already been applied, skipping...';
  ELSE
    -- Apply migration
    
    -- Create function to generate unique reference numbers
    CREATE OR REPLACE FUNCTION public.generate_unique_reference_number(role_prefix text)
    RETURNS text
    LANGUAGE plpgsql
    AS $$
    DECLARE
      reference TEXT;
      exists_already BOOLEAN;
    BEGIN
      LOOP
        -- Generate a random 6-digit number
        reference := role_prefix || '-' || 
                    LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if this reference already exists
        SELECT EXISTS(
          SELECT 1 FROM profiles 
          WHERE reference_number = reference
        ) INTO exists_already;
        
        -- If it doesn't exist, we've found a unique reference
        IF NOT exists_already THEN
          RETURN reference;
        END IF;
      END LOOP;
    END;
    $$;

    -- Create function to handle new user creation
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    DECLARE
      user_role TEXT;
      role_prefix TEXT;
      ref_number TEXT;
    BEGIN
      -- Get the role from metadata
      user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
      
      -- Set the prefix based on role
      CASE 
        WHEN user_role = 'admin' THEN role_prefix := 'Adm';
        WHEN user_role = 'writer' THEN role_prefix := 'Wrt';
        ELSE role_prefix := 'Cli';
      END CASE;
      
      -- Generate the unique reference number
      ref_number := generate_unique_reference_number(role_prefix);
      
      -- Insert into profiles with the reference number
      INSERT INTO public.profiles (id, email, full_name, phone, role, reference_number)
      VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'fullName', ''),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        user_role,
        ref_number
      );
      RETURN new;
    END;
    $$;

    -- Create function to get current user role (avoiding RLS infinite recursion)
    CREATE OR REPLACE FUNCTION public.get_current_user_role()
    RETURNS text
    LANGUAGE sql
    STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
      SELECT role FROM public.profiles WHERE id = auth.uid();
    $$;

    -- Create trigger to handle new user creation
    -- Check if trigger already exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ) THEN
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;

    -- Record that this migration has been applied
    INSERT INTO public._migrations (name) VALUES ('00002_add_user_triggers');
    
    RAISE NOTICE 'Migration 00002_add_user_triggers has been applied successfully.';
  END IF;
END $$;
