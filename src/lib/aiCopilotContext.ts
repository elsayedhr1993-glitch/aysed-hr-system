import type { Company, Contract, Employee, LeaveRequest } from '../types';

function contractTotal(contract: Contract | undefined): number {
  if (!contract) return 0;
  return (
    Number(contract.basicSalary || 0) +
    Number(contract.housingAllowance || 0) +
    Number(contract.transportAllowance || 0) +
    Number(contract.otherAllowance || 0)
  );
}

function isActiveEmployee(emp: Employee): boolean {
  const s = String(emp.status || '').toUpperCase();
  return !['TERMINATED', 'RESIGNED', 'INACTIVE'].includes(s) && s !== 'منتهي';
}

/**
 * Aggregated tenant context — no full employee roster (PII-safe default).
 */
export function buildCompanyContextSummary(input: {
  company?: Company | null;
  employees: Employee[];
  contracts: Contract[];
  leaves?: LeaveRequest[];
  companyId?: string;
  leaveSummary?: { pending?: number; onLeaveToday?: number };
}): string {
  const { company, employees, contracts, leaves = [], companyId, leaveSummary } = input;
  const scopedEmployees = companyId
    ? employees.filter((e) => e.companyId === companyId || !e.companyId)
    : employees;
  const scopedContracts = companyId
    ? contracts.filter((c) => c.companyId === companyId || !c.companyId)
    : contracts;
  const scopedLeaves = companyId
    ? leaves.filter((l) => l.companyId === companyId || !l.companyId)
    : leaves;

  const active = scopedEmployees.filter(isActiveEmployee);
  const deptCounts: Record<string, number> = {};
  let salarySum = 0;
  let withContract = 0;

  for (const emp of active) {
    const dept = emp.department || (emp as { dept?: string }).dept || 'غير محدد';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    const c = scopedContracts.find((x) => x.employeeId === emp.id);
    const total = contractTotal(c) || Number((emp as any).totalSalary || (emp as any).basicSalary || 0);
    if (total > 0) {
      salarySum += total;
      withContract += 1;
    }
  }

  const pendingLeave =
    leaveSummary?.pending ??
    scopedLeaves.filter((l) =>
      ['PENDING', 'pending', 'pending_manager', 'pending_hr', 'قيد الانتظار'].includes(String(l.status))
    ).length;
  const approvedLeave = scopedLeaves.filter((l) =>
    ['APPROVED', 'approved', 'معتمد'].includes(String(l.status))
  ).length;
  const onLeaveToday = leaveSummary?.onLeaveToday;

  const deptLines = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([d, n]) => `  - ${d}: ${n}`)
    .join('\n');

  const avgSalary = withContract > 0 ? (salarySum / withContract).toFixed(3) : '0.000';

  return [
    `معرّف الشركة: ${companyId || company?.id || 'غير محدد'}`,
    `الاسم: ${company?.nameAr || company?.name || '—'}`,
    company?.commercialRegNo ? `السجل التجاري: ${company.commercialRegNo}` : null,
    `الموظفون النشطون: ${active.length} (إجمالي السجلات: ${scopedEmployees.length})`,
    `متوسط الراتب الشامل (من العقود/السجل): ${avgSalary} KWD`,
    `طلبات إجازة معلقة: ${pendingLeave} | معتمدة: ${approvedLeave}${onLeaveToday != null ? ` | في إجازة اليوم: ${onLeaveToday}` : ''}`,
    'توزيع الأقسام (عدد فقط، بدون أسماء):',
    deptLines || '  - لا توجد أقسام',
  ]
    .filter(Boolean)
    .join('\n');
}

export function assertClientCompanyAccess(
  requestedCompanyId: string | undefined,
  callerCompanyId: string | undefined,
  isSuperAdmin: boolean
): { ok: true; companyId: string } | { ok: false; reason: string } {
  const req = String(requestedCompanyId || '').trim();
  const caller = String(callerCompanyId || '').trim();

  if (!req) {
    return { ok: false, reason: 'companyId مطلوب في طلب المساعد' };
  }
  if (req === 'SAAS_PLATFORM' || req === 'comp-super-admin') {
    return { ok: false, reason: 'اختر شركة مستأجر قبل استخدام المساعد' };
  }
  if (isSuperAdmin) {
    return { ok: true, companyId: req };
  }
  if (!caller || caller !== req) {
    return { ok: false, reason: 'لا يمكن استخدام المساعد لشركة غير مرتبطة بحسابك' };
  }
  return { ok: true, companyId: req };
}
