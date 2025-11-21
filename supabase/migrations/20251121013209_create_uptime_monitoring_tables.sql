/*
  # Create Uptime Monitoring System Tables

  1. New Tables
    - `monitors`
      - `id` (uuid, primary key)
      - `name` (text) - Name/description of the monitor
      - `url` (text) - URL to monitor
      - `check_interval` (integer) - Seconds between checks (default 300)
      - `is_active` (boolean) - Whether monitor is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `monitor_checks`
      - `id` (uuid, primary key)
      - `monitor_id` (uuid, foreign key) - References monitors table
      - `status_code` (integer) - HTTP status code
      - `response_time` (integer) - Response time in ms
      - `is_up` (boolean) - Whether site is up
      - `error_message` (text) - Error details if any
      - `checked_at` (timestamptz) - Check timestamp

  2. Security
    - Enable RLS on both tables
    - Public read access for all users
    - Authenticated users can create/update/delete monitors
    - Authenticated users can insert checks

  3. Performance
    - Index on monitor_id for faster lookups
    - Index on checked_at for time-based queries
*/

-- Create monitors table
CREATE TABLE IF NOT EXISTS monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  check_interval integer DEFAULT 300,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create monitor_checks table
CREATE TABLE IF NOT EXISTS monitor_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  status_code integer,
  response_time integer,
  is_up boolean NOT NULL,
  error_message text,
  checked_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_monitor_checks_monitor_id ON monitor_checks(monitor_id);
CREATE INDEX IF NOT EXISTS idx_monitor_checks_checked_at ON monitor_checks(checked_at DESC);

-- Enable RLS
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_checks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view monitors" ON monitors;
DROP POLICY IF EXISTS "Authenticated users can insert monitors" ON monitors;
DROP POLICY IF EXISTS "Authenticated users can update monitors" ON monitors;
DROP POLICY IF EXISTS "Authenticated users can delete monitors" ON monitors;
DROP POLICY IF EXISTS "Anyone can view monitor checks" ON monitor_checks;
DROP POLICY IF EXISTS "Authenticated users can insert checks" ON monitor_checks;

-- RLS Policies for monitors table
CREATE POLICY "Anyone can view monitors"
  ON monitors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert monitors"
  ON monitors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update monitors"
  ON monitors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete monitors"
  ON monitors FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for monitor_checks table
CREATE POLICY "Anyone can view monitor checks"
  ON monitor_checks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert checks"
  ON monitor_checks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS monitors_updated_at ON monitors;
CREATE TRIGGER monitors_updated_at
  BEFORE UPDATE ON monitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();