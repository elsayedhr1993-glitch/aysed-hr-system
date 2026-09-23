import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import { SystemSettings, defaultSettings } from '../context/SystemSettingsContext';
import type { Company } from '../types';

export const COMPANY_SETTINGS_CACHE_PREFIX = 'aysed_odoo_general_settings_';

const SENSITIVE_KEYS: (keyof SystemSettings)[] = ['geminiApiKey', 'smtpPass'];

/** Leave accrual fields are owned by `leave_policy` in system_config — not company_settings. */
export const LEAVE_POLICY_SETTING_KEYS: (keyof SystemSettings)[] = [
  'monthlyAccrualRate',
  'unpaidLeaveFreezesAccrual',
  'unpaidLeaveExcludesService',
  'maxCarryoverDays',
  'enableAdvanceLeaveSalary',
];

export function settingsCacheKey(companyId: string): string {
  return `${COMPANY_SETTINGS_CACHE_PREFIX}${companyId}`;
}

export function readSettingsCache(companyId: string): Partial<SystemSettings> | null {
  try {
    const raw = localStorage.getItem(settingsCacheKey(companyId));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SystemSettings>;
  } catch {
    return null;
  }
}

export function writeSettingsCache(companyId: string, settings: SystemSettings): void {
  try {
    localStorage.setItem(settingsCacheKey(companyId), JSON.stringify(settings));
  } catch (e) {
    console.warn('company settings cache write failed', e);
  }
}

export function buildSettingsFromCompanyProfile(company?: Partial<Company> | null): SystemSettings {
  return {
    ...defaultSettings,
    companyNameAr: company?.nameAr || defaultSettings.companyNameAr,
    companyNameEn: company?.nameEn || defaultSettings.companyNameEn,
    crNumber: company?.crNumber || company?.commercialRegNo || defaultSettings.crNumber,
    mohLicense: company?.mohLicense || defaultSettings.mohLicense,
    civilIdCompany: company?.civilIdCompany || defaultSettings.civilIdCompany,
    pifssNumber: company?.pifssNumber || defaultSettings.pifssNumber,
    bankName: company?.bankName || defaultSettings.bankName,
    iban: company?.iban || defaultSettings.iban,
    wpsCorporateId: company?.wsiCode || defaultSettings.wpsCorporateId,
  };
}

function stripForFirestore(settings: SystemSettings): Record<string, unknown> {
  const payload = { ...settings } as Record<string, unknown>;
  for (const key of SENSITIVE_KEYS) {
    payload[key] = '';
  }
  for (const key of LEAVE_POLICY_SETTING_KEYS) {
    delete payload[key];
  }
  return payload;
}

export async function loadCompanySettings(
  companyId: string,
  company?: Partial<Company> | null
): Promise<SystemSettings> {
  const profileBase = buildSettingsFromCompanyProfile(company);
  if (!companyId || companyId === 'default_settings') {
    const cached = readSettingsCache(companyId);
    return { ...profileBase, ...defaultSettings, ...(cached || {}) };
  }

  try {
    const snap = await getDoc(doc(db, 'company_settings', companyId));
    if (snap.exists()) {
      const data = snap.data();
      const remotePartial =
        (data.settings as Partial<SystemSettings> | undefined) ||
        (data as Partial<SystemSettings>);
      const merged = { ...defaultSettings, ...profileBase, ...remotePartial };
      writeSettingsCache(companyId, merged);
      return merged;
    }
  } catch (error) {
    console.error('loadCompanySettings Firestore failed', error);
  }

  const cached = readSettingsCache(companyId);
  if (cached) {
    const merged = { ...profileBase, ...defaultSettings, ...cached };
    void saveCompanySettings(companyId, merged).catch((e) =>
      console.warn('background migrate company_settings failed', e)
    );
    return merged;
  }

  return profileBase;
}

export async function saveCompanySettings(
  companyId: string,
  settings: SystemSettings,
  meta?: { updatedBy?: string }
): Promise<void> {
  if (!companyId || companyId === 'default_settings') {
    writeSettingsCache(companyId, settings);
    return;
  }

  const settingsPayload = stripForFirestore(settings);
  await setDoc(
    doc(db, 'company_settings', companyId),
    cleanFirestoreData({
      companyId,
      settings: settingsPayload,
      updatedAt: new Date().toISOString(),
      updatedBy: meta?.updatedBy || 'company_admin',
    }),
    { merge: true }
  );

  writeSettingsCache(companyId, settings);
}
