import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export interface Monitor {
  id: string;
  name: string;
  url: string;
  check_interval: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitorCheck {
  id: string;
  monitor_id: string;
  status_code: number | null;
  response_time: number | null;
  is_up: boolean;
  error_message: string | null;
  checked_at: string;
}
