import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
      <Languages className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
        className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
      >
        <option value="en">🇺🇸 EN</option>
        <option value="vi">🇻🇳 VI</option>
      </select>
    </div>
  );
}
