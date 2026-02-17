import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const supabaseUrl = (window as any).process?.env?.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = (window as any).process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// If env vars aren't set in the browser yet, we provide a mock or handle gracefully
export const supabase = createClient(supabaseUrl, supabaseAnonKey);