import React, { createContext, useContext, useEffect, useState } from 'react';
import { ResLang } from '../types';
import { ar as arMessages } from '../locales/ar';
import { en as enMessages } from '../locales/en';
import type { UiLanguage } from './userLanguage';

export const ODOO_LANGUAGES: ResLang[] = [
  {
    id: 'lang_ar_001',
    name: 'العربية (Arabic)',
    code: 'ar_001',
    isoCode: 'ar',
    direction: 'rtl',
    active: true,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    decimalPoint: '.',
    thousandsSep: ',',
    flag: '🇰🇼'
  },
  {
    id: 'lang_en_US',
    name: 'English (US)',
    code: 'en_US',
    isoCode: 'en',
    direction: 'ltr',
    active: true,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    decimalPoint: '.',
    thousandsSep: ',',
    flag: '🇺🇸'
  }
];

function zipMessages(
  arabic: Record<string, string>,
  english: Record<string, string>
): Record<string, { ar: string; en: string }> {
  const keys = new Set([...Object.keys(arabic), ...Object.keys(english)]);
  const dictionary: Record<string, { ar: string; en: string }> = {};
  for (const key of keys) {
    dictionary[key] = { ar: arabic[key] ?? '', en: english[key] ?? '' };
  }
  return dictionary;
}

export const DICTIONARY = zipMessages(arMessages, enMessages);

export type TranslationGap = { key: string; missing: 'ar' | 'en' };

export function translationGaps(
  arabic: Record<string, string> = arMessages,
  english: Record<string, string> = enMessages
): TranslationGap[] {
  const keys = new Set([...Object.keys(arabic), ...Object.keys(english)]);
  const gaps: TranslationGap[] = [];
  for (const key of keys) {
    if (!String(arabic[key] ?? '').trim()) gaps.push({ key, missing: 'ar' });
    if (!String(english[key] ?? '').trim()) gaps.push({ key, missing: 'en' });
  }
  return gaps;
}

export function fillMessage(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}

export function getInitialLang(): UiLanguage {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('aysed_res_lang') || localStorage.getItem('res_lang_code');
    if (saved === 'en_US' || saved === 'en') return 'en';
    if (saved === 'ar_001' || saved === 'ar') return 'ar';
  }
  return 'en';
}

export function applyDocumentLanguage(lang: UiLanguage): void {
  if (typeof document === 'undefined') return;
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = direction;
  document.body.dir = direction;
  document.body.setAttribute('dir', direction);
}

function writeStoredLanguage(lang: UiLanguage): void {
  if (typeof window === 'undefined') return;
  const langCode = lang === 'ar' ? 'ar_001' : 'en_US';
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('aysed_res_lang', lang);
  localStorage.setItem('res_lang_code', langCode);
  localStorage.setItem('res_lang_direction', direction);
}

type PersistLanguage = (lang: UiLanguage) => void;

let persistLanguage: PersistLanguage | null = null;
let suppressPersist = false;
const accountListeners = new Set<(lang: UiLanguage) => void>();

export function registerLanguagePersistence(fn: PersistLanguage): () => void {
  persistLanguage = fn;
  return () => {
    if (persistLanguage === fn) persistLanguage = null;
  };
}

/** Apply the language stored on the user account without writing it back. */
export function applyAccountLanguage(lang: UiLanguage): void {
  suppressPersist = true;
  writeStoredLanguage(lang);
  applyDocumentLanguage(lang);
  accountListeners.forEach((listener) => listener(lang));
  suppressPersist = false;
}

type LanguageContextValue = {
  lang: UiLanguage;
  setLang: (newLang: UiLanguage) => void;
  t: (key: string) => string;
  isRtl: boolean;
  currentLangCode: string;
  languages: ResLang[];
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<UiLanguage>(getInitialLang);

  useEffect(() => {
    const listener = (next: UiLanguage) => setLangState(next);
    accountListeners.add(listener);
    return () => {
      accountListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    applyDocumentLanguage(lang);
  }, [lang]);

  const applyLang = (newLang: UiLanguage) => {
    setLangState(newLang);
    writeStoredLanguage(newLang);
    applyDocumentLanguage(newLang);
    if (!suppressPersist) persistLanguage?.(newLang);
  };

  const t = (key: string): string => {
    return DICTIONARY[key] ? (lang === 'ar' ? DICTIONARY[key].ar : DICTIONARY[key].en) : key;
  };

  const value = {
    lang,
    setLang: applyLang,
    t,
    isRtl: lang === 'ar',
    currentLangCode: lang === 'ar' ? 'ar_001' : 'en_US',
    languages: ODOO_LANGUAGES
  };

  return React.createElement(LanguageContext.Provider, { value }, children);
};

export function useLang(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used inside LanguageProvider');
  return context;
}
