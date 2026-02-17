
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

/**
 * Supabase client configured for Vercel deployment.
 * Values are pulled from Environment Variables defined in the Vercel Dashboard.
 */
const env = (import.meta as any).env || {};

// These fallbacks are for local development only. 
// For production, the values in Vercel Settings will take priority.
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://hjcndwjqugfwxpnvghjg.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqY25kd2pxdWdmd3hwbnZnaGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTU1ODYsImV4cCI6MjA4Njg3MTU4Nn0.X9-6WXeiSCFE_yYjuh9s5f2JcTNKZrb5zQDUtSS3VV0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
