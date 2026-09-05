import { TenantDatabaseService } from '../services/tenantDataService';

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
    const rawAlloc = localStorage.getItem('odoo_leave_allocations_v2');
    let allocList: any[] = rawAlloc ? JSON.parse(rawAlloc) : [];

    const existingIdx = allocList.findIndex(
      (a: any) => String(a.employeeId) === String(contract.employeeId) && (String(a.fromYear) === String(startYear) || String(a.fromYear) === '2026')
    );

    const allocDoc = {
      id: existingIdx >= 0 ? allocList[existingIdx].id : `ALC-${startYear}-${String(allocList.length + 1).padStart(2, '0')}`,
      employeeId: contract.employeeId,
      employeeName: contract.employeeName || 'موظف',
      days: 30, // 30 يوماً رصيد سنوي معتمد بقوة القانون الكويتي
      fromYear: startYear,
      leaveType: 'annual',
      type: 'annual',
      status: 'approved',
      note: `رصيد سنوي معتمد 30 يوماً ناتج تلقائياً عن تفعيل عقد العمل الساري لسنة ${startYear} (Running Contract Trigger)`,
      date: startDateIso,
      startDate: startDateIso,
      companyId: contract.companyId || 'comp-super-admin',
      createdAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      allocList[existingIdx] = { ...allocList[existingIdx], ...allocDoc };
    } else {
      allocList.unshift(allocDoc);
    }

    localStorage.setItem('odoo_leave_allocations_v2', JSON.stringify(allocList));
    window.dispatchEvent(new Event('storage'));

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
