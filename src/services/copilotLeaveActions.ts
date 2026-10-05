import { doc, setDoc } from 'firebase/firestore';
import type { Employee } from '../types';
import { cleanFirestoreData, db } from '../lib/firebase';
import { normalizeTenantCompanyId } from '../utils/contractTenantRules';
import { normalizeLeaveStatus, normalizeLeaveType } from '../utils/leaveModel';
import type { CopilotLeaveDraftData } from '../lib/aiCopilotTypes';

function calendarDaysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

function resolveEmployee(
  draft: CopilotLeaveDraftData,
  employees: Employee[]
): Employee | undefined {
  const id = String(draft.employeeId || '').trim();
  if (id) {
    const byId = employees.find((e) => String(e.id) === id);
    if (byId) return byId;
  }
  const civil = String(draft.civilId || '').replace(/\D/g, '');
  if (civil) {
    const byCivil = employees.find(
      (e) => String(e.civilId || (e as { civil_id?: string }).civil_id || '').replace(/\D/g, '') === civil
    );
    if (byCivil) return byCivil;
  }
  const name = String(draft.employeeName || '').trim();
  if (name) {
    const lower = name.toLowerCase();
    return employees.find((e) => {
      const ar = String((e as { nameAr?: string }).nameAr || e.fullNameAr || e.name || '').trim();
      return ar === name || ar.toLowerCase().includes(lower) || lower.includes(ar.toLowerCase());
    });
  }
  return undefined;
}

export interface CopilotLeaveDraftResult {
  id: string;
  employeeId: string;
  employeeName: string;
  status: string;
}

export async function createLeaveDraftViaCopilot(
  companyId: string,
  draft: CopilotLeaveDraftData,
  employees: Employee[],
  options?: { submitForApproval?: boolean }
): Promise<CopilotLeaveDraftResult> {
  const tenantId = normalizeTenantCompanyId(companyId) || companyId;
  const employee = resolveEmployee(draft, employees);
  if (!employee) {
    throw new Error('تعذر تحديد الموظف. أرفق employeeId أو الرقم المدني أو الاسم كما في السجل.');
  }

  const startDate = String(draft.startDate || '').trim();
  const endDate = String(draft.endDate || startDate).trim() || startDate;
  if (!startDate) {
    throw new Error('تاريخ بداية الإجازة مطلوب (startDate).');
  }

  const daysCount = calendarDaysBetween(startDate, endDate || startDate);
  const leaveType = normalizeLeaveType(draft.leaveType || 'annual');
  const submit = options?.submitForApproval ?? Boolean(draft.submitForApproval);
  const status = submit ? normalizeLeaveStatus('PENDING_MANAGER') : normalizeLeaveStatus('DRAFT');

  const id = `LV-COP-${Date.now()}`;
  const employeeName =
    String(draft.employeeName || '').trim() ||
    String((employee as { nameAr?: string }).nameAr || employee.fullNameAr || employee.name || 'موظف');

  const record = {
    id,
    companyId: tenantId,
    employeeId: employee.id,
    employeeName,
    civilId: employee.civilId || draft.civilId || '',
    department: employee.department || (employee as { dept?: string }).dept || '',
    leaveType,
    startDate,
    endDate: endDate || startDate,
    daysCount,
    totalDays: daysCount,
    reason: String(draft.reason || 'طلب إجازة من المساعد الذكي').trim(),
    leaveScope: 'INTERNAL',
    status,
    appliedDate: new Date().toISOString().split('T')[0],
    basicSalary: Number((employee as any).basicSalary || 0),
    totalSalary: Number((employee as any).totalSalary || (employee as any).salary || 0),
    settlementDone: false,
    source: 'copilot',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'leave_requests', id), cleanFirestoreData(record), { merge: true });

  return {
    id,
    employeeId: employee.id,
    employeeName,
    status: String(status),
  };
}
