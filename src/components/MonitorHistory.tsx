import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { supabase, MonitorCheck } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface MonitorHistoryProps {
  monitorId: string;
  monitorName: string;
  onClose: () => void;
}

export function MonitorHistory({ monitorId, monitorName, onClose }: MonitorHistoryProps) {
  const [checks, setChecks] = useState<MonitorCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'up' | 'down'>('all');
  const { t } = useLanguage();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('monitor_checks')
          .select('*')
          .eq('monitor_id', monitorId);

        if (filter === 'up') {
          query = query.eq('is_up', true);
        } else if (filter === 'down') {
          query = query.eq('is_up', false);
        }

        const { data, error } = await query
          .order('checked_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setChecks(data || []);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [monitorId, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const uptimePercentage = checks.length > 0
    ? (checks.filter(c => c.is_up).length / checks.length) * 100
    : 0;

  const avgResponseTime = checks.length > 0
    ? checks.reduce((sum, c) => sum + (c.response_time || 0), 0) / checks.length
    : 0;

  const maxResponseTime = checks.length > 0
    ? Math.max(...checks.map(c => c.response_time || 0))
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{t('history.title')}</h3>
              <p className="text-sm text-gray-600 mt-1">{monitorName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-3xl">&times;</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('history.filter.all')}
            </button>
            <button
              onClick={() => setFilter('up')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'up'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {t('history.filter.up')}
            </button>
            <button
              onClick={() => setFilter('down')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'down'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <XCircle className="w-4 h-4" />
              {t('history.filter.down')}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : checks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('history.noHistory')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-700">{t('history.stats.uptime')}</h4>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{uptimePercentage.toFixed(1)}%</p>
                  <p className="text-xs text-gray-600 mt-1">{checks.filter(c => c.is_up).length} of {checks.length} {t('history.stats.checks')}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <h4 className="text-sm font-semibold text-gray-700">{t('history.stats.avgResponse')}</h4>
                  </div>
                  <p className="text-3xl font-bold text-green-700">{avgResponseTime.toFixed(0)}ms</p>
                  <p className="text-xs text-gray-600 mt-1">{t('history.stats.averageTime')}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <h4 className="text-sm font-semibold text-gray-700">{t('history.stats.maxResponse')}</h4>
                  </div>
                  <p className="text-3xl font-bold text-orange-700">{maxResponseTime}ms</p>
                  <p className="text-xs text-gray-600 mt-1">{t('history.stats.peakTime')}</p>
                </div>
              </div>

              {checks.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('history.chart.title')}</h4>
                  <div className="relative h-40 w-full">
                    <svg className="w-full h-full" viewBox="0 0 600 160" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.4 }} />
                          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const chartData = checks.slice(0, 50).reverse();
                        const points = chartData.map((check, idx) => {
                          const x = (idx / (chartData.length - 1)) * 600;
                          const responseTime = check.response_time || 0;
                          const y = 160 - ((responseTime / maxResponseTime) * 140 + 10);
                          return { x, y, time: responseTime, isUp: check.is_up };
                        });

                        const pathD = points.length > 0
                          ? `M 0,160 L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L 600,160 Z`
                          : '';

                        const lineD = points.length > 0
                          ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
                          : '';

                        return (
                          <>
                            <path d={pathD} fill="url(#areaGradient)" />
                            <path d={lineD} fill="none" stroke="#3b82f6" strokeWidth="2" />
                            {points.map((point, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="4"
                                  fill={point.isUp ? '#10b981' : '#ef4444'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className="hover:r-6 transition-all cursor-pointer"
                                />
                                <title>{point.time}ms</title>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">{t('history.chart.last30')}</p>
                </div>
              )}

              <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('history.checkHistory')}</h4>
              <div className="space-y-3">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    check.is_up
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-0.5 p-2 rounded-full ${
                        check.is_up ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {check.is_up ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-700" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-semibold ${
                            check.is_up ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {check.is_up ? 'UP' : 'DOWN'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(check.checked_at)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              Response: <strong>{check.response_time || 0}ms</strong>
                            </span>
                          </div>
                          {check.status_code && check.status_code > 0 && (
                            <div className="text-gray-700">
                              Status Code: <strong>{check.status_code}</strong>
                            </div>
                          )}
                        </div>

                        {check.error_message && (
                          <div className="mt-2 p-2 bg-red-100 rounded border border-red-300">
                            <p className="text-xs text-red-800 font-medium">{check.error_message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">{t('history.showing')}</p>
        </div>
      </div>
    </div>
  );
}
