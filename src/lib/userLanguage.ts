export type UiLanguage = 'ar' | 'en';

export function normalizeUiLanguage(value: unknown): UiLanguage | null {
  const raw = String(value ?? '').trim().toLowerCase().replace('-', '_');
  if (raw === 'en' || raw === 'en_us' || raw === 'english') return 'en';
  if (raw === 'ar' || raw === 'ar_001' || raw === 'arabic') return 'ar';
  return null;
}

export function readAccountLanguage(data: Record<string, unknown> | null | undefined): UiLanguage | null {
  if (!data) return null;
  return normalizeUiLanguage(data.uiLanguage ?? data.res_lang_code ?? data.lang);
}

export function accountLanguageFields(lang: UiLanguage): {
  uiLanguage: UiLanguage;
  lang: 'ar_001' | 'en_US';
  res_lang_code: 'ar_001' | 'en_US';
  res_lang_direction: 'rtl' | 'ltr';
} {
  const code = lang === 'ar' ? 'ar_001' : 'en_US';
  return {
    uiLanguage: lang,
    lang: code,
    res_lang_code: code,
    res_lang_direction: lang === 'ar' ? 'rtl' : 'ltr',
  };
}

let sessionUid: string | null = null;
let sessionLang: UiLanguage | null = null;

export function rememberSessionLanguage(uid: string, lang: UiLanguage): void {
  sessionUid = uid;
  sessionLang = lang;
}

export function clearSessionLanguage(): void {
  sessionUid = null;
  sessionLang = null;
}

/** The choice made in this session wins over a stale account snapshot. */
export function preferredLanguage(uid: string, account: UiLanguage | null): UiLanguage | null {
  if (sessionUid === uid && sessionLang) return sessionLang;
  return account;
}
