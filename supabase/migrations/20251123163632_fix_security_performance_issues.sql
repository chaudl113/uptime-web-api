/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add index on monitors.user_id foreign key for better join performance
    - Optimize all RLS policies to use (select auth.uid()) pattern
    - Fix function search_path issues by setting explicit search_path

  2. Schema Changes
    - Move pg_net extension from public to extensions schema
    - Add missing indexes for foreign keys

  3. RLS Policy Optimizations
    - Rewrite all auth.uid() calls to use (select auth.uid())
    - This prevents re-evaluation for each row and improves performance at scale

  4. Important Notes
    - All policies are being dropped and recreated with optimized patterns
    - Functions are updated with explicit search_path for security
*/

-- Add index on monitors.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);

-- Add index on monitor_checks.monitor_id if not exists
CREATE INDEX IF NOT EXISTS idx_monitor_checks_monitor_id ON monitor_checks(monitor_id);

-- Move pg_net extension to extensions schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_net' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    DROP EXTENSION IF EXISTS pg_net CASCADE;
    CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
  END IF;
END $$;

-- Recreate call_check_monitors function with proper search_path
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
    url := current_setting('app.settings.supabase_url') || '/functions/v1/check-monitors',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) INTO request_id;
END;
$$;

-- Update public stats functions with proper search_path
CREATE OR REPLACE FUNCTION get_total_users()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT user_id) FROM user_settings;
$$;

CREATE OR REPLACE FUNCTION get_total_monitors()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM monitors;
$$;

-- Drop and recreate all RLS policies with optimized auth.uid() pattern

-- Monitors table policies
DROP POLICY IF EXISTS "Users can view own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can insert own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can update own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can delete own monitors" ON monitors;

CREATE POLICY "Users can view own monitors"
  ON monitors FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own monitors"
  ON monitors FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own monitors"
  ON monitors FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own monitors"
  ON monitors FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Monitor checks policies
DROP POLICY IF EXISTS "Users can view own monitor checks" ON monitor_checks;
DROP POLICY IF EXISTS "Users can insert own monitor checks" ON monitor_checks;

CREATE POLICY "Users can view own monitor checks"
  ON monitor_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM monitors
      WHERE monitors.id = monitor_checks.monitor_id
      AND monitors.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own monitor checks"
  ON monitor_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM monitors
      WHERE monitors.id = monitor_checks.monitor_id
      AND monitors.user_id = (select auth.uid())
    )
  );

-- User settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Feedback submissions policies
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback_submissions;
DROP POLICY IF EXISTS "Users can read own feedback" ON feedback_submissions;

CREATE POLICY "Users can insert own feedback"
  ON feedback_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can read own feedback"
  ON feedback_submissions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
