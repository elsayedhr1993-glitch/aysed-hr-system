import type { TenantCompany } from '../types';

/** Preferred stable ids when duplicate legacy docs exist */
export const CANONICAL_COMPANY_BY_NAME_KEY: Record<string, string> = {
  almanar: 'comp-1788442584841',
  manar: 'comp-1788442584841',
  المنار: 'comp-1788442584841',
  elite: 'comp-1788435917695',
  إيليت: 'comp-1788435917695',
  alfanar: 'tenant_1788413304890',
  الفنار: 'tenant_1788413304890',
};

export function normalizeCompanyDisplayName(name?: string | null): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '');
}

function nameToGroupKey(name?: string | null): string {
  const n = normalizeCompanyDisplayName(name);
  if (!n) return 'unknown';
  if (n.includes('منار') || n.includes('manar') || n.includes('almanar')) return 'almanar';
  if (n.includes('إيليت') || n.includes('elite')) return 'elite';
  if (n.includes('فنار') || n.includes('alfanar')) return 'alfanar';
  return n;
}

function companyCompletenessScore(company: Record<string, unknown>): number {
  let score = 0;
  const pam = String(company.pamFileNumber || company.pam || '').trim();
  if (pam && pam !== '---') score += 40;
  if (String(company.commercialReg || company.commercialRegNo || '').trim()) score += 15;
  if (String(company.adminUsername || company.email || '').trim()) score += 10;
  if (String(company.contactPhone || company.phone || '').trim()) score += 5;
  if (String(company.mohLicense || '').trim()) score += 5;
  if (String(company.iban || '').trim()) score += 5;
  const id = String(company.id || '');
  if (id.startsWith('comp-')) score += 25;
  if (id.startsWith('tenant_')) score += 20;
  if (id.startsWith('req-')) score -= 50;
  if (id.startsWith('mock-') || id.startsWith('demo-')) score -= 100;
  return score;
}

export function pickCanonicalCompanyId(
  groupKey: string,
  candidates: Array<{ id: string; score: number }>
): string {
  const mapped = CANONICAL_COMPANY_BY_NAME_KEY[groupKey];
  if (mapped && candidates.some((c) => c.id === mapped)) return mapped;
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  return sorted[0]?.id || candidates[0]?.id || '';
}

export function dedupeTenantCompanies<T extends TenantCompany>(
  companies: T[]
): { companies: T[]; duplicateIds: string[]; idRemap: Record<string, string> } {
  const groups = new Map<string, T[]>();

  for (const company of companies) {
    if (!company?.id) continue;
    const key = nameToGroupKey(company.nameAr || company.nameEn || company.name);
    const list = groups.get(key) || [];
    list.push(company);
    groups.set(key, list);
  }

  const canonical: T[] = [];
  const duplicateIds: string[] = [];
  const idRemap: Record<string, string> = {};

  groups.forEach((list, groupKey) => {
    if (list.length === 1) {
      canonical.push(list[0]);
      return;
    }

    const scored = list.map((c) => ({
      company: c,
      id: c.id,
      score: companyCompletenessScore(c as Record<string, unknown>),
    }));
    const winnerId = pickCanonicalCompanyId(
      groupKey,
      scored.map((s) => ({ id: s.id, score: s.score }))
    );
    const winner = scored.find((s) => s.id === winnerId)?.company || scored[0].company;

    const merged = { ...winner } as T;
    for (const entry of scored) {
      if (entry.id === winnerId) continue;
      duplicateIds.push(entry.id);
      idRemap[entry.id] = winnerId;
      const donor = entry.company as Record<string, unknown>;
      const target = merged as Record<string, unknown>;
      if (!target.pamFileNumber && donor.pamFileNumber) target.pamFileNumber = donor.pamFileNumber;
      if (!target.commercialReg && donor.commercialReg) target.commercialReg = donor.commercialReg;
      if (!target.adminUsername && donor.adminUsername) target.adminUsername = donor.adminUsername;
    }
    canonical.push(merged);
  });

  canonical.sort((a, b) =>
    String(a.nameAr || '').localeCompare(String(b.nameAr || ''), 'ar')
  );

  return { companies: canonical, duplicateIds, idRemap };
}

export function remapCompanyId(
  companyId: string | undefined | null,
  idRemap: Record<string, string>
): string | undefined {
  const id = String(companyId || '').trim();
  if (!id) return undefined;
  return idRemap[id] || id;
}

export function resolveCompanyIdForAdminEmail(
  email: string,
  companies: Array<{ id: string; adminUsername?: string; email?: string; nameAr?: string; name?: string }>
): string | undefined {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;

  const matches = companies.filter((c) => {
    const admin = String(c.adminUsername || '').trim().toLowerCase();
    const mail = String(c.email || '').trim().toLowerCase();
    return admin === normalized || mail === normalized;
  });

  if (matches.length === 0) return undefined;

  const scored = matches.map((c) => ({
    id: c.id,
    score: companyCompletenessScore(c as Record<string, unknown>),
    nameAr: c.nameAr || c.name,
  }));
  const groupKey = nameToGroupKey(scored[0]?.nameAr);
  return pickCanonicalCompanyId(groupKey, scored);
}
