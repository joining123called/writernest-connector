
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Retrieve environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ylnywzlvcreanyhancke.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsbnl3emx2Y3JlYW55aGFuY2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MDcxNDQsImV4cCI6MjA1NjM4MzE0NH0.O2UZRbvVTpDQJz9cAZKm86Wj1UmGCHblvDe1QABsuls';

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// This function will be used for testing or configuration changes
export const initSupabase = (url: string, key: string) => {
  return createClient<Database>(url, key);
};
