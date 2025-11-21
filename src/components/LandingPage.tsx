import { Activity, Shield, Bell, TrendingUp, LogIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t('nav.login')}
            </button>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            {t('landing.hero.title')}
            <br />
            <span className="text-blue-600">{t('landing.hero.subtitle')}</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('landing.hero.description')}
          </p>
          <button
            onClick={onLoginClick}
            className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {t('landing.hero.cta')}
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('landing.features.monitoring.title')}</h3>
            <p className="text-gray-600">{t('landing.features.monitoring.desc')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('landing.features.notifications.title')}</h3>
            <p className="text-gray-600">{t('landing.features.notifications.desc')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('landing.features.analytics.title')}</h3>
            <p className="text-gray-600">{t('landing.features.analytics.desc')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('landing.features.security.title')}</h3>
            <p className="text-gray-600">{t('landing.features.security.desc')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {t('landing.cta.title')}
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            {t('landing.cta.description')}
          </p>
          <button
            onClick={onLoginClick}
            className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {t('landing.cta.button')}
          </button>
        </div>
      </div>
    </div>
  );
}
