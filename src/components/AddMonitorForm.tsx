import { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AddMonitorFormProps {
  onMonitorAdded: () => void;
}

export function AddMonitorForm({ onMonitorAdded }: AddMonitorFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [checkInterval, setCheckInterval] = useState('300');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be signed in to add monitors');
      return;
    }

    setIsLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('monitors')
        .insert({
          name,
          url,
          check_interval: parseInt(checkInterval),
          is_active: true,
          user_id: user.id,
        });

      if (insertError) throw insertError;

      setName('');
      setUrl('');
      setCheckInterval('300');
      setIsOpen(false);
      onMonitorAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add monitor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={!user}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={!user ? 'Sign in to add monitors' : 'Add monitor'}
      >
        <Plus className="w-5 h-5" />
        {t('dashboard.addMonitor')}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.addMonitor')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.name')}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Website"
            required
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.url')}
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.interval')}
          </label>
          <select
            id="interval"
            value={checkInterval}
            onChange={(e) => setCheckInterval(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="60">{t('form.interval.1min')}</option>
            <option value="300">{t('form.interval.5min')}</option>
            <option value="900">{t('form.interval.15min')}</option>
            <option value="1800">{t('form.interval.30min')}</option>
            <option value="3600">{t('form.interval.1hour')}</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Adding...' : t('form.add')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('form.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
