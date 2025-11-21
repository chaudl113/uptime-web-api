/*
  # Create Public Stats Functions

  1. New Functions
    - `get_total_users` - Returns total number of unique users
    - `get_total_monitors` - Returns total number of monitors
  
  2. Security
    - Both functions are public and can be called by anyone
    - Functions return aggregate counts only, no sensitive data
*/

CREATE OR REPLACE FUNCTION get_total_users()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT user_id) FROM user_settings;
$$;

CREATE OR REPLACE FUNCTION get_total_monitors()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM monitors;
$$;

GRANT EXECUTE ON FUNCTION get_total_users() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_total_monitors() TO anon, authenticated;