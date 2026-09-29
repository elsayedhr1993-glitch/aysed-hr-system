import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, getCompaniesCollectionName } from '../lib/firebase';
import { isSuperAdminEmail } from '../config/superAdminAccess';
import {
  dedupeTenantCompanies,
  resolveCompanyIdForAdminEmail,
} from '../utils/companyDedupe';
import type { TenantCompany } from '../types';

function mapCompanyDoc(id: string, data: Record<string, unknown>): TenantCompany {
  return {
    id,
    nameAr: String(data.nameAr || data.name || '—'),
    nameEn: String(data.nameEn || data.name || '—'),
    adminUsername: String(data.adminUsername || data.email || ''),
    adminPassword: '',
    contactPhone: String(data.contactPhone || data.phone || ''),
    pamFileNumber: String(data.pamFileNumber || ''),
    commercialReg: String(data.commercialReg || ''),
    mohLicense: String(data.mohLicense || ''),
    iban: String(data.iban || ''),
    bankName: String(data.bankName || ''),
    isActive: data.isActive !== false,
    createdAt: String(data.createdAt || ''),
  };
}

/**
 * Resolves tenant companies for the signed-in admin without listing the full companies collection
 * (full list is denied by Firestore rules for tenant admins).
 */
export async function fetchCompaniesForAdminEmail(email: string): Promise<TenantCompany[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];

  const col = getCompaniesCollectionName();

  if (isSuperAdminEmail(email)) {
    const snap = await getDocs(collection(db, col));
    return snap.docs.map((d) => mapCompanyDoc(d.id, d.data() as Record<string, unknown>));
  }

  const seen = new Map<string, TenantCompany>();
  const fieldQueries = ['adminUsername', 'email', 'adminEmail'] as const;

  for (const field of fieldQueries) {
    const snap = await getDocs(
      query(collection(db, col), where(field, '==', normalized))
    ).catch(() => null);
    if (!snap) continue;
    for (const docSnap of snap.docs) {
      seen.set(docSnap.id, mapCompanyDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
    }
  }

  return [...seen.values()];
}

export async function resolveTenantCompanyIdForEmail(
  email: string,
  currentCompanyId?: string
): Promise<string | undefined> {
  const companies = await fetchCompaniesForAdminEmail(email);
  if (companies.length === 0) return currentCompanyId;

  const { companies: deduped, idRemap } = dedupeTenantCompanies(companies);
  const fromEmail = resolveCompanyIdForAdminEmail(email, deduped);
  if (fromEmail) return fromEmail;

  const remapped = currentCompanyId ? idRemap[currentCompanyId] || currentCompanyId : undefined;
  return remapped || deduped[0]?.id;
}
