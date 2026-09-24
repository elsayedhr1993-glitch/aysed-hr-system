import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface EmployeeCivilDuplicate {
  docId: string;
  companyId: string;
  fullNameAr: string;
  civilId: string;
}

function normalizeCivilId(value: unknown): string {
  return String(value || '').replace(/\D/g, '').trim();
}

function pickCivilId(data: Record<string, unknown>): string {
  return normalizeCivilId(
    data.civilId ?? data.civil_id ?? data.civil_id_number ?? (data.raw_payload as any)?.civilId
  );
}

function pickName(data: Record<string, unknown>): string {
  return String(
    data.fullNameAr ?? data.full_name_ar ?? data.nameAr ?? data.name ?? (data.raw_payload as any)?.fullNameAr ?? ''
  );
}

/** Find all employee docs sharing the same civil ID (any company). */
export async function findEmployeesByCivilId(civilId: string): Promise<EmployeeCivilDuplicate[]> {
  const normalized = normalizeCivilId(civilId);
  if (normalized.length < 8) return [];

  const fields = ['civilId', 'civil_id', 'civil_id_number'] as const;
  const byDocId = new Map<string, EmployeeCivilDuplicate>();

  for (const field of fields) {
    try {
      const snap = await getDocs(query(collection(db, 'employees'), where(field, '==', normalized)));
      snap.docs.forEach((d) => {
        const data = d.data() as Record<string, unknown>;
        const rowCivil = pickCivilId(data);
        if (rowCivil !== normalized) return;
        byDocId.set(d.id, {
          docId: d.id,
          companyId: String(data.companyId ?? data.company_id ?? ''),
          fullNameAr: pickName(data),
          civilId: rowCivil,
        });
      });
    } catch {
      /* field may be missing on some docs */
    }
  }

  // Also match stored civil with dashes/spaces (legacy string forms)
  if (byDocId.size === 0 && civilId.trim() !== normalized) {
    for (const field of fields) {
      try {
        const snap = await getDocs(query(collection(db, 'employees'), where(field, '==', civilId.trim())));
        snap.docs.forEach((d) => {
          const data = d.data() as Record<string, unknown>;
          byDocId.set(d.id, {
            docId: d.id,
            companyId: String(data.companyId ?? data.company_id ?? ''),
            fullNameAr: pickName(data),
            civilId: pickCivilId(data) || civilId.trim(),
          });
        });
      } catch {
        /* ignore */
      }
    }
  }

  return Array.from(byDocId.values());
}

export type CrossTenantCivilCheck =
  | { ok: true }
  | {
      ok: false;
      message: string;
      duplicates: EmployeeCivilDuplicate[];
    };

/**
 * Block creating the same civil ID in another tenant (Kuwait: one person = one employer record per company is OK only if intentional).
 * Default policy: same civil ID cannot exist in two active companies.
 */
export async function assertNoCrossTenantCivilDuplicate(
  civilId: string,
  targetCompanyId: string,
  options?: { employeeDocId?: string }
): Promise<CrossTenantCivilCheck> {
  const normalized = normalizeCivilId(civilId);
  if (!normalized || !targetCompanyId || targetCompanyId === 'comp-super-admin') {
    return { ok: true };
  }

  const all = await findEmployeesByCivilId(normalized);
  const others = all.filter(
    (row) =>
      row.companyId &&
      row.companyId !== targetCompanyId &&
      row.docId !== (options?.employeeDocId || '')
  );

  if (others.length === 0) return { ok: true };

  const list = others
    .map((o) => `${o.fullNameAr || 'موظف'} (${o.companyId})`)
    .join('، ');

  return {
    ok: false,
    message: `الرقم المدني ${normalized} مسجّل مسبقاً في منشأة أخرى: ${list}. احذف النسخة الخاطئة أو استخدم منشأة واحدة فقط.`,
    duplicates: others,
  };
}
