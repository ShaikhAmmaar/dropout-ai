
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const safeGetEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const val = (import.meta as any).env[key];
      if (val) return val;
    }
    if (typeof process !== 'undefined' && process.env) {
      const val = (process as any).env[key];
      if (val) return val;
    }
  } catch (e) {}
  return fallback;
};

const supabaseUrl = safeGetEnv('VITE_SUPABASE_URL', 'https://hjcndwjqugfwxpnvghjg.supabase.co');
const supabaseAnonKey = safeGetEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqY25kd2pxdWdmd3hwbnZnaGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTU1ODYsImV4cCI6MjA4Njg3MTU4Nn0.X9-6WXeiSCFE_yYjuh9s5f2JcTNKZrb5zQDUtSS3VV0');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
