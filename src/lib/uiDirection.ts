import type { UiLanguage } from './userLanguage';

export const SHELL_LAYOUT_CLASSES = ['flex', 'min-w-0', 'text-start', 'ps-3', 'pe-3'] as const;

export function uiDirection(lang: UiLanguage): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function documentLanguage(lang: UiLanguage): { lang: UiLanguage; dir: 'rtl' | 'ltr' } {
  return { lang, dir: uiDirection(lang) };
}

/** Printed contracts, notices, clearances, and payslips stay Arabic. */
export const OFFICIAL_DOCUMENT_LANGUAGE = { lang: 'ar' as const, dir: 'rtl' as const };

export function mainSurfaceContract(lang: UiLanguage): {
  lang: UiLanguage;
  dir: 'rtl' | 'ltr';
  classes: string;
  officialLang: 'ar';
  officialDir: 'rtl';
} {
  return {
    lang,
    dir: uiDirection(lang),
    classes: SHELL_LAYOUT_CLASSES.join(' '),
    officialLang: OFFICIAL_DOCUMENT_LANGUAGE.lang,
    officialDir: OFFICIAL_DOCUMENT_LANGUAGE.dir,
  };
}
