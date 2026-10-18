import React, { createContext, useContext, useState, useEffect } from 'react';
import bnTranslations from './bn.json';
import enTranslations from './en.json';

export type SupportedLocale = 'bn' | 'en';

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (path: string, fallback?: string) => string;
  isBangla: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

const dictionaries = {
  bn: bnTranslations,
  en: enTranslations
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const saved = localStorage.getItem('ngo_locale');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn'; // Default Bangla
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('ngo_locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = dictionaries[locale];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary if missing in current locale
        let fallbackVal: any = dictionaries.en;
        for (const fbKey of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fbKey in fallbackVal) {
            fallbackVal = fallbackVal[fbKey];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackVal === 'string' ? fallbackVal : fallback || path;
      }
    }

    return typeof current === 'string' ? current : fallback || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isBangla: locale === 'bn' }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
