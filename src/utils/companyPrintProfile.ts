import type { Company } from '../types';

export interface CompanyPrintProfile {
  companyId: string;
  displayNameAr: string;
  displayNameEn: string;
  civilIdCompany: string;
  commercialReg: string;
  wsiCode: string;
  logoUrl: string;
  mohLicense: string;
  authorizedSignatory: string;
  paciNumber: string;
}

const PLACEHOLDER = '—';

export function mergeCompanyFromFirestore(
  base: Company,
  data: Record<string, unknown> | undefined,
  companyId: string
): Company {
  if (!data) return { ...base, id: companyId };

  const nameAr = String(data.nameAr || data.name || base.nameAr || base.name || '').trim();
  const nameEn = String(data.nameEn || base.nameEn || '').trim();

  return {
    ...base,
    id: companyId,
    nameAr: nameAr || base.nameAr,
    nameEn: nameEn || base.nameEn,
    name: nameAr || base.name || base.nameAr,
    commercialRegNo: String(
      data.commercialRegNo || data.commercialReg || data.crNumber || base.commercialRegNo || base.crNumber || ''
    ).trim(),
    commercialLicenseNo: String(
      data.commercialLicenseNo || data.commercialReg || base.commercialLicenseNo || ''
    ).trim(),
    crNumber: String(data.crNumber || data.commercialReg || base.crNumber || '').trim(),
    civilIdCompany: String(
      data.civilIdCompany || data.civilId || data.signatoryCivilId || base.civilIdCompany || base.civilId || ''
    ).trim(),
    wsiCode: String(data.wsiCode || data.pamFileNumber || data.pam || base.wsiCode || '').trim(),
    logoUrl: String(data.logoUrl || data.logo || base.logoUrl || base.logo || '').trim(),
    logo: String(data.logo || data.logoUrl || base.logo || base.logoUrl || '').trim(),
    mohLicense: String(data.mohLicense || base.mohLicense || '').trim(),
    authorizedSignatory: String(
      data.authorizedSignatory || data.managerName || base.authorizedSignatory || ''
    ).trim(),
    paciNumber: String(data.paciNumber || (base as { paciNumber?: string }).paciNumber || '').trim(),
    email: String(data.email || base.email || '').trim(),
    phone: String(data.phone || base.phone || '').trim(),
  };
}

export function getCompanyPrintProfile(company?: Company | null): CompanyPrintProfile {
  const c = company || ({} as Company);
  const displayNameAr = String(c.nameAr || c.name || '').trim();
  const displayNameEn = String(c.nameEn || '').trim();

  return {
    companyId: String(c.id || '').trim(),
    displayNameAr: displayNameAr || PLACEHOLDER,
    displayNameEn: displayNameEn || displayNameAr || PLACEHOLDER,
    civilIdCompany: String(c.civilIdCompany || c.civilId || '').trim() || PLACEHOLDER,
    commercialReg: String(c.commercialRegNo || c.commercialLicenseNo || c.crNumber || '').trim() || PLACEHOLDER,
    wsiCode: String(c.wsiCode || '').trim() || PLACEHOLDER,
    logoUrl: String(c.logoUrl || c.logo || '').trim(),
    mohLicense: String(c.mohLicense || '').trim() || PLACEHOLDER,
    authorizedSignatory: String(c.authorizedSignatory || '').trim() || PLACEHOLDER,
    paciNumber: String((c as { paciNumber?: string }).paciNumber || '').trim() || PLACEHOLDER,
  };
}
