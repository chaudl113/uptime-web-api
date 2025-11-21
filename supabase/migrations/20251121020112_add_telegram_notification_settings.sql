/*
  # Add Telegram Notification Settings

  1. Changes
    - Add `telegram_chat_id` column to store user's Telegram chat ID
    - Add `telegram_notifications` boolean flag to enable/disable Telegram notifications
    - Both fields are optional to maintain backward compatibility

  2. Notes
    - Users will need to obtain their Telegram chat ID by messaging a bot
    - Telegram notifications will work alongside email notifications
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'telegram_chat_id'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN telegram_chat_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'telegram_notifications'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN telegram_notifications boolean DEFAULT false NOT NULL;
  END IF;
END $$;