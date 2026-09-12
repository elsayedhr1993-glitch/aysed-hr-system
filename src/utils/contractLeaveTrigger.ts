import { doc, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import { HrLeaveAllocation } from '../types';
import { requireCompanyId } from './tenantGuards';

export interface RunningContractTriggerPayload {
  employeeId: string;
  employeeName?: string;
  startDate?: string;
  date_start?: string;
  contractStartDate?: string;
  status?: string;
  contractStatus?: string;
  companyId?: string;
}

export function buildContractRunningLeaveAllocationRecord(contract: RunningContractTriggerPayload): HrLeaveAllocation | null {
  if (!contract || !contract.employeeId) return null;

  const rawStatus = String(contract.contractStatus || contract.status || '').toLowerCase();
  const isRunning = rawStatus === 'running' || rawStatus === 'active' || rawStatus === 'ساري' || rawStatus === 'سار';
  if (!isRunning) {
    return null;
  }

  const companyId = requireCompanyId(contract.companyId);
  const rawDate = contract.startDate || contract.date_start || contract.contractStartDate || '2026-01-01';
  const startDateIso = rawDate.slice(0, 10);
  const startYear = startDateIso.split('-')[0] || '2026';
  const allocationId = `ALC-${companyId}-${contract.employeeId}-${startYear}`;

  return {
    id: allocationId,
    employeeId: contract.employeeId,
    companyId,
    employeeName: contract.employeeName || 'موظف',
    leaveType: 'ANNUAL',
    allocationType: 'regular',
    numberOfDays: 30,
    consumedDays: 0,
    remainingDays: 30,
    dateFrom: startDateIso,
    state: 'validate',
    createdAt: new Date().toISOString(),
    fromYear: startYear,
    notes: `ناتج تلقائياً عن تفعيل العقد الساري لسنة ${startYear}`,
    name: `رصيد سنوي معتمد 30 يوماً - ${startYear}`
  } as HrLeaveAllocation;
}

/**
 * Hook & Utility Trigger:
 * تلقائياً ينشئ ويثبت سجل Time Off Allocation برصيد 30 يوماً
 * لحظة حفظ أو تفعيل العقد بحالة Running / Active مع اعتماد تاريخ البداية المكتوب.
 */
export async function triggerContractRunningLeaveAllocation(contract: RunningContractTriggerPayload): Promise<any> {
  const allocDoc = buildContractRunningLeaveAllocationRecord(contract);
  if (!allocDoc) return null;

  try {
    await setDoc(doc(db, 'leave_allocations', allocDoc.id), cleanFirestoreData(allocDoc), { merge: true });

    return allocDoc;
  } catch (err) {
    console.error('Failed to execute triggerContractRunningLeaveAllocation:', err);
    return null;
  }
}

/**
 * React Hook for executing the running contract trigger in components
 */
export function useContractLeaveTrigger() {
  const trigger = async (contract: RunningContractTriggerPayload) => {
    return triggerContractRunningLeaveAllocation(contract);
  };

  return { triggerRunningContractAllocation: trigger };
}
