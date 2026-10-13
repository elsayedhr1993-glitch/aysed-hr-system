import type { LeaveRequest, LeaveSettlementVoucher } from '../types';
import {
  matchesEmployeeIdentity,
  resolveLeavePaidUnpaidSplit,
  shrinkLeaveBucketsAfterPaidDays,
  type EmployeeLeaveSummary,
} from './leaveEngine';
import { resolveLeaveRequestDayCount } from './leaveModel';
import { isAnnualLeaveType, isEncashmentLeaveRequest, normalizeLeaveStatus } from './leaveModel';

export { isEncashmentLeaveRequest } from './leaveModel';

export type LeavePrintLogRowKind = 'annual_leave' | 'encashment' | 'settlement_voucher';

export interface LeavePrintLogRow {
  key: string;
  kind: LeavePrintLogRowKind;
  startDate: string;
  endDate: string;
  totalDays: number;
  paidDays: number;
  unpaidDays: number;
  reason: string;
  statusLabel: string;
  voucherNumber?: string;
  netPayoutKwd?: number;
}

function voucherReferencedInLeave(leave: LeaveRequest, voucherNumber: string): boolean {
  const blob = `${leave.hrNote || ''} ${leave.reason || ''}`;
  return blob.includes(voucherNumber);
}

function settlementDays(v: LeaveSettlementVoucher): number {
  const encash = Number(v.encashedLeaveDays || 0);
  const consumed = Number(v.consumedLeaveDays || 0);
  if (v.settlementMode === 'ENCASHMENT_LIQUIDATION') {
    return encash > 0 ? encash : consumed;
  }
  return encash + consumed;
}

export function buildLeavePrintLogRows(
  employee: Record<string, unknown>,
  leaves: LeaveRequest[],
  vouchers: LeaveSettlementVoucher[] = [],
  openingPool: number
): LeavePrintLogRow[] {
  const employeeLeaves = (leaves || []).filter((l) => matchesEmployeeIdentity(l, employee));

  const movementLeaves = employeeLeaves.filter((l) => {
    const status = normalizeLeaveStatus(l.status);
    if (status !== 'APPROVED' && status !== 'RETURNED') return false;
    return isAnnualLeaveType(l.leaveType) || isEncashmentLeaveRequest(l);
  });

  let runningPool = Math.max(0, openingPool);
  const rows: LeavePrintLogRow[] = [];

  for (const leave of [...movementLeaves].sort((a, b) =>
    String(a.startDate || '').localeCompare(String(b.startDate || ''))
  )) {
    const split = resolveLeavePaidUnpaidSplit(leave, runningPool);
    runningPool = Math.max(0, runningPool - split.paid);
    const encash = isEncashmentLeaveRequest(leave);
    rows.push({
      key: String(leave.id || `leave-${leave.startDate}`),
      kind: encash ? 'encashment' : 'annual_leave',
      startDate: String(leave.startDate || '—'),
      endDate: String(leave.endDate || leave.startDate || '—'),
      totalDays: split.total,
      paidDays: split.paid,
      unpaidDays: split.unpaid,
      reason: encash
        ? leave.reason || 'تصفية نقدية لرصيد الإجازة (تسوية / تسييل)'
        : leave.reason || 'إجازة سنوية اعتيادية',
      statusLabel: encash ? 'تسييل / تصفية' : 'معتمد',
    });
  }

  const employeeVouchers = (vouchers || []).filter((v) => {
    if (matchesEmployeeIdentity({ employeeId: v.employeeId, civilId: v.civilId }, employee)) {
      return true;
    }
    const empCode = String(employee.employeeCode || '').trim();
    return Boolean(empCode && v.employeeCode === empCode);
  });

  for (const row of rows) {
    if (row.kind !== 'encashment' || row.voucherNumber) continue;
    const match = employeeVouchers.find(
      (v) => Math.abs(settlementDays(v) - row.paidDays) < 0.02
    );
    if (match) {
      row.voucherNumber = match.voucherNumber;
      row.netPayoutKwd = Number(match.netSettlementPayout || 0);
      row.reason = `${row.reason} — سند ${match.voucherNumber}`;
    }
  }

  for (const voucher of [...employeeVouchers].sort((a, b) =>
    String(a.settlementDate || a.createdAt || '').localeCompare(String(b.settlementDate || b.createdAt || ''))
  )) {
    const days = settlementDays(voucher);
    if (days <= 0 && Number(voucher.netSettlementPayout || 0) <= 0) continue;

    const coveredByEncashLeave = movementLeaves.some((l) =>
      isEncashmentLeaveRequest(l) && voucherReferencedInLeave(l, voucher.voucherNumber)
    );
    const coveredByRow = rows.some((r) => r.voucherNumber === voucher.voucherNumber);
    if (coveredByEncashLeave || coveredByRow) {
      rows.forEach((r) => {
        if (r.kind === 'encashment' && !r.voucherNumber) {
          const matchLeave = movementLeaves.find(
            (l) => isEncashmentLeaveRequest(l) && String(l.id) === r.key
          );
          if (matchLeave && voucherReferencedInLeave(matchLeave, voucher.voucherNumber)) {
            r.voucherNumber = voucher.voucherNumber;
            r.netPayoutKwd = Number(voucher.netSettlementPayout || 0);
          }
        }
      });
      continue;
    }

    rows.push({
      key: `voucher-${voucher.id}`,
      kind: 'settlement_voucher',
      startDate: String(voucher.settlementDate || voucher.createdAt?.slice(0, 10) || '—'),
      endDate: String(voucher.settlementDate || voucher.createdAt?.slice(0, 10) || '—'),
      totalDays: days,
      paidDays: days,
      unpaidDays: 0,
      reason:
        voucher.settlementMode === 'ENCASHMENT_LIQUIDATION'
          ? `سند تسوية ${voucher.voucherNumber} — صرف رصيد بدون إجازة (تسييل)`
          : `سند تسوية ${voucher.voucherNumber}`,
      statusLabel: 'سند معتمد / مقفل',
      voucherNumber: voucher.voucherNumber,
      netPayoutKwd: Number(voucher.netSettlementPayout || 0),
    });
  }

  return rows.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
}

function settlementEncashDays(v: LeaveSettlementVoucher): number {
  const encash = Number(v.encashedLeaveDays || 0);
  if (encash > 0) return encash;
  return Number((v as { aysed_paid_days?: number }).aysed_paid_days || 0);
}

function isLockedSettlement(v: LeaveSettlementVoucher): boolean {
  const status = String(v.status || '').toLowerCase();
  return status === 'settled_locked' || status === 'paid' || status === 'validated';
}

/**
 * Encashment days for UI/reports — settlement voucher is SSOT when linked; avoids 9.69 vs 30.50 drift.
 */
export function computeEmployeeEncashmentDays(
  employee: unknown,
  leaves: LeaveRequest[] = [],
  settlements: LeaveSettlementVoucher[] = []
): number {
  const encashLeaves = (leaves || []).filter(
    (l) => matchesEmployeeIdentity(l, employee) && isEncashmentLeaveRequest(l)
  );
  const empVouchers = (settlements || []).filter(
    (v) => matchesEmployeeIdentity(v, employee) && isLockedSettlement(v) && settlementEncashDays(v) > 0
  );

  let total = 0;
  const voucherNumbersSeen = new Set<string>();

  for (const v of empVouchers) {
    const vDays = settlementEncashDays(v);
    const vNo = String(v.voucherNumber || '').trim();
    const linkedDays = encashLeaves
      .filter((l) => vNo && voucherReferencedInLeave(l, vNo))
      .reduce((sum, l) => sum + resolveLeaveRequestDayCount(l), 0);
    total += Math.max(vDays, linkedDays);
    if (vNo) voucherNumbersSeen.add(vNo);
  }

  for (const l of encashLeaves) {
    const blob = `${l.hrNote || ''} ${l.reason || ''}`;
    const refsKnownVoucher = empVouchers.some((v) => {
      const vNo = String(v.voucherNumber || '').trim();
      return vNo && blob.includes(vNo);
    });
    if (!refsKnownVoucher) {
      total += resolveLeaveRequestDayCount(l);
    }
  }

  if (total > 0) return Number(total.toFixed(2));
  return Number(
    encashLeaves.reduce((sum, l) => sum + resolveLeaveRequestDayCount(l), 0).toFixed(2)
  );
}

export function sumEncashmentDaysFromLog(rows: LeavePrintLogRow[]): number {
  const encashRows = rows.filter((r) => r.kind === 'encashment');
  if (encashRows.length > 0) {
    return encashRows.reduce((sum, r) => sum + Number(r.paidDays || r.totalDays || 0), 0);
  }
  return rows
    .filter((r) => r.kind === 'settlement_voucher')
    .reduce((sum, r) => sum + Number(r.paidDays || r.totalDays || 0), 0);
}

/** Report KPIs: encashment is excluded from leave engine totals but must reduce net balance on print. */
export function buildLeaveReportKpis(
  summary: EmployeeLeaveSummary,
  encashTaken: number,
  openingPool: number
) {
  const encash = Math.max(0, Number(encashTaken.toFixed(2)));
  const annualTaken = Math.max(0, Number(summary.usedLeaveDays || 0));
  const totalDeducted = Number((annualTaken + encash).toFixed(2));
  const unpaidExcess = Number(summary.unpaidLeaveDays || 0);
  const netAvailable = Math.max(0, Number((openingPool - totalDeducted).toFixed(2)));
  const fifoRemaining = shrinkLeaveBucketsAfterPaidDays(encash, {
    carriedOver: Number(summary.remainingCarried ?? 0),
    accrued: Number(summary.remainingAccrued ?? 0),
    compensatory: Number(summary.remainingComp ?? 0),
  });
  return {
    annualTaken,
    encashTaken: encash,
    totalDeducted,
    netAvailable,
    unpaidExcess,
    fifoRemaining,
  };
}
