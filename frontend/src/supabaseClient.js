import { createClient } from '@supabase/supabase-js';

// It's crucial to use environment variables for these, especially in a public repository.
// In a Create React App, environment variables must start with REACT_APP_.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Make sure to set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file or deployment environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
