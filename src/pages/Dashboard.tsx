import { useState } from 'react';
import { Activity, RefreshCw, Trash2, History } from 'lucide-react';
import { MonitorCard } from '../components/MonitorCard';
import { AddMonitorForm } from '../components/AddMonitorForm';
import { Settings } from '../components/Settings';
import { UserMenu } from '../components/UserMenu';
import { DashboardStats } from '../components/DashboardStats';
import { MonitorHistory } from '../components/MonitorHistory';
import { LanguageSelector } from '../components/LanguageSelector';
import { Footer } from '../components/Footer';
import { useMonitors } from '../hooks/useMonitors';
import { useLanguage } from '../contexts/LanguageContext';

export function Dashboard() {
  const { monitors, isLoading, error, refetch, checkMonitor, deleteMonitor } = useMonitors();
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [historyMonitorId, setHistoryMonitorId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{t('app.title')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <UserMenu onSettingsClick={() => setIsSettingsOpen(true)} />
            </div>
          </div>
          <p className="text-gray-600">{t('app.subtitle')}</p>
        </div>

        <div className="mb-6">
          <AddMonitorForm onMonitorAdded={refetch} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!isLoading && monitors.length > 0 && <DashboardStats monitors={monitors} />}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : monitors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No monitors yet</h3>
            <p className="text-gray-600">Add your first monitor to start tracking uptime</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monitors.map(({ monitor, latestCheck, uptimePercentage }) => (
              <div key={monitor.id} className="relative group">
                <MonitorCard
                  monitor={monitor}
                  latestCheck={latestCheck}
                  uptimePercentage={uptimePercentage}
                />
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setHistoryMonitorId(monitor.id)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                    title="View history"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => checkMonitor(monitor.id)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    title="Check now"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`${t('monitor.deleteConfirm')} "${monitor.name}"?`)) {
                        deleteMonitor(monitor.id);
                      }
                    }}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    title="Delete monitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {historyMonitorId && (
        <MonitorHistory
          monitorId={historyMonitorId}
          monitorName={monitors.find(m => m.monitor.id === historyMonitorId)?.monitor.name || ''}
          onClose={() => setHistoryMonitorId(null)}
        />
      )}

      <Footer />
    </div>
  );
}
