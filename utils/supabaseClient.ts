import { createClient } from '@supabase/supabase-js';

// Access environment variables via Vite's import.meta.env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');