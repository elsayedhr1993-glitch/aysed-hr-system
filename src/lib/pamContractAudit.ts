import type { Contract, Employee } from '../types';

export interface PamAuditFinding {
  type: 'success' | 'warning' | 'error';
  text: string;
  field?: string;
}

export interface PamAuditResult {
  score: number;
  findings: PamAuditFinding[];
  matchedEmployeeId?: string;
  extracted: Record<string, string>;
}

function norm(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normDigits(s: unknown): string {
  return String(s ?? '').replace(/\D/g, '');
}

function compareField(
  label: string,
  field: string,
  docVal: string,
  recordVal: string,
  findings: PamAuditFinding[],
  checks: { total: number; matched: number }
) {
  checks.total += 1;
  if (!docVal) {
    findings.push({ type: 'warning', field, text: `${label}: لم يُستخرج من المستند — راجع يدوياً.` });
    return;
  }
  if (!recordVal) {
    findings.push({ type: 'warning', field, text: `${label}: غير مسجل في ملف الموظف (${docVal}).` });
    return;
  }
  const same =
    field === 'civilId'
      ? normDigits(docVal) === normDigits(recordVal)
      : norm(docVal) === norm(recordVal) || norm(docVal).includes(norm(recordVal)) || norm(recordVal).includes(norm(docVal));
  if (same) {
    checks.matched += 1;
    findings.push({ type: 'success', field, text: `${label}: متطابق (${docVal}).` });
  } else {
    findings.push({
      type: 'error',
      field,
      text: `${label}: اختلاف — المستند «${docVal}» مقابل السجل «${recordVal}».`,
    });
  }
}

export function findEmployeeForPamAudit(
  employees: Employee[],
  ocr: Record<string, unknown>,
  companyId?: string
): Employee | undefined {
  const scoped = companyId ? employees.filter((e) => e.companyId === companyId || !e.companyId) : employees;
  const civil = normDigits(ocr.civilId || ocr.civil_id);
  if (civil.length === 12) {
    const hit = scoped.find((e) => normDigits(e.civilId) === civil);
    if (hit) return hit;
  }
  const name = norm(ocr.fullNameAr || ocr.fullName || ocr.nameAr);
  if (!name) return undefined;
  return scoped.find((e) => {
    const n = norm(e.fullNameAr || (e as { nameAr?: string }).nameAr);
    return n.includes(name) || name.includes(n);
  });
}

export function auditPamContractAgainstRecord(
  ocr: Record<string, unknown>,
  employee: Employee | undefined,
  contract: Contract | undefined
): PamAuditResult {
  const extracted: Record<string, string> = {
    fullNameAr: String(ocr.fullNameAr || ocr.fullName || ocr.nameAr || '').trim(),
    civilId: normDigits(ocr.civilId),
    jobTitle: String(ocr.profession || ocr.jobTitle || '').trim(),
    basicSalary: String(ocr.basicSalary || ocr.contractSalary || '').trim(),
    startDate: String(ocr.pamStartDate || ocr.issueDate || ocr.startDate || '').trim(),
    endDate: String(ocr.pamEndDate || ocr.expiryDate || ocr.endDate || '').trim(),
  };

  const findings: PamAuditFinding[] = [];
  const checks = { total: 0, matched: 0 };

  if (!employee) {
    findings.push({
      type: 'error',
      text: 'لم يُعثر على موظف مطابق (الرقم المدني أو الاسم). سجّل الموظف أو صحّح المستند.',
    });
    return { score: 0, findings, extracted };
  }

  const recordSalary = String(
    contract?.basicSalary ?? (employee as any).basicSalary ?? (employee as any).salary ?? ''
  );
  const recordTitle = String(employee.jobTitle || '');
  const recordName = String(employee.fullNameAr || (employee as { nameAr?: string }).nameAr || '');
  const recordCivil = normDigits(employee.civilId);
  const recordStart = String(contract?.startDate || (employee as any).joinDate || '');
  const recordEnd = String(contract?.endDate || (employee as any).contractEndDate || '');

  compareField('الاسم', 'name', extracted.fullNameAr, recordName, findings, checks);
  compareField('الرقم المدني', 'civilId', extracted.civilId, recordCivil, findings, checks);
  compareField('المسمى الوظيفي', 'jobTitle', extracted.jobTitle, recordTitle, findings, checks);
  compareField('الراتب الأساسي', 'salary', extracted.basicSalary, recordSalary, findings, checks);
  compareField('تاريخ بداية العقد', 'startDate', extracted.startDate, recordStart, findings, checks);
  compareField('تاريخ نهاية العقد', 'endDate', extracted.endDate, recordEnd, findings, checks);

  const score = checks.total > 0 ? Math.round((checks.matched / checks.total) * 100) : 0;

  if (score >= 85) {
    findings.unshift({ type: 'success', text: `نسبة التطابق مع سجل الموظف/العقد: ${score}% — جيد.` });
  } else if (score >= 50) {
    findings.unshift({ type: 'warning', text: `نسبة التطابق: ${score}% — يتطلب مراجعة HR.` });
  } else {
    findings.unshift({ type: 'error', text: `نسبة التطابق: ${score}% — فجوات جوهرية بين المستند والسجل.` });
  }

  return {
    score,
    findings,
    matchedEmployeeId: employee.id,
    extracted,
  };
}
