import { useState, useEffect } from 'react';
import { X, User, Bell, Save, Bug, Lightbulb, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'feedback'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [isPingingTelegram, setIsPingingTelegram] = useState(false);
  const [pingMessage, setPingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature'>('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [captchaNum1] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaNum2] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setTelegramNotifications(settings.telegram_notifications);
      setTelegramChatId(settings.telegram_chat_id || '');
      setTelegramBotToken(settings.telegram_bot_token || '');
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await updateSettings({
        telegram_notifications: telegramNotifications,
        telegram_chat_id: telegramChatId || null,
        telegram_bot_token: telegramBotToken || null,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: t('settings.saved') });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : t('settings.error') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-4 h-4" />
                {t('settings.notifications')}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'feedback'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bug className="w-4 h-4" />
                Feedback
              </button>
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.profile')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.emailLabel')}
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('settings.emailCannotChange')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.userId')}
                      </label>
                      <input
                        type="text"
                        value={user?.id || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.accountCreated')}
                      </label>
                      <input
                        type="text"
                        value={
                          user?.created_at
                            ? new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : ''
                        }
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('settings.notificationPreferences')}
                  </h3>

                  {message && (
                    <div
                      className={`mb-4 p-4 rounded-lg ${
                        message.type === 'success'
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">{t('settings.telegram')}</h4>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                      <div>
                        <p className="font-medium text-gray-900">{t('settings.enableTelegram')}</p>
                        <p className="text-sm text-gray-600">
                          {t('settings.telegramDesc')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={telegramNotifications}
                          onChange={(e) => {
                            if (e.target.checked && (!telegramBotToken.trim() || !telegramChatId.trim())) {
                              setMessage({ type: 'error', text: t('settings.telegramFieldsRequired') });
                              return;
                            }
                            setTelegramNotifications(e.target.checked);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.telegramBotToken')}
                      </label>
                      <input
                        type="password"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder={t('settings.telegramBotTokenPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        {t('settings.telegramBotTokenHelp')}{' '}
                        <a
                          href="https://t.me/BotFather"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          @BotFather
                        </a>
                        {' '}on Telegram
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.telegramChatId')}
                      </label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder={t('settings.telegramChatIdPlaceholder')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        {t('settings.telegramChatIdHelp')}{' '}
                        <a
                          href="https://t.me/userinfobot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          @userinfobot
                        </a>
                        {' '}on Telegram
                      </p>
                    </div>
                  </div>

                  {pingMessage && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        pingMessage.type === 'success'
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      {pingMessage.text}
                    </div>
                  )}

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={async () => {
                        setIsPingingTelegram(true);
                        setPingMessage(null);

                        if (!telegramBotToken.trim() || !telegramChatId.trim()) {
                          setPingMessage({ type: 'error', text: 'Vui lòng nhập cả Bot Token và Chat ID' });
                          setIsPingingTelegram(false);
                          return;
                        }

                        try {
                          const response = await fetch(
                            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                chat_id: telegramChatId,
                                text: '🔔 Test notification từ Uptime Monitor!\n\nTelegram đã được cấu hình thành công.',
                              }),
                            }
                          );

                          const result = await response.json();

                          if (result.ok) {
                            setPingMessage({ type: 'success', text: 'Đã gửi tin nhắn test thành công! Kiểm tra Telegram của bạn.' });
                          } else {
                            setPingMessage({ type: 'error', text: `Lỗi: ${result.description || 'Không thể gửi tin nhắn'}` });
                          }
                        } catch (error) {
                          setPingMessage({ type: 'error', text: 'Không thể kết nối với Telegram. Vui lòng kiểm tra Bot Token.' });
                        } finally {
                          setIsPingingTelegram(false);
                        }
                      }}
                      disabled={isPingingTelegram || !telegramBotToken.trim() || !telegramChatId.trim()}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {isPingingTelegram ? 'Đang gửi...' : 'Test Telegram'}
                    </button>
                    <button
                      onClick={handleSaveNotifications}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : t('settings.save')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Báo Bug & Đề Xuất Tính Năng</h3>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Lightbulb className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Chúng tôi luôn muốn cải thiện sản phẩm! Vui lòng điền form bên dưới để gửi phản hồi.
                        </p>
                      </div>
                    </div>
                  </div>

                  {feedbackMessage && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      feedbackMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      {feedbackMessage.text}
                    </div>
                  )}

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmittingFeedback(true);
                    setFeedbackMessage(null);

                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) {
                        setFeedbackMessage({ type: 'error', text: 'Vui lòng đăng nhập để gửi phản hồi' });
                        return;
                      }

                      const browserInfo = `${navigator.userAgent} - ${window.screen.width}x${window.screen.height}`;

                      const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-feedback`,
                        {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            type: feedbackType,
                            subject: feedbackSubject,
                            description: feedbackDescription,
                            browserInfo,
                            captchaAnswer: parseInt(captchaAnswer),
                            captchaQuestion: `${captchaNum1} + ${captchaNum2}`,
                          }),
                        }
                      );

                      const result = await response.json();

                      if (response.ok) {
                        setFeedbackMessage({ type: 'success', text: result.message });
                        setFeedbackSubject('');
                        setFeedbackDescription('');
                        setCaptchaAnswer('');
                      } else {
                        setFeedbackMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra' });
                      }
                    } catch (error) {
                      console.error('Error submitting feedback:', error);
                      setFeedbackMessage({ type: 'error', text: 'Không thể gửi phản hồi. Vui lòng thử lại.' });
                    } finally {
                      setIsSubmittingFeedback(false);
                    }
                  }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại Phản Hồi
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFeedbackType('bug')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            feedbackType === 'bug'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Bug className="w-5 h-5" />
                          <span className="font-medium">Báo Lỗi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedbackType('feature')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            feedbackType === 'feature'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Lightbulb className="w-5 h-5" />
                          <span className="font-medium">Đề Xuất Tính Năng</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu Đề <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={feedbackSubject}
                        onChange={(e) => setFeedbackSubject(e.target.value)}
                        placeholder={feedbackType === 'bug' ? 'Ví dụ: Lỗi không thể thêm monitor mới' : 'Ví dụ: Thêm chức năng export báo cáo'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô Tả Chi Tiết <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={feedbackDescription}
                        onChange={(e) => setFeedbackDescription(e.target.value)}
                        rows={6}
                        placeholder={feedbackType === 'bug'
                          ? 'Mô tả chi tiết lỗi:\n- Các bước để tái hiện lỗi\n- Kết quả mong đợi\n- Kết quả thực tế\n- Screenshot (nếu có)'
                          : 'Mô tả chi tiết tính năng:\n- Vấn đề cần giải quyết\n- Cách thức hoạt động\n- Lợi ích mang lại'
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác Thực (Chống Spam) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-600">{captchaNum1}</span>
                          <span className="text-xl text-gray-600">+</span>
                          <span className="text-2xl font-bold text-blue-600">{captchaNum2}</span>
                          <span className="text-xl text-gray-600">=</span>
                        </div>
                        <input
                          type="number"
                          required
                          value={captchaAnswer}
                          onChange={(e) => setCaptchaAnswer(e.target.value)}
                          placeholder="?"
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Vui lòng giải phép tính để xác nhận bạn không phải robot</p>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmittingFeedback}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <Send className="w-5 h-5" />
                        {isSubmittingFeedback ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-blue-900 mb-2">Kênh hỗ trợ khác:</h5>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>Email: <a href="mailto:support@uptimemonitor.com" className="underline hover:text-blue-600">support@uptimemonitor.com</a></p>
                      <p>Telegram: <a href="https://t.me/uptimemonitor" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">@uptimemonitor</a></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
