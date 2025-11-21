import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'vi';

interface Translations {
  [key: string]: {
    en: string;
    vi: string;
  };
}

const translations: Translations = {
  'app.title': {
    en: 'Uptime Monitor',
    vi: 'Giám Sát Hoạt Động',
  },
  'app.subtitle': {
    en: 'Track the availability and performance of your services',
    vi: 'Theo dõi tính khả dụng và hiệu suất của các dịch vụ',
  },
  'nav.dashboard': {
    en: 'Dashboard',
    vi: 'Tổng Quan',
  },
  'nav.settings': {
    en: 'Settings',
    vi: 'Cài Đặt',
  },
  'nav.logout': {
    en: 'Logout',
    vi: 'Đăng Xuất',
  },
  'nav.login': {
    en: 'Login',
    vi: 'Đăng Nhập',
  },
  'dashboard.stats.totalMonitors': {
    en: 'Total Monitors',
    vi: 'Tổng Monitor',
  },
  'dashboard.stats.activeMonitors': {
    en: 'Active Monitors',
    vi: 'Monitor Hoạt Động',
  },
  'dashboard.stats.avgUptime': {
    en: 'Avg Uptime',
    vi: 'Uptime Trung Bình',
  },
  'dashboard.stats.avgResponse': {
    en: 'Avg Response',
    vi: 'Phản Hồi TB',
  },
  'dashboard.addMonitor': {
    en: 'Add New Monitor',
    vi: 'Thêm Monitor Mới',
  },
  'dashboard.noMonitors': {
    en: 'No monitors yet',
    vi: 'Chưa có monitor nào',
  },
  'dashboard.getStarted': {
    en: 'Get started by adding your first monitor',
    vi: 'Bắt đầu bằng cách thêm monitor đầu tiên',
  },
  'monitor.status.up': {
    en: 'Up',
    vi: 'Hoạt Động',
  },
  'monitor.status.down': {
    en: 'Down',
    vi: 'Ngừng',
  },
  'monitor.uptime': {
    en: 'Uptime',
    vi: 'Uptime',
  },
  'monitor.response': {
    en: 'Response',
    vi: 'Phản Hồi',
  },
  'monitor.statusCode': {
    en: 'Status Code',
    vi: 'Mã Trạng Thái',
  },
  'monitor.viewHistory': {
    en: 'View history',
    vi: 'Xem lịch sử',
  },
  'monitor.checkNow': {
    en: 'Check now',
    vi: 'Kiểm tra ngay',
  },
  'monitor.delete': {
    en: 'Delete monitor',
    vi: 'Xóa monitor',
  },
  'monitor.deleteConfirm': {
    en: 'Delete monitor',
    vi: 'Xóa monitor',
  },
  'form.name': {
    en: 'Monitor Name',
    vi: 'Tên Monitor',
  },
  'form.url': {
    en: 'URL to Monitor',
    vi: 'URL Cần Giám Sát',
  },
  'form.interval': {
    en: 'Check Interval',
    vi: 'Tần Suất Kiểm Tra',
  },
  'form.interval.1min': {
    en: 'Every 1 minute',
    vi: 'Mỗi 1 phút',
  },
  'form.interval.5min': {
    en: 'Every 5 minutes',
    vi: 'Mỗi 5 phút',
  },
  'form.interval.15min': {
    en: 'Every 15 minutes',
    vi: 'Mỗi 15 phút',
  },
  'form.interval.30min': {
    en: 'Every 30 minutes',
    vi: 'Mỗi 30 phút',
  },
  'form.interval.1hour': {
    en: 'Every 1 hour',
    vi: 'Mỗi 1 giờ',
  },
  'form.add': {
    en: 'Add Monitor',
    vi: 'Thêm Monitor',
  },
  'form.cancel': {
    en: 'Cancel',
    vi: 'Hủy',
  },
  'history.title': {
    en: 'Check History',
    vi: 'Lịch Sử Kiểm Tra',
  },
  'history.filter.all': {
    en: 'All',
    vi: 'Tất Cả',
  },
  'history.filter.up': {
    en: 'Up',
    vi: 'Hoạt Động',
  },
  'history.filter.down': {
    en: 'Down',
    vi: 'Ngừng',
  },
  'history.stats.uptime': {
    en: 'Uptime',
    vi: 'Uptime',
  },
  'history.stats.avgResponse': {
    en: 'Avg Response',
    vi: 'Phản Hồi TB',
  },
  'history.stats.maxResponse': {
    en: 'Max Response',
    vi: 'Phản Hồi Max',
  },
  'history.stats.checks': {
    en: 'checks',
    vi: 'lần kiểm tra',
  },
  'history.stats.averageTime': {
    en: 'Average time',
    vi: 'Thời gian TB',
  },
  'history.stats.peakTime': {
    en: 'Peak time',
    vi: 'Thời gian cao nhất',
  },
  'history.chart.title': {
    en: 'Response Time Chart',
    vi: 'Biểu Đồ Thời Gian Phản Hồi',
  },
  'history.chart.last30': {
    en: 'Last 30 checks (hover for details)',
    vi: '30 lần kiểm tra gần nhất (hover để xem chi tiết)',
  },
  'history.checkHistory': {
    en: 'Check History',
    vi: 'Lịch Sử Kiểm Tra',
  },
  'history.noHistory': {
    en: 'No check history available',
    vi: 'Không có lịch sử kiểm tra',
  },
  'history.showing': {
    en: 'Showing last 50 checks',
    vi: 'Hiển thị 50 lần kiểm tra gần nhất',
  },
  'settings.title': {
    en: 'Settings',
    vi: 'Cài Đặt',
  },
  'settings.language': {
    en: 'Language',
    vi: 'Ngôn Ngữ',
  },
  'settings.language.english': {
    en: 'English',
    vi: 'Tiếng Anh',
  },
  'settings.language.vietnamese': {
    en: 'Vietnamese',
    vi: 'Tiếng Việt',
  },
  'settings.notifications': {
    en: 'Notifications',
    vi: 'Thông Báo',
  },
  'settings.emailNotifications': {
    en: 'Email Notifications',
    vi: 'Thông Báo Email',
  },
  'settings.email': {
    en: 'Email Address',
    vi: 'Địa Chỉ Email',
  },
  'settings.telegram': {
    en: 'Telegram Notifications',
    vi: 'Thông Báo Telegram',
  },
  'settings.telegramChatId': {
    en: 'Telegram Chat ID',
    vi: 'Telegram Chat ID',
  },
  'settings.telegramBotToken': {
    en: 'Telegram Bot Token',
    vi: 'Telegram Bot Token',
  },
  'settings.save': {
    en: 'Save Settings',
    vi: 'Lưu Cài Đặt',
  },
  'settings.saved': {
    en: 'Settings saved successfully!',
    vi: 'Đã lưu cài đặt thành công!',
  },
  'settings.error': {
    en: 'Failed to save settings',
    vi: 'Lưu cài đặt thất bại',
  },
  'settings.profile': {
    en: 'Profile Information',
    vi: 'Thông Tin Cá Nhân',
  },
  'settings.notificationPreferences': {
    en: 'Notification Preferences',
    vi: 'Tùy Chọn Thông Báo',
  },
  'settings.emailNotificationsDesc': {
    en: 'Receive email updates about your monitors',
    vi: 'Nhận thông báo email về các monitor của bạn',
  },
  'settings.downAlerts': {
    en: 'Down Alerts',
    vi: 'Cảnh Báo Ngừng Hoạt Động',
  },
  'settings.downAlertsDesc': {
    en: 'Get notified immediately when a monitor goes down',
    vi: 'Nhận thông báo ngay khi monitor ngừng hoạt động',
  },
  'settings.weeklyReports': {
    en: 'Weekly Uptime Reports',
    vi: 'Báo Cáo Uptime Hàng Tuần',
  },
  'settings.weeklyReportsDesc': {
    en: "Receive weekly summaries of your monitors' performance",
    vi: 'Nhận tổng hợp hiệu suất monitor hàng tuần',
  },
  'settings.enableTelegram': {
    en: 'Enable Telegram',
    vi: 'Bật Telegram',
  },
  'settings.telegramDesc': {
    en: 'Send notifications to your Telegram account',
    vi: 'Gửi thông báo đến tài khoản Telegram của bạn',
  },
  'settings.telegramBotTokenPlaceholder': {
    en: 'Enter your Telegram Bot Token',
    vi: 'Nhập Telegram Bot Token của bạn',
  },
  'settings.telegramBotTokenHelp': {
    en: 'Create a bot and get your token from',
    vi: 'Tạo bot và lấy token từ',
  },
  'settings.telegramChatIdPlaceholder': {
    en: 'Enter your Telegram Chat ID',
    vi: 'Nhập Telegram Chat ID của bạn',
  },
  'settings.telegramChatIdHelp': {
    en: 'To get your Chat ID, message',
    vi: 'Để lấy Chat ID, nhắn tin cho',
  },
  'settings.emailLabel': {
    en: 'Email',
    vi: 'Email',
  },
  'settings.emailCannotChange': {
    en: 'Email cannot be changed',
    vi: 'Email không thể thay đổi',
  },
  'settings.userId': {
    en: 'User ID',
    vi: 'ID Người Dùng',
  },
  'settings.accountCreated': {
    en: 'Account Created',
    vi: 'Tài Khoản Đã Tạo',
  },
  'settings.telegramFieldsRequired': {
    en: 'Please enter both Telegram Bot Token and Chat ID to enable Telegram notifications',
    vi: 'Vui lòng nhập cả Telegram Bot Token và Chat ID để bật thông báo Telegram',
  },
  'auth.login': {
    en: 'Login',
    vi: 'Đăng Nhập',
  },
  'auth.signup': {
    en: 'Sign Up',
    vi: 'Đăng Ký',
  },
  'auth.email': {
    en: 'Email',
    vi: 'Email',
  },
  'auth.password': {
    en: 'Password',
    vi: 'Mật Khẩu',
  },
  'auth.dontHaveAccount': {
    en: "Don't have an account?",
    vi: 'Chưa có tài khoản?',
  },
  'auth.alreadyHaveAccount': {
    en: 'Already have an account?',
    vi: 'Đã có tài khoản?',
  },
  'landing.hero.title': {
    en: 'Monitor Your Website Uptime',
    vi: 'Giám Sát Hoạt Động Website',
  },
  'landing.hero.subtitle': {
    en: 'Stay Alert, Stay Online',
    vi: 'Luôn Cảnh Giác, Luôn Trực Tuyến',
  },
  'landing.hero.description': {
    en: "Keep track of your website's availability with real-time monitoring, instant notifications, and comprehensive analytics.",
    vi: 'Theo dõi tính khả dụng của website với giám sát thời gian thực, thông báo tức thì và phân tích toàn diện.',
  },
  'landing.hero.cta': {
    en: 'Get Started Free',
    vi: 'Bắt Đầu Miễn Phí',
  },
  'landing.features.monitoring.title': {
    en: 'Real-time Monitoring',
    vi: 'Giám Sát Thời Gian Thực',
  },
  'landing.features.monitoring.desc': {
    en: 'Check your websites every minute and get instant status updates.',
    vi: 'Kiểm tra website mỗi phút và nhận cập nhật trạng thái ngay lập tức.',
  },
  'landing.features.notifications.title': {
    en: 'Instant Notifications',
    vi: 'Thông Báo Tức Thì',
  },
  'landing.features.notifications.desc': {
    en: 'Get notified via Telegram when your site goes down or comes back up.',
    vi: 'Nhận thông báo qua Telegram khi website của bạn ngừng hoạt động hoặc hoạt động trở lại.',
  },
  'landing.features.analytics.title': {
    en: 'Uptime Analytics',
    vi: 'Phân Tích Uptime',
  },
  'landing.features.analytics.desc': {
    en: 'View detailed uptime statistics and performance metrics over time.',
    vi: 'Xem thống kê uptime chi tiết và các chỉ số hiệu suất theo thời gian.',
  },
  'landing.features.security.title': {
    en: 'Secure & Reliable',
    vi: 'An Toàn & Đáng Tin Cậy',
  },
  'landing.features.security.desc': {
    en: 'Your data is encrypted and stored securely with enterprise-grade security.',
    vi: 'Dữ liệu của bạn được mã hóa và lưu trữ an toàn với bảo mật cấp doanh nghiệp.',
  },
  'landing.cta.title': {
    en: 'Ready to Monitor Your Websites?',
    vi: 'Sẵn Sàng Giám Sát Website Của Bạn?',
  },
  'landing.cta.description': {
    en: 'Sign up now and start monitoring your websites in minutes.',
    vi: 'Đăng ký ngay và bắt đầu giám sát website của bạn trong vài phút.',
  },
  'landing.cta.button': {
    en: 'Create Free Account',
    vi: 'Tạo Tài Khoản Miễn Phí',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
