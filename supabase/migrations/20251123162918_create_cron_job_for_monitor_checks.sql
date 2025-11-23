/*
  # Create Cron Job for Automatic Monitor Checks

  1. Overview
    - Sets up pg_cron extension to run monitor checks automatically
    - Schedules the check-monitors edge function to run every 5 minutes
    - Ensures 24/7 uptime monitoring without requiring browser to be open

  2. Configuration
    - Enables pg_cron extension for PostgreSQL
    - Creates cron job that runs every 5 minutes
    - Calls the check-monitors edge function via pg_net extension

  3. Important Notes
    - pg_cron runs in UTC timezone
    - Job runs every 5 minutes using cron syntax
    - Uses pg_net to make HTTP requests to edge functions
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION call_check_monitors()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Make async HTTP request to check-monitors edge function
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/check-monitors',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) INTO request_id;
END;
$$;

-- Schedule the cron job to run every 5 minutes
SELECT cron.schedule(
  'check-monitors-every-5-minutes',
  '*/5 * * * *',
  $$SELECT call_check_monitors();$$
);
