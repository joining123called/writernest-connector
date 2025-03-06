
-- Migration: 00001_initial_schema
-- Description: Create initial schema for the application
-- Created: 2023-06-09

-- Check if migration has already been applied
DO $$
BEGIN
  -- Create a migrations table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public._migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Check if this migration has already been applied
  IF EXISTS (SELECT 1 FROM public._migrations WHERE name = '00001_initial_schema') THEN
    RAISE NOTICE 'Migration 00001_initial_schema has already been applied, skipping...';
  ELSE
    -- Apply migration
    
    -- Ensure profiles table exists
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      reference_number TEXT
    );

    -- Add row level security policies if needed
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Record that this migration has been applied
    INSERT INTO public._migrations (name) VALUES ('00001_initial_schema');
    
    RAISE NOTICE 'Migration 00001_initial_schema has been applied successfully.';
  END IF;
END $$;
