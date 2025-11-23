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

    const now = new Date();
    const results: CheckResult[] = [];
    let checkedCount = 0;

    // Check each monitor based on its check_interval
    for (const monitor of monitors as Monitor[]) {
      // Check if this monitor is due for a check
      let shouldCheck = false;
      
      if (!monitor.last_checked_at) {
        // Never checked before, check it now
        shouldCheck = true;
      } else {
        const lastChecked = new Date(monitor.last_checked_at);
        const secondsSinceLastCheck = (now.getTime() - lastChecked.getTime()) / 1000;
        
        // check_interval is in seconds, compare with seconds since last check
        if (secondsSinceLastCheck >= monitor.check_interval) {
          shouldCheck = true;
        }
      }

      if (!shouldCheck) {
        continue;
      }

      checkedCount++;
      const startTime = Date.now();
      let status: 'up' | 'down' = 'down';
      let statusCode: number | null = null;
      let errorMessage: string | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        .update({ last_checked_at: now.toISOString() })
        .eq("id", monitor.id);

      // Send Telegram notification if monitor is down
      if (status === 'down') {
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
        total_active: monitors.length,
        checked: checkedCount,
        skipped: monitors.length - checkedCount,
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
