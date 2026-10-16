import { maskIdentity } from './identityMask';

function isSalaryKey(key: string): boolean {
  return /salary|wage|راتب|netpay|grosspay/i.test(key);
}

function isCivilKey(key: string): boolean {
  return /civil[\s_-]?id|civilid|رقم\s*مدني|الرقم المدني/i.test(key);
}

function isCompanyKey(key: string): boolean {
  return key === 'companyId' || key === 'company_id' || key === 'cid';
}

/** Fields kept in before/after. Civil id and salary are masked. Company id is omitted. */
function isKeptKey(key: string): boolean {
  return (
    isCivilKey(key)
    || isSalaryKey(key)
    || /^(role|status|state|isActive|archived|active|version|screenId|purpose|exported)$/i.test(key)
    || /^(hidden|order|icon|group|permission|titleAr|titleEn|uiKey)$/i.test(key)
  );
}

export function maskAuditDetails(value: unknown): string {
  const text = String(value ?? '').slice(0, 240);
  return text.replace(/\d{8,}/g, (run) => maskIdentity(run, 'civil'));
}

export function maskAuditSnapshot(value: unknown, depth = 0): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (depth > 4) return null;
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (isCompanyKey(key) || !isKeptKey(key)) continue;
    if (isCivilKey(key)) {
      out[key] = maskIdentity(raw as string | number | null | undefined, 'civil');
      continue;
    }
    if (isSalaryKey(key)) {
      out[key] = raw === null || raw === undefined || raw === '' ? raw ?? null : '•••';
      continue;
    }
    if (raw && typeof raw === 'object') continue;
    out[key] = raw;
  }
  return out;
}
