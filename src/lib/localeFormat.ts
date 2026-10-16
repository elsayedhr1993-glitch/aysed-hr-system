import type { UiLanguage } from './userLanguage';

const WESTERN = 'en-US';

export function toWesternDigits(value: string): string {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const extended = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/[٠-٩۰-۹]/g, (ch) => {
    const arabicIndex = arabicIndic.indexOf(ch);
    if (arabicIndex >= 0) return String(arabicIndex);
    const extendedIndex = extended.indexOf(ch);
    return extendedIndex >= 0 ? String(extendedIndex) : ch;
  });
}

export function formatWesternNumber(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return formatWesternNumber(0, fractionDigits);
  return toWesternDigits(value.toLocaleString(WESTERN, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }));
}

/** Interface money. Official documents keep their own Arabic currency wording. */
export function formatKwdUi(amount: number | null | undefined): string {
  const numeric = Number(amount);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  const formatted = safe.toLocaleString(WESTERN, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  return `${toWesternDigits(formatted)} KWD`;
}

export function formatKwdUiOrDash(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  return formatKwdUi(value);
}

export function formatIsoDate(value: Date | string | number | null | undefined): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthName(monthIndex: number, lang: UiLanguage): string {
  const safeIndex = ((monthIndex % 12) + 12) % 12;
  const date = new Date(Date.UTC(2026, safeIndex, 1));
  const label = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', {
    month: 'long',
    timeZone: 'UTC',
    numberingSystem: 'latn',
  }).format(date);
  return toWesternDigits(label);
}

/** Shows YYYY-MM plus the month name. Unrecognised values are returned unchanged. */
export function formatPeriodLabel(period: string, lang: UiLanguage): string {
  const match = /^(\d{4})-(\d{2})$/.exec(String(period || '').trim());
  if (!match) return String(period || '');
  const index = Number(match[2]) - 1;
  if (index < 0 || index > 11) return String(period);
  return `${match[1]}-${match[2]} · ${monthName(index, lang)}`;
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}
