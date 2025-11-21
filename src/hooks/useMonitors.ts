import { useState, useEffect } from 'react';
import { supabase, Monitor, MonitorCheck } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MonitorWithStats {
  monitor: Monitor;
  latestCheck: MonitorCheck | null;
  uptimePercentage: number;
}

export function useMonitors() {
  const { user } = useAuth();
  const [monitors, setMonitors] = useState<MonitorWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setMonitors([]);
        setIsLoading(false);
        return;
      }

      const { data: monitorsData, error: monitorsError } = await supabase
        .from('monitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (monitorsError) throw monitorsError;

      const monitorsWithStats = await Promise.all(
        (monitorsData || []).map(async (monitor) => {
          const { data: latestCheckData } = await supabase
            .from('monitor_checks')
            .select('*')
            .eq('monitor_id', monitor.id)
            .order('checked_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: last24hChecks } = await supabase
            .from('monitor_checks')
            .select('is_up')
            .eq('monitor_id', monitor.id)
            .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          let uptimePercentage = 100;
          if (last24hChecks && last24hChecks.length > 0) {
            const upCount = last24hChecks.filter((check) => check.is_up).length;
            uptimePercentage = (upCount / last24hChecks.length) * 100;
          }

          return {
            monitor,
            latestCheck: latestCheckData,
            uptimePercentage,
          };
        })
      );

      setMonitors(monitorsWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitors');
    } finally {
      setIsLoading(false);
    }
  };

  const checkMonitor = async (monitorId: string) => {
    try {
      const { data: monitor } = await supabase
        .from('monitors')
        .select('*')
        .eq('id', monitorId)
        .maybeSingle();

      if (!monitor) throw new Error('Monitor not found');

      const startTime = Date.now();
      let statusCode: number | null = null;
      let isUp = false;
      let errorMessage: string | null = null;

      try {
        const response = await fetch(monitor.url, {
          method: 'HEAD',
          mode: 'no-cors',
        });
        statusCode = response.status || 0;
        isUp = true;
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : 'Failed to reach URL';
        isUp = false;
      }

      const responseTime = Date.now() - startTime;

      await supabase.from('monitor_checks').insert({
        monitor_id: monitorId,
        status_code: statusCode,
        response_time: responseTime,
        is_up: isUp,
        error_message: errorMessage,
      });

      await fetchMonitors();
    } catch (err) {
      console.error('Failed to check monitor:', err);
    }
  };

  const deleteMonitor = async (monitorId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('monitors')
        .delete()
        .eq('id', monitorId);

      if (deleteError) throw deleteError;

      await fetchMonitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete monitor');
    }
  };

  useEffect(() => {
    fetchMonitors();

    const subscription = supabase
      .channel('monitors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monitors' }, () => {
        fetchMonitors();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'monitor_checks' }, () => {
        fetchMonitors();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    monitors,
    isLoading,
    error,
    refetch: fetchMonitors,
    checkMonitor,
    deleteMonitor,
  };
}
