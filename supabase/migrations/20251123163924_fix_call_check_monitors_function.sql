/*
  # Fix call_check_monitors Function

  1. Changes
    - Update call_check_monitors to use extensions.http_post (pg_net extension)
    - Hardcode Supabase URL and service role key instead of using settings
    - Use proper schema reference for pg_net

  2. Notes
    - The function calls the check-monitors edge function via HTTP
    - Uses service role key for authentication
*/

-- Drop and recreate the function with hardcoded values
CREATE OR REPLACE FUNCTION call_check_monitors()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  request_id bigint;
BEGIN
  SELECT extensions.http_post(
    url := 'https://ftdbkjagphdkwchreotz.supabase.co/functions/v1/check-monitors',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZGJramFncGhka3djaHJlb3R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY4NjIzNiwiZXhwIjoyMDc5MjYyMjM2fQ.msfpAP_HJDRiHqfXvvGpqnRUj-CaKX_xG8Iw-WZhQ3A'
    ),
    body := '{}'::jsonb
  ) INTO request_id;
END;
$$;
