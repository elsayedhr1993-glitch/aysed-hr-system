import { doc, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';

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

/**
 * Hook & Utility Trigger:
 * تلقائياً ينشئ ويثبت سجل Time Off Allocation برصيد 30 يوماً
 * لحظة حفظ أو تفعيل العقد بحالة Running / Active مع اعتماد تاريخ البداية المكتوب.
 */
export function triggerContractRunningLeaveAllocation(contract: RunningContractTriggerPayload): any {
  if (!contract || !contract.employeeId) return null;

  const rawStatus = String(contract.contractStatus || contract.status || '').toLowerCase();
  const isRunning = rawStatus === 'running' || rawStatus === 'active' || rawStatus === 'ساري' || rawStatus === 'سار';

  if (!isRunning) {
    return null;
  }

  const rawDate = contract.startDate || contract.date_start || contract.contractStartDate || '2026-01-01';
  const startDateIso = rawDate.slice(0, 10);
  const startYear = startDateIso.split('-')[0] || '2026';

  try {
    const allocationId = `ALC-${contract.companyId || 'comp-super-admin'}-${contract.employeeId}-${startYear}`;
    const allocDoc = {
      id: allocationId,
      employeeId: contract.employeeId,
      employeeName: contract.employeeName || 'موظف',
      numberOfDays: 30,
      consumedDays: 0,
      remainingDays: 30,
      fromYear: startYear,
      leaveType: 'ANNUAL',
      allocationType: 'regular',
      state: 'validate',
      name: `رصيد سنوي معتمد 30 يوماً - ${startYear}`,
      notes: `ناتج تلقائياً عن تفعيل العقد الساري لسنة ${startYear}`,
      dateFrom: startDateIso,
      companyId: contract.companyId || 'comp-super-admin',
      createdAt: new Date().toISOString()
    };

    void setDoc(doc(db, 'leave_allocations', allocationId), cleanFirestoreData(allocDoc), { merge: true });

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
  const trigger = (contract: RunningContractTriggerPayload) => {
    return triggerContractRunningLeaveAllocation(contract);
  };

  return { triggerRunningContractAllocation: trigger };
}
