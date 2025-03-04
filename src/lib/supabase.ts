
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// This function will be used for testing or configuration changes
export const initSupabase = (url: string, key: string) => {
  return createClient<Database>(url, key);
};
