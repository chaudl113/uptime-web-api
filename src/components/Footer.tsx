import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Activity } from 'lucide-react';

export function Footer() {
  const [stats, setStats] = useState({ totalUsers: 0, totalMonitors: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResult, monitorsResult] = await Promise.all([
          supabase.rpc('get_total_users'),
          supabase.rpc('get_total_monitors')
        ]);

        setStats({
          totalUsers: usersResult.data || 0,
          totalMonitors: monitorsResult.data || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-12 py-6 border-t border-slate-200 bg-white/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{stats.totalUsers.toLocaleString()}</span>
            <span>users monitoring</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="font-medium">{stats.totalMonitors.toLocaleString()}</span>
            <span>sites tracked</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
