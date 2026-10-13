import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from './firebaseAdmin';
import { requireFirebaseAuthFromHeader } from './apiAuth';

const roundDays = (value: number) => Number(Math.max(0, value).toFixed(2));

export type LeaveApproveHttpResult = {
  status: number;
  body: Record<string, unknown>;
};

function normalizeLeaveType(raw: unknown): string {
  const t = String(raw || 'ANNUAL').toUpperCase();
  const map: Record<string, string> = {
    ANNUAL: 'ANNUAL',
    SICK: 'SICK',
    SICK_LEAVE: 'SICK',
    MATERNITY: 'MATERNITY',
    HAJJ: 'HAJJ',
    UNPAID: 'UNPAID',
    BEREAVEMENT: 'BEREAVEMENT',
    COMPASSIONATE: 'BEREAVEMENT',
    HOURLY_PERMISSION: 'HOURLY_PERMISSION',
    COMPENSATORY: 'COMPENSATORY',
    EMERGENCY: 'ANNUAL',
  };
  return map[t] || t;
}

function normalizeLeaveStatus(raw: unknown): string {
  return String(raw || 'PENDING_HR').toUpperCase();
}

export interface LeaveApproveBody {
  leaveRequestId: string;
  companyId: string;
  approverLabel?: string;
  /** When true, reject approval if annual balance cannot cover full request (no unpaid excess). */
  requireFullAnnualBalance?: boolean;
}

export async function handleLeaveApproveRequest(
  body: LeaveApproveBody | null | undefined,
  authHeader: string | string[] | undefined
): Promise<LeaveApproveHttpResult> {
  const auth = await requireFirebaseAuthFromHeader(authHeader);
  if (auth.ok === false) {
    return { status: auth.status, body: { success: false, error: auth.error } };
  }

  const leaveRequestId = String(body?.leaveRequestId || '').trim();
  const companyId = String(body?.companyId || '').trim();
  const approver = String(body?.approverLabel || 'HR').trim();
  const requireFullAnnualBalance = Boolean(body?.requireFullAnnualBalance);

  if (!leaveRequestId || !companyId) {
    return { status: 400, body: { success: false, error: 'leaveRequestId و companyId مطلوبان' } };
  }

  const firestore = getAdminFirestore();
  if (!firestore) {
    return {
      status: 503,
      body: { success: false, error: 'Firebase Admin غير مهيأ على السيرفر' },
    };
  }

  try {
    const requestRef = firestore.collection('leave_requests').doc(leaveRequestId);
    const preloadRequest = await requestRef.get();
    if (!preloadRequest.exists) {
      return { status: 404, body: { success: false, error: 'طلب الإجازة غير موجود' } };
    }
    const preloadData = preloadRequest.data() || {};
    const preloadEmployeeId = String(preloadData.employeeId || '').trim();
    if (!preloadEmployeeId) {
      return { status: 400, body: { success: false, error: 'معرّف الموظف مفقود في الطلب' } };
    }

    const allocationRefs = (
      await firestore.collection('leave_allocations').where('employeeId', '==', preloadEmployeeId).get()
    ).docs.map((d) => d.ref);

    const result = await firestore.runTransaction(async (transaction) => {
      const requestRef = firestore.collection('leave_requests').doc(leaveRequestId);
      const requestSnap = await transaction.get(requestRef);
      if (!requestSnap.exists) {
        throw new Error('طلب الإجازة غير موجود');
      }

      const storedRequest = requestSnap.data() || {};
      if (normalizeLeaveStatus(storedRequest.status) === 'APPROVED') {
        throw new Error('تم اعتماد طلب الإجازة مسبقًا');
      }

      const employeeId = String(storedRequest.employeeId || '').trim();
      if (!employeeId) throw new Error('معرّف الموظف مفقود في الطلب');

      if (storedRequest.companyId && String(storedRequest.companyId) !== companyId) {
        throw new Error('طلب الإجازة لا يتبع الشركة النشطة');
      }

      const employeeRef = firestore.collection('employees').doc(employeeId);
      const employeeSnap = await transaction.get(employeeRef);
      if (!employeeSnap.exists) {
        throw new Error('ملف الموظف غير موجود');
      }

      const employeeData = employeeSnap.data() || {};
      if (employeeData.companyId && String(employeeData.companyId) !== companyId) {
        throw new Error('الموظف لا يتبع الشركة النشطة');
      }

      const normalizedLeaveType = normalizeLeaveType(storedRequest.leaveType);
      const requestedDays = roundDays(
        Number(storedRequest.totalDays ?? storedRequest.daysCount ?? storedRequest.days ?? 0)
      );
      if (requestedDays <= 0) {
        throw new Error('عدد أيام الإجازة غير صالح');
      }

      const isAnnual = normalizedLeaveType === 'ANNUAL';

      const allocationSnaps = await Promise.all(allocationRefs.map((ref) => transaction.get(ref)));

      type AllocationRow = Record<string, unknown> & { id: string };
      let allocationDocs: AllocationRow[] = allocationSnaps
        .filter((snap) => snap.exists)
        .map((snap) => ({ id: snap.id, ...(snap.data() as Record<string, unknown>) }) as AllocationRow)
        .filter((allocation) => {
          if (allocation.companyId && String(allocation.companyId) !== companyId) return false;
          const type = String(allocation.leaveType || 'ANNUAL').toUpperCase();
          const state = String(allocation.state || 'validate').toLowerCase();
          return isAnnual && type === 'ANNUAL' && ['validate', 'validated', 'confirm'].includes(state);
        })
        .sort((left, right) =>
          String(left.dateFrom || left.allocationDate || '').localeCompare(
            String(right.dateFrom || right.allocationDate || '')
          )
        );

      if (isAnnual && allocationDocs.length === 0) {
        const documentedOpeningBalance = Number(
          employeeData.openingBalance ??
            employeeData.carriedOverBalance ??
            employeeData.carriedOverLeave2025 ??
            (employeeData.leaveBalance as { annualRemaining?: number } | undefined)?.annualRemaining ??
            0
        );
        if (documentedOpeningBalance > 0) {
          const allocationId = `ALLOC-${companyId}-${employeeId}-opening`;
          const allocationRef = firestore.collection('leave_allocations').doc(allocationId);
          const allocation = {
            id: allocationId,
            employeeId,
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
            createdAt: new Date().toISOString(),
          };
          transaction.set(allocationRef, allocation, { merge: true });
          allocationDocs = [allocation];
        }
      }

      const totalAvailableBefore = allocationDocs.reduce((sum, allocation) => {
        const totalDays = Number(allocation.numberOfDays ?? allocation.days ?? 0);
        const consumedDays = Number(allocation.consumedDays || 0);
        const encashedDays = Number(allocation.encashedDays || 0);
        return sum + Math.max(0, totalDays - consumedDays - encashedDays);
      }, 0);

      const priorLeaveBalance = (employeeData.leaveBalance || {}) as Record<string, unknown>;
      const scalarRemaining = Number(
        priorLeaveBalance.annualRemaining ??
          employeeData.remaining_leaves ??
          employeeData.leaveBalance ??
          employeeData.paid_days_remaining ??
          0
      );
      const balanceBefore = isAnnual
        ? (totalAvailableBefore > 0 ? totalAvailableBefore : scalarRemaining)
        : scalarRemaining;

      if (isAnnual && requireFullAnnualBalance && balanceBefore < requestedDays) {
        throw new Error(
          `رصيد الإجازة السنوية غير كافٍ (المتاح ${balanceBefore} يوم، المطلوب ${requestedDays} يوم)`
        );
      }

      let remainingToDeduct = isAnnual ? requestedDays : 0;
      const allocationBreakdown: Array<{ allocationId: string; daysUsed: number }> = [];

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
        const allocationRef = firestore.collection('leave_allocations').doc(String(allocation.id));

        transaction.set(
          allocationRef,
          {
            consumedDays: nextConsumedDays,
            remainingDays: nextRemainingDays,
            companyId,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        allocationBreakdown.push({ allocationId: String(allocation.id), daysUsed });
        remainingToDeduct = roundDays(remainingToDeduct - daysUsed);
      }

      const paidDays = isAnnual ? roundDays(requestedDays - remainingToDeduct) : requestedDays;
      const unpaidDays = isAnnual ? remainingToDeduct : 0;
      const annualRemaining = isAnnual ? roundDays(Math.max(0, balanceBefore - paidDays)) : balanceBefore;

      const now = new Date().toISOString();
      const startDate = String(storedRequest.startDate || '');
      const endDate = String(storedRequest.endDate || startDate);

      transaction.set(
        requestRef,
        {
          companyId,
          leaveType: normalizedLeaveType,
          status: 'APPROVED',
          totalDays: requestedDays,
          paidDays,
          unpaidDays,
          aysed_paid_days: paidDays,
          aysed_unpaid_days: unpaidDays,
          allocationBreakdown,
          hrApprovedBy: approver,
          hrApprovedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      const nextLeaveBalance = {
        annualEntitlement: 30,
        annualRemaining,
        lastApprovedLeaveId: leaveRequestId,
        lastSyncedAt: now,
      };

      transaction.set(
        employeeRef,
        {
          companyId,
          remaining_leaves: annualRemaining,
          leaveBalance: nextLeaveBalance,
          paid_days_remaining: annualRemaining,
          updatedAt: now,
        },
        { merge: true }
      );

      const workEntryId = `WE-LEAVE-${companyId}-${leaveRequestId}`;
      const workEntryRef = firestore.collection('work_entries').doc(workEntryId);
      transaction.set(
        workEntryRef,
        {
          id: workEntryId,
          companyId,
          employeeId,
          leaveRequestId,
          entryType: 'LEAVE',
          leaveType: normalizedLeaveType,
          dateFrom: startDate,
          dateTo: endDate,
          days: requestedDays,
          paidDays,
          unpaidDays,
          state: 'validated',
          source: 'leave_approval_atomic',
          kuwaitLawRef: isAnnual ? 'annual_art_70' : normalizedLeaveType === 'SICK' ? 'sick_art_69_70' : 'other',
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      return {
        paidDays,
        unpaidDays,
        annualRemaining,
        allocationBreakdown,
        workEntryId,
      };
    });

    return {
      status: 200,
      body: {
        success: true,
        data: result,
        source: 'leave_approve_atomic',
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل اعتماد الإجازة';
    return { status: 400, body: { success: false, error: message } };
  }
}
