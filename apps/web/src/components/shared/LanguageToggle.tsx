import React from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { Languages } from 'lucide-react';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-muted text-sm font-medium transition-colors ${className}`}
      title={locale === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
    >
      <Languages className="w-4 h-4 text-primary" />
      <span>{locale === 'bn' ? 'বাং' : 'EN'}</span>
    </button>
  );
};
