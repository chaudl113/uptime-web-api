import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Monitor {
  id: string;
  url: string;
  name: string;
  check_interval: number;
  user_id: string;
  is_active: boolean;
  last_checked_at: string | null;
}

interface UserSettings {
  telegram_chat_id: string | null;
  telegram_notifications_enabled: boolean;
  telegram_bot_token: string | null;
}

interface CheckResult {
  monitor_id: string;
  status: 'up' | 'down';
  response_time: number;
  status_code: number | null;
  error_message: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active monitors
    const { data: monitors, error: monitorsError } = await supabase
      .from("monitors")
      .select("*")
      .eq("is_active", true);

    if (monitorsError) throw monitorsError;

    if (!monitors || monitors.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active monitors found", checked: 0 }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const results: CheckResult[] = [];

    // Check each monitor
    for (const monitor of monitors as Monitor[]) {
      const startTime = Date.now();
      let status: 'up' | 'down' = 'down';
      let statusCode: number | null = null;
      let errorMessage: string | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(monitor.url, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "UptimeMonitor/1.0",
          },
        });

        clearTimeout(timeoutId);
        statusCode = response.status;

        if (response.ok) {
          status = 'up';
        } else {
          errorMessage = `HTTP ${response.status}`;
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timeout (30s)';
          } else {
            errorMessage = error.message;
          }
        } else {
          errorMessage = 'Unknown error';
        }
      }

      const responseTime = Date.now() - startTime;

      const result: CheckResult = {
        monitor_id: monitor.id,
        status,
        response_time: responseTime,
        status_code: statusCode,
        error_message: errorMessage,
      };

      results.push(result);

      // Insert check result into database
      await supabase.from("monitor_checks").insert({
        monitor_id: monitor.id,
        status,
        response_time: responseTime,
        status_code: statusCode,
        error_message: errorMessage,
      });

      // Update monitor last_checked_at
      await supabase
        .from("monitors")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("id", monitor.id);

      // Send Telegram notification if monitor is down
      if (status === 'down') {
        // Get user settings for Telegram notifications
        const { data: settings } = await supabase
          .from("user_settings")
          .select("telegram_chat_id, telegram_notifications_enabled, telegram_bot_token")
          .eq("user_id", monitor.user_id)
          .maybeSingle();

        if (settings) {
          const userSettings = settings as UserSettings;
          if (
            userSettings.telegram_notifications_enabled &&
            userSettings.telegram_chat_id &&
            userSettings.telegram_bot_token
          ) {
            // Send Telegram notification
            const message = `🚨 *Monitor Alert*\n\n` +
              `*${monitor.name}* is DOWN!\n\n` +
              `URL: ${monitor.url}\n` +
              `Status: ${errorMessage || 'Unknown error'}\n` +
              `Time: ${new Date().toLocaleString()}`;

            try {
              await fetch(
                `https://api.telegram.org/bot${userSettings.telegram_bot_token}/sendMessage`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat_id: userSettings.telegram_chat_id,
                    text: message,
                    parse_mode: "Markdown",
                  }),
                }
              );
            } catch (telegramError) {
              console.error("Failed to send Telegram notification:", telegramError);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Monitors checked successfully",
        checked: monitors.length,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error checking monitors:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
