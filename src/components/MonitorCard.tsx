import { Monitor, MonitorCheck } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MonitorCardProps {
  monitor: Monitor;
  latestCheck: MonitorCheck | null;
  uptimePercentage: number;
}

export function MonitorCard({ monitor, latestCheck, uptimePercentage }: MonitorCardProps) {
  const isUp = latestCheck?.is_up ?? false;
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{monitor.name}</h3>
          <p className="text-sm text-gray-500 break-all">{monitor.url}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isUp ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{isUp ? t('monitor.status.up') : t('monitor.status.down')}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">{t('monitor.uptime')}</p>
            <p className="text-sm font-semibold text-gray-900">{uptimePercentage.toFixed(2)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-xs text-gray-500">{t('monitor.response')}</p>
            <p className="text-sm font-semibold text-gray-900">
              {latestCheck?.response_time ? `${latestCheck.response_time}ms` : 'N/A'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">{t('monitor.statusCode')}</p>
          <p className="text-sm font-semibold text-gray-900">
            {latestCheck?.status_code ?? 'N/A'}
          </p>
        </div>
      </div>

      {latestCheck?.error_message && (
        <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
          <p className="text-xs text-red-800">{latestCheck.error_message}</p>
        </div>
      )}
    </div>
  );
}
