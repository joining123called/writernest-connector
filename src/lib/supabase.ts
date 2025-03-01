
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// This function will be replaced with actual keys once Supabase is connected
export const initSupabase = (url: string, key: string) => {
  return createClient<Database>(url, key);
};
