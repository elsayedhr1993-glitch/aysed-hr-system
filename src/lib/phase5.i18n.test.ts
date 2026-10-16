import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ar } from '../locales/ar';
import { en } from '../locales/en';
import { DICTIONARY, ODOO_LANGUAGES, translationGaps } from './i18n';
import { formatIsoDate, formatKwdUi, formatPeriodLabel, monthName, toWesternDigits } from './localeFormat';
import { mainSurfaceContract } from './uiDirection';
import { accountLanguageFields, preferredLanguage, readAccountLanguage, rememberSessionLanguage, clearSessionLanguage } from './userLanguage';
import { launcherTileById } from '../config/launcherTiles';

const SURFACES = [
  'src/apps/EmployeesApp.tsx',
  'src/components/Attendances.tsx',
  'src/components/OdooTimeOffApp.tsx',
  'src/components/OdooPayrollApp.tsx',
  'src/components/OdooPublicHolidaysApp.tsx',
  'src/components/OdooOperationsApp.tsx',
  'src/components/OdooContractsApp.tsx',
  'src/apps/DocumentsApp.tsx',
  'src/apps/AuditLogsApp.tsx',
  'src/components/OdooSettingsFull.tsx',
  'src/apps/ScannerApp.tsx',
  'src/apps/EOSApp.tsx',
];

describe('phase 5 bilingual shell', () => {
  it('gives every shipped key an Arabic and English value', () => {
    expect(translationGaps(ar, en)).toEqual([]);
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
  });

  it('uses the shared glossary on launcher tiles', () => {
    const pairs: Array<[string, string, string]> = [
      ['EMPLOYEES', 'الموظفون', 'Employees'],
      ['LEAVES', 'الإجازات', 'Time Off'],
      ['PAYROLL', 'الرواتب وحماية الأجور', 'Payroll & WPS'],
      ['REPORTS', 'التقارير', 'Reports'],
      ['DOCUMENTS', 'المستندات', 'Documents'],
      ['SCANNER_APP', 'الماسح الذكي', 'Smart Scanner'],
      ['CUSTODY_LOANS', 'العهد', 'Assets'],
      ['AUDIT_LOGS', 'سجل الرقابة', 'Audit Log'],
    ];
    for (const [id, titleAr, titleEn] of pairs) {
      const tile = launcherTileById(id);
      expect(tile?.titleAr).toBe(titleAr);
      expect(tile?.titleEn).toBe(titleEn);
      expect(DICTIONARY[id === 'EMPLOYEES' ? 'employees' : id === 'LEAVES' ? 'leaves' : id === 'PAYROLL' ? 'payroll' : id === 'REPORTS' ? 'reports' : id === 'DOCUMENTS' ? 'documents' : id === 'SCANNER_APP' ? 'scanner' : id === 'CUSTODY_LOANS' ? 'assets' : 'audit_log']).toEqual({ ar: titleAr, en: titleEn });
    }
  });

  it('keeps the same shell classes when the language changes and keeps official documents Arabic', () => {
    const arabic = mainSurfaceContract('ar');
    const english = mainSurfaceContract('en');
    expect(arabic.classes).toBe(english.classes);
    expect(arabic.dir).toBe('rtl');
    expect(english.dir).toBe('ltr');
    expect(arabic.officialDir).toBe('rtl');
    expect(english.officialDir).toBe('rtl');
    expect(arabic.officialLang).toBe('ar');
    expect(english.officialLang).toBe('ar');
    for (const file of SURFACES) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).toContain('data-ui-surface');
      expect(source).toContain('dir={dir}');
    }
    const css = fs.readFileSync('src/index.css', 'utf8');
    expect(css).toContain('html[dir=\'rtl\'] .directional-icon');
    expect(css).toContain('.official-ar-document');
    expect(css).not.toContain('html[dir=\'ltr\'] .justify-end');
  });

  it('does not retarget official payslip or clearance wording', () => {
    const payslip = fs.readFileSync('src/components/payroll/OfficialPayslipPrintModal.tsx', 'utf8');
    expect(payslip).toContain('قسيمة راتب شهرية (Payslip)');
    expect(payslip).toContain('dir="rtl"');
    expect(payslip).not.toContain('useLang');
    const clearance = fs.readFileSync('src/components/LeaveClearanceDocument.tsx', 'utf8');
    expect(clearance).toContain("const lang = 'ar'");
    expect(clearance).toContain('سند تصفية مستحقات وبدل الإجازات');
  });

  it('formats western digits, KWD, ISO dates, and month names', () => {
    expect(toWesternDigits('١٢٣')).toBe('123');
    expect(formatKwdUi(1250)).toBe('1,250.000 KWD');
    expect(formatKwdUi(0)).toBe('0.000 KWD');
    expect(formatIsoDate('2026-10-16')).toBe('2026-10-16');
    expect(formatIsoDate(new Date(2026, 9, 16))).toBe('2026-10-16');
    expect(monthName(0, 'en')).toBe('January');
    expect(monthName(0, 'ar')).not.toMatch(/[0-9٠-٩]/);
    expect(monthName(0, 'ar')).not.toBe(monthName(0, 'en'));
    expect(formatPeriodLabel('2026-10', 'en')).toContain('2026-10');
    expect(formatPeriodLabel('not-a-period', 'ar')).toBe('not-a-period');
    expect(ODOO_LANGUAGES.every((item) => item.dateFormat === 'YYYY-MM-DD')).toBe(true);
  });

  it('reads language from the account fields and keeps a session choice', () => {
    expect(readAccountLanguage({ uiLanguage: 'en' })).toBe('en');
    expect(readAccountLanguage({ res_lang_code: 'ar_001' })).toBe('ar');
    expect(readAccountLanguage({ lang: 'en_US' })).toBe('en');
    expect(accountLanguageFields('ar')).toMatchObject({
      uiLanguage: 'ar',
      res_lang_code: 'ar_001',
      res_lang_direction: 'rtl',
    });
    clearSessionLanguage();
    rememberSessionLanguage('user-1', 'en');
    expect(preferredLanguage('user-1', 'ar')).toBe('en');
    expect(preferredLanguage('user-2', 'ar')).toBe('ar');
    clearSessionLanguage();
  });
});
