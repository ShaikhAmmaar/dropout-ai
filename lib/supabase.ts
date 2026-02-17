
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

/**
 * Supabase client with hardcoded credentials for direct Vercel deployment.
 */
const supabaseUrl = 'https://hjcndwjqugfwxpnvghjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqY25kd2pxdWdmd3hwbnZnaGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTU1ODYsImV4cCI6MjA4Njg3MTU4Nn0.X9-6WXeiSCFE_yYjuh9s5f2JcTNKZrb5zQDUtSS3VV0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
