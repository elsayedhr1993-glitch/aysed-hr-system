import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { normalizeLeaveStatus, normalizeLeaveType } from '../utils/leaveModel';

export interface LeaveApprovalInput {
  id: string;
  companyId?: string;
  employeeId: string;
  leaveType: string;
  daysCount?: number;
  totalDays?: number;
  status?: string;
}

export interface LeaveApprovalResult {
  paidDays: number;
  unpaidDays: number;
  remainingDays: number;
  allocationBreakdown: Array<{ allocationId: string; daysUsed: number }>;
}

const roundDays = (value: number) => Number(Math.max(0, value).toFixed(2));

export async function approveLeaveRequest(
  request: LeaveApprovalInput,
  approver: string
): Promise<LeaveApprovalResult> {
  const companyId = request.companyId || 'comp-super-admin';
  const normalizedLeaveType = normalizeLeaveType(request.leaveType);
  const normalizedStatus = normalizeLeaveStatus(request.status ?? 'PENDING_HR');
  const requestedDays = Number(request.totalDays ?? request.daysCount ?? 0);

  if (!request.id || !request.employeeId || requestedDays <= 0) {
    throw new Error('بيانات طلب الإجازة غير مكتملة');
  }

  const allocationsQuery = query(
    collection(db, 'leave_allocations'),
    where('employeeId', '==', request.employeeId)
  );
  const allocationRefs = (await getDocs(allocationsQuery)).docs.map(snapshot => snapshot.ref);

  return runTransaction(db, async transaction => {
    const requestRef = doc(db, 'leave_requests', request.id);
    const employeeRef = doc(db, 'employees', request.employeeId);

    const requestSnapshot = await transaction.get(requestRef);
    const employeeSnapshot = await transaction.get(employeeRef);
    const allocationSnapshots = await Promise.all(
      allocationRefs.map(allocationRef => transaction.get(allocationRef))
    );

    const storedRequest = requestSnapshot.data() || request;
    if (normalizeLeaveStatus(storedRequest.status) === 'APPROVED') {
      throw new Error('تم اعتماد طلب الإجازة مسبقًا');
    }

    const isAnnual = normalizeLeaveType(storedRequest.leaveType || request.leaveType) === 'ANNUAL';
    let allocationDocs = allocationSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => ({ id: snapshot.id, ...snapshot.data() } as any))
      .filter(allocation => {
        if (allocation.companyId && allocation.companyId !== companyId) return false;
        const type = String(allocation.leaveType || 'ANNUAL').toUpperCase();
        const state = String(allocation.state || 'validate').toLowerCase();
        return isAnnual && type === 'ANNUAL' && ['validate', 'validated', 'confirm'].includes(state);
      })
      .sort((left, right) => String(left.dateFrom || left.allocationDate || '').localeCompare(String(right.dateFrom || right.allocationDate || '')));

    if (isAnnual && allocationDocs.length === 0) {
      const employeeData = employeeSnapshot.data() || {};
      const documentedOpeningBalance = Number(
        employeeData.openingBalance ?? employeeData.carriedOverBalance ?? employeeData.carriedOverLeave2025 ?? 0
      );

      if (documentedOpeningBalance > 0) {
        const allocationId = `ALLOC-${companyId}-${request.employeeId}-opening`;
        const allocationRef = doc(db, 'leave_allocations', allocationId);
        const allocation = {
          id: allocationId,
          employeeId: request.employeeId,
          companyId,
          leaveType: 'ANNUAL',
          allocationType: 'regular',
          numberOfDays: documentedOpeningBalance,
          consumedDays: 0,
          encashedDays: 0,
          remainingDays: documentedOpeningBalance,
          dateFrom: `${new Date().getFullYear()}-01-01`,
          state: 'validate',
          name: 'رصيد افتتاحي موثق من ملف الموظف',
          notes: 'تم تحويل الرصيد الافتتاحي الموثق إلى تخصيص سحابي قبل الخصم الذري',
          createdAt: new Date().toISOString()
        };
        transaction.set(allocationRef, cleanFirestoreData(allocation), { merge: true });
        allocationDocs = [allocation];
      }
    }

    let remainingToDeduct = requestedDays;
    const allocationBreakdown: LeaveApprovalResult['allocationBreakdown'] = [];
    const totalAvailableBefore = allocationDocs.reduce((sum, allocation) => {
      const totalDays = Number(allocation.numberOfDays ?? allocation.days ?? 0);
      const consumedDays = Number(allocation.consumedDays || 0);
      const encashedDays = Number(allocation.encashedDays || 0);
      return sum + Math.max(0, totalDays - consumedDays - encashedDays);
    }, 0);

    for (const allocation of allocationDocs) {
      if (remainingToDeduct <= 0) break;

      const totalDays = Number(allocation.numberOfDays ?? allocation.days ?? 0);
      const consumedDays = Number(allocation.consumedDays || 0);
      const encashedDays = Number(allocation.encashedDays || 0);
      const availableDays = Math.max(0, totalDays - consumedDays - encashedDays);
      if (availableDays <= 0) continue;

      const daysUsed = Math.min(availableDays, remainingToDeduct);
      const nextConsumedDays = roundDays(consumedDays + daysUsed);
      const nextRemainingDays = roundDays(totalDays - nextConsumedDays - encashedDays);
      const allocationRef = doc(db, 'leave_allocations', allocation.id);

      transaction.set(allocationRef, cleanFirestoreData({
        consumedDays: nextConsumedDays,
        remainingDays: nextRemainingDays,
        companyId
      }), { merge: true });

      allocationBreakdown.push({ allocationId: allocation.id, daysUsed });
      remainingToDeduct = roundDays(remainingToDeduct - daysUsed);
    }

    const paidDays = roundDays(requestedDays - remainingToDeduct);
    const unpaidDays = remainingToDeduct;
    const employeeData = employeeSnapshot.data() || {};
    const currentRemaining = Number(employeeData.remaining_leaves ?? employeeData.leaveBalance ?? 0);
    const balanceBefore = totalAvailableBefore > 0 ? totalAvailableBefore : currentRemaining;
    const remainingDays = roundDays(Math.max(0, balanceBefore - paidDays));
    const now = new Date().toISOString();

    transaction.set(requestRef, cleanFirestoreData({
      ...storedRequest,
      companyId,
      leaveType: normalizeLeaveType(storedRequest.leaveType || request.leaveType),
      status: normalizedStatus === 'APPROVED' ? 'APPROVED' : 'APPROVED',
      totalDays: requestedDays,
      paidDays,
      unpaidDays,
      aysed_paid_days: paidDays,
      aysed_unpaid_days: unpaidDays,
      allocationBreakdown,
      hrApprovedBy: approver,
      hrApprovedAt: now,
      updatedAt: now
    }), { merge: true });

    transaction.set(employeeRef, cleanFirestoreData({
      remaining_leaves: remainingDays,
      leaveBalance: remainingDays,
      companyId,
      updatedAt: now
    }), { merge: true });

    return { paidDays, unpaidDays, remainingDays, allocationBreakdown };
  });
}