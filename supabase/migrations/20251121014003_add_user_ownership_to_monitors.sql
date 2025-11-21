/*
  # Add User Ownership to Monitors

  1. Changes
    - Add `user_id` column to `monitors` table to track ownership
    - Update RLS policies to be user-specific
    - Users can only view, edit, and delete their own monitors
    - Anonymous users cannot create monitors

  2. Security
    - Restrict monitor access to authenticated users only
    - Each user can only access their own monitors
    - Monitor checks inherit access from parent monitor
*/

-- Add user_id column to monitors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monitors' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE monitors ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view monitors" ON monitors;
DROP POLICY IF EXISTS "Anyone can insert monitors" ON monitors;
DROP POLICY IF EXISTS "Anyone can update monitors" ON monitors;
DROP POLICY IF EXISTS "Anyone can delete monitors" ON monitors;
DROP POLICY IF EXISTS "Anyone can view monitor checks" ON monitor_checks;
DROP POLICY IF EXISTS "Anyone can insert checks" ON monitor_checks;

-- New RLS Policies for monitors table (user-specific)
CREATE POLICY "Users can view own monitors"
  ON monitors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monitors"
  ON monitors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitors"
  ON monitors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitors"
  ON monitors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- New RLS Policies for monitor_checks (inherit from monitor ownership)
CREATE POLICY "Users can view own monitor checks"
  ON monitor_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM monitors
      WHERE monitors.id = monitor_checks.monitor_id
      AND monitors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own monitor checks"
  ON monitor_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM monitors
      WHERE monitors.id = monitor_checks.monitor_id
      AND monitors.user_id = auth.uid()
    )
  );