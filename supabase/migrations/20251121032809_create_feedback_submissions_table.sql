/*
  # Create Feedback Submissions Table

  1. New Tables
    - `feedback_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, 'bug' or 'feature')
      - `subject` (text)
      - `description` (text)
      - `email` (text)
      - `user_agent` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `feedback_submissions` table
    - Add policy for authenticated users to insert their own feedback
    - Add policy for authenticated users to read their own feedback

  3. Notes
    - Store feedback submissions for tracking and spam prevention
    - Rate limiting will be handled in the edge function
*/

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('bug', 'feature')),
  subject text NOT NULL,
  description text NOT NULL,
  email text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
  ON feedback_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON feedback_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_submissions(created_at DESC);
