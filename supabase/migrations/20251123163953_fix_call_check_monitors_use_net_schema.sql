/*
  # Fix call_check_monitors to use net.http_post

  1. Changes
    - Update function to use net.http_post (pg_net is in net schema, not extensions)
    - Keep hardcoded Supabase URL and service role key

  2. Notes
    - pg_net functions are in the 'net' schema
    - The function makes async HTTP call to check-monitors edge function
*/

CREATE OR REPLACE FUNCTION call_check_monitors()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  request_id bigint;
BEGIN
  SELECT net.http_post(
    url := 'https://ftdbkjagphdkwchreotz.supabase.co/functions/v1/check-monitors',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZGJramFncGhka3djaHJlb3R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY4NjIzNiwiZXhwIjoyMDc5MjYyMjM2fQ.msfpAP_HJDRiHqfXvvGpqnRUj-CaKX_xG8Iw-WZhQ3A'
    ),
    body := '{}'::jsonb
  ) INTO request_id;
END;
$$;
