import { Activity, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Monitor {
  id: string;
  is_active: boolean;
}

interface MonitorCheck {
  is_up: boolean;
  response_time: number | null;
}

interface MonitorWithStats {
  monitor: Monitor;
  latestCheck: MonitorCheck | null;
  uptimePercentage: number;
}

interface DashboardStatsProps {
  monitors: MonitorWithStats[];
}

export function DashboardStats({ monitors }: DashboardStatsProps) {
  const { t } = useLanguage();
  const totalMonitors = monitors.length;
  const upMonitors = monitors.filter((m) => m.latestCheck?.is_up).length;
  const downMonitors = monitors.filter(
    (m) => m.latestCheck && !m.latestCheck.is_up
  ).length;

  const avgResponseTime =
    monitors.length > 0
      ? Math.round(
          monitors.reduce((sum, m) => sum + (m.latestCheck?.response_time || 0), 0) /
            monitors.filter((m) => m.latestCheck?.response_time).length || 0
        )
      : 0;

  const avgUptime =
    monitors.length > 0
      ? Math.round(
          monitors.reduce((sum, m) => sum + m.uptimePercentage, 0) / monitors.length
        )
      : 0;

  const stats = [
    {
      label: t('dashboard.stats.totalMonitors'),
      value: totalMonitors,
      icon: Activity,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('monitor.status.up'),
      value: upMonitors,
      icon: CheckCircle2,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: t('monitor.status.down'),
      value: downMonitors,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: t('dashboard.stats.avgResponse'),
      value: avgResponseTime > 0 ? `${avgResponseTime}ms` : 'N/A',
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: t('dashboard.stats.avgUptime'),
      value: avgUptime > 0 ? `${avgUptime}%` : 'N/A',
      icon: TrendingUp,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
