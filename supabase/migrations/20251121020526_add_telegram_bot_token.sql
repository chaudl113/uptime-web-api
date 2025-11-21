/*
  # Add Telegram Bot Token

  1. Changes
    - Add `telegram_bot_token` column to store user's Telegram bot token
    - This allows users to use their own Telegram bot for notifications

  2. Notes
    - Users can create a bot via @BotFather on Telegram
    - The token is optional and stored securely
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'telegram_bot_token'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN telegram_bot_token text;
  END IF;
END $$;