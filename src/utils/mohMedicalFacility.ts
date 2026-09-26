import type { Company } from '../types';
import type { CompanyPrintProfile } from './companyPrintProfile';

export type CompanyRegulatoryRegime = 'MOH_MEDICAL' | 'MOCI_COMMERCIAL';

/** Kuwait private clinics in this product default to MOH — not MOCI commercial registry. */
export function getCompanyRegulatoryRegime(company?: Company | null): CompanyRegulatoryRegime {
  const raw = String((company as { regulatoryRegime?: string })?.regulatoryRegime || '').trim();
  if (raw === 'MOCI_COMMERCIAL') return 'MOCI_COMMERCIAL';
  return 'MOH_MEDICAL';
}

export function usesCommercialRegistration(company?: Company | null): boolean {
  return getCompanyRegulatoryRegime(company) === 'MOCI_COMMERCIAL';
}

export function isMohMedicalEstablishment(company?: Company | null): boolean {
  return !usesCommercialRegistration(company);
}

/** Lines for letterheads / contracts (employer party) — MOH license + PACI/civil ID; no CR unless MOCI. */
export function employerRegistryMetaParts(
  profile: CompanyPrintProfile,
  company?: Company | null
): string[] {
  const parts: string[] = [];

  if (profile.mohLicense && profile.mohLicense !== '—') {
    parts.push(`ترخيص وزارة الصحة: ${profile.mohLicense}`);
  }

  const paci = profile.paciNumber && profile.paciNumber !== '—' ? profile.paciNumber : '';
  const civil = profile.civilIdCompany && profile.civilIdCompany !== '—' ? profile.civilIdCompany : '';
  if (paci) {
    parts.push(`الرقم الآلي (PACI): ${paci}`);
  } else if (civil) {
    parts.push(`الرقم المدني للجهة: ${civil}`);
  }

  if (usesCommercialRegistration(company) && profile.commercialReg && profile.commercialReg !== '—') {
    parts.push(`السجل التجاري: ${profile.commercialReg}`);
  }

  if (profile.wsiCode && profile.wsiCode !== '—') {
    parts.push(`ملف الشؤون (PAM/WPS): ${profile.wsiCode}`);
  }

  return parts;
}

export function formatEmployerRegistryLine(
  profile: CompanyPrintProfile,
  company?: Company | null
): string {
  const parts = employerRegistryMetaParts(profile, company);
  return parts.length > 0 ? parts.join(' | ') : 'دولة الكويت';
}

/** Template merge tag `{السجل_التجاري}` — MOH license for medical facilities, CR only for MOCI. */
export function employerLicenseTokenForTemplates(
  profile: CompanyPrintProfile,
  company?: Company | null
): string {
  if (usesCommercialRegistration(company)) {
    return profile.commercialReg && profile.commercialReg !== '—' ? profile.commercialReg : '—';
  }
  return profile.mohLicense && profile.mohLicense !== '—' ? profile.mohLicense : '—';
}

export function employerPamOrEstablishmentCode(
  profile: CompanyPrintProfile,
  company?: Company | null
): string {
  if (profile.wsiCode && profile.wsiCode !== '—') return profile.wsiCode;
  if (usesCommercialRegistration(company) && profile.commercialReg && profile.commercialReg !== '—') {
    return profile.commercialReg;
  }
  if (profile.mohLicense && profile.mohLicense !== '—') return profile.mohLicense;
  return '—';
}
