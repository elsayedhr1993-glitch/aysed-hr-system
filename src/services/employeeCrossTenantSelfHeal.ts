import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { findEmployeesByCivilId } from './employeeDuplicateGuard';
import { TenantDatabaseService } from './tenantDataService';

export const ALMANAR_CANONICAL_COMPANY_ID = 'comp-1788442584841';

/** Known duplicate case: السيد بخيت — canonical tenant is Almanar only. */
export const SELF_HEAL_WATCH_CIVIL_ID = '293080106877';

const SELF_HEAL_SESSION_KEY = `employeeSelfHeal:v2:${SELF_HEAL_WATCH_CIVIL_ID}`;

export function normalizeTenantCompanyId(companyId: string): string {
  return String(companyId || '').trim().replace(/_/g, '-');
}

export interface CrossTenantSelfHealResult {
  civilId: string;
  canonicalCompanyId: string;
  dryRun: boolean;
  kept: Array<{ docId: string; companyId: string; fullNameAr: string }>;
  deletedEmployees: Array<{ docId: string; companyId: string; fullNameAr: string }>;
  deletedOnboardingPlanIds: string[];
  errors: string[];
}

async function purgeStrayOnboardingPlansForCivil(
  civilId: string,
  canonicalCompanyId: string,
  dryRun: boolean
): Promise<string[]> {
  const normalized = civilId.replace(/\D/g, '').trim();
  const canonical = normalizeTenantCompanyId(canonicalCompanyId);
  const deleted: string[] = [];
  const fields = ['civilId', 'civil_id'] as const;

  for (const field of fields) {
    try {
      const snap = await getDocs(query(collection(db, 'onboarding_plans'), where(field, '==', normalized)));
      for (const d of snap.docs) {
        const data = d.data() as Record<string, unknown>;
        const planCompany = normalizeTenantCompanyId(String(data.companyId ?? data.company_id ?? ''));
        if (!planCompany || planCompany === canonical) continue;
        if (!dryRun) {
          await deleteDoc(doc(db, 'onboarding_plans', d.id));
        }
        deleted.push(d.id);
      }
    } catch {
      /* index or field may be missing */
    }
  }

  return deleted;
}

/**
 * Remove employee rows (and related data) for a civil ID outside the canonical company.
 * Uses Firebase Web SDK — must run with an authenticated user allowed by Firestore rules (super admin).
 */
export async function healCrossTenantEmployeeDuplicates(options?: {
  civilId?: string;
  canonicalCompanyId?: string;
  dryRun?: boolean;
}): Promise<CrossTenantSelfHealResult> {
  const civilId = (options?.civilId || SELF_HEAL_WATCH_CIVIL_ID).replace(/\D/g, '').trim();
  const canonicalCompanyId = options?.canonicalCompanyId || ALMANAR_CANONICAL_COMPANY_ID;
  const dryRun = options?.dryRun === true;
  const canonical = normalizeTenantCompanyId(canonicalCompanyId);

  const result: CrossTenantSelfHealResult = {
    civilId,
    canonicalCompanyId: canonical,
    dryRun,
    kept: [],
    deletedEmployees: [],
    deletedOnboardingPlanIds: [],
    errors: [],
  };

  const rows = await findEmployeesByCivilId(civilId);
  const toDelete = rows.filter((r) => normalizeTenantCompanyId(r.companyId) !== canonical);
  const toKeep = rows.filter((r) => normalizeTenantCompanyId(r.companyId) === canonical);

  result.kept = toKeep.map((r) => ({
    docId: r.docId,
    companyId: r.companyId,
    fullNameAr: r.fullNameAr,
  }));

  for (const row of toDelete) {
    if (dryRun) {
      result.deletedEmployees.push({
        docId: row.docId,
        companyId: row.companyId,
        fullNameAr: row.fullNameAr,
      });
      continue;
    }
    try {
      const ok = await TenantDatabaseService.deleteEmployee(row.docId, row.companyId);
      if (ok) {
        result.deletedEmployees.push({
          docId: row.docId,
          companyId: row.companyId,
          fullNameAr: row.fullNameAr,
        });
      } else {
        result.errors.push(`فشل حذف الموظف ${row.docId} (${row.companyId})`);
      }
    } catch (err) {
      result.errors.push(
        `خطأ حذف ${row.docId}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  try {
    const planIds = await purgeStrayOnboardingPlansForCivil(civilId, canonical, dryRun);
    result.deletedOnboardingPlanIds = planIds;
  } catch (err) {
    result.errors.push(
      `خطأ تنظيف خطط التهيئة: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return result;
}

/** Run once per browser session (super admin panel). */
export async function runDefaultCrossTenantSelfHealOncePerSession(): Promise<CrossTenantSelfHealResult | null> {
  if (typeof window === 'undefined') return null;
  try {
    if (sessionStorage.getItem(SELF_HEAL_SESSION_KEY) === 'done') return null;
  } catch {
    return null;
  }

  const result = await healCrossTenantEmployeeDuplicates({ dryRun: false });
  try {
    sessionStorage.setItem(SELF_HEAL_SESSION_KEY, 'done');
  } catch {
    /* ignore */
  }
  return result;
}
