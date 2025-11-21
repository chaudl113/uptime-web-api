import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  down_alerts: boolean;
  uptime_reports: boolean;
  telegram_notifications: boolean;
  telegram_chat_id: string | null;
  telegram_bot_token: string | null;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            email_notifications: true,
            down_alerts: true,
            uptime_reports: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !settings) return { error: new Error('No user or settings') };

    try {
      const { data, error: updateError } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update settings');
      setError(error.message);
      return { error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
