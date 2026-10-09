import type { Firestore } from 'firebase-admin/firestore';
import { checkDocumentExpiry } from '../../../src/utils/dateUtils';
import { fetchTenantEmployeeDocs } from '../tenantFirestore';

export type DocumentGapRow = {
  employeeId: string;
  name: string;
  civilId?: string;
  issue: string;
  field: string;
  expiryDate?: string;
  severity: 'expired' | 'warning' | 'missing';
};

export type ComplianceDocumentGapsResult = {
  companyId: string;
  scannedEmployees: number;
  expiredCount: number;
  expiringSoonCount: number;
  missingDateCount: number;
  rows: DocumentGapRow[];
};

function pickName(row: Record<string, unknown>): string {
  return String(row.fullNameAr ?? row.nameAr ?? row.name ?? row.id ?? '');
}

function scanField(
  emp: Record<string, unknown>,
  fieldKeys: string[],
  label: string,
  rows: DocumentGapRow[],
  counts: { expired: number; warning: number; missing: number }
) {
  let raw = '';
  for (const key of fieldKeys) {
    if (emp[key]) {
      raw = String(emp[key]);
      break;
    }
  }

  const id = String(emp.id ?? '');
  const name = pickName(emp);
  const civilId = String(emp.civilId ?? emp.civil_id ?? '').trim() || undefined;

  if (!raw) {
    counts.missing += 1;
    rows.push({
      employeeId: id,
      name,
      civilId,
      issue: `${label}: تاريخ غير مسجل`,
      field: label,
      severity: 'missing',
    });
    return;
  }

  const status = checkDocumentExpiry(raw, label);
  if (status.isExpired) {
    counts.expired += 1;
    rows.push({
      employeeId: id,
      name,
      civilId,
      issue: `${label}: ${status.badgeText}`,
      field: label,
      expiryDate: raw,
      severity: 'expired',
    });
  } else if (status.isExpiringSoon) {
    counts.warning += 1;
    rows.push({
      employeeId: id,
      name,
      civilId,
      issue: `${label}: ${status.badgeText}`,
      field: label,
      expiryDate: raw,
      severity: 'warning',
    });
  }
}

export async function runComplianceDocumentGaps(
  db: Firestore,
  companyId: string,
  limit = 25
): Promise<ComplianceDocumentGapsResult> {
  const employees = await fetchTenantEmployeeDocs(db, companyId);
  const rows: DocumentGapRow[] = [];
  const counts = { expired: 0, warning: 0, missing: 0 };

  for (const emp of employees) {
    scanField(emp, ['civilIdExpiry', 'civilIdExpiryDate', 'civil_id_expiry'], 'البطاقة المدنية', rows, counts);
    scanField(emp, ['passportExpiry', 'passport_expiry', 'passportExpiryDate'], 'جواز السفر', rows, counts);
    scanField(emp, ['mohLicenseExpiry', 'moh_license_expiry', 'mohLicenseExp'], 'ترخيص MOH', rows, counts);

    if (!String(emp.civilId ?? emp.civil_id ?? '').trim()) {
      counts.missing += 1;
      rows.push({
        employeeId: String(emp.id ?? ''),
        name: pickName(emp),
        issue: 'الرقم المدني غير مسجل',
        field: 'civilId',
        severity: 'missing',
      });
    }
  }

  const severityRank = { expired: 0, warning: 1, missing: 2 };
  rows.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.name.localeCompare(b.name, 'ar'));

  return {
    companyId,
    scannedEmployees: employees.length,
    expiredCount: counts.expired,
    expiringSoonCount: counts.warning,
    missingDateCount: counts.missing,
    rows: rows.slice(0, limit),
  };
}

export function formatComplianceDocumentGapsReply(
  result: ComplianceDocumentGapsResult,
  isArabic: boolean
): string {
  if (isArabic) {
    const lines = result.rows.map(
      (r) =>
        `- **${r.name}** (${r.employeeId})${r.expiryDate ? ` — ${r.expiryDate}` : ''}: ${r.issue}`
    );
    return [
      '**فحص نواقص الوثائق والتراخيص**',
      `- تم فحص **${result.scannedEmployees}** موظفاً`,
      `- منتهية: **${result.expiredCount}** | قريبة من الانتهاء: **${result.expiringSoonCount}** | بيانات ناقصة: **${result.missingDateCount}**`,
      lines.length ? '\nأهم الحالات:\n' + lines.join('\n') : '\nلا توجد حالات حرجة في العينة المعروضة.',
      result.rows.length < result.expiredCount + result.expiringSoonCount + result.missingDateCount
        ? '\n_(تم عرض أول ' + result.rows.length + ' حالة فقط)_'
        : '',
      '\n_مصدر: Firestore (compliance.documentGaps)_',
    ].join('\n');
  }

  const lines = result.rows.map((r) => `- **${r.name}** (${r.employeeId}): ${r.issue}`);
  return [
    '**Document & license gap scan**',
    `Scanned **${result.scannedEmployees}** employees.`,
    lines.length ? lines.join('\n') : 'No critical gaps in sample.',
    '\n_Source: Firestore (compliance.documentGaps)_',
  ].join('\n');
}
