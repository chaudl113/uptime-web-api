# Uptime Monitor

A modern website uptime monitoring application with real-time status tracking and Telegram notifications.

## Features

- **Real-time Monitoring**: Track website uptime with customizable check intervals
- **Multi-language Support**: Available in English and Vietnamese
- **Telegram Notifications**: Instant alerts when your sites go down
- **Historical Data**: View uptime history and response times
- **User Authentication**: Secure authentication powered by Supabase
- **Beautiful Dashboard**: Clean, responsive UI with real-time statistics
- **Feedback System**: Built-in bug reporting and feature request system

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Icons**: Lucide React
- **Routing**: React Router v7

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works fine)
- A Telegram Bot Token (optional, for notifications)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd uptime-monitor
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Database Migrations

Apply the migrations in order from the `supabase/migrations` folder:

1. `create_uptime_monitoring_tables.sql`
2. `add_user_ownership_to_monitors.sql`
3. `create_user_settings_table.sql`
4. `add_telegram_notification_settings.sql`
5. `add_telegram_bot_token.sql`
6. `create_feedback_submissions_table.sql`
7. `create_public_stats_functions.sql`

You can apply these through the Supabase dashboard SQL editor.

### 4. Deploy Edge Function (Optional)

If you want the feedback system to work, deploy the `send-feedback` edge function:

```bash
# Using Supabase CLI
supabase functions deploy send-feedback
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Setting Up Telegram Notifications

1. Create a bot by messaging [@BotFather](https://t.me/BotFather) on Telegram
2. Get your Chat ID from [@userinfobot](https://t.me/userinfobot)
3. In the app settings, enter your Bot Token and Chat ID
4. Click "Test Telegram" to verify the connection
5. Enable notifications and save

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth, Language)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Supabase client configuration
│   ├── pages/           # Page components
│   └── main.tsx         # App entry point
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
└── public/              # Static assets
```

## Database Schema

### Tables

- `monitors` - Website monitoring configuration
- `monitor_checks` - Historical check results
- `user_settings` - User preferences and Telegram settings
- `feedback_submissions` - Bug reports and feature requests

All tables have Row Level Security (RLS) enabled for data protection.

## Security

- Row Level Security (RLS) enabled on all tables
- User data isolated by authentication
- Telegram tokens stored securely in user settings
- No sensitive credentials in frontend code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please use the in-app feedback system or create a GitHub issue.
