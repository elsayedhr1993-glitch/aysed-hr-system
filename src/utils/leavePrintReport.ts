import type { LeaveRequest, LeaveSettlementVoucher } from '../types';
import { matchesEmployeeIdentity, resolveLeavePaidUnpaidSplit } from './leaveEngine';
import { isAnnualLeaveType, normalizeLeaveStatus } from './leaveModel';

export function isEncashmentLeaveRequest(leave: unknown): boolean {
  if (!leave || typeof leave !== 'object') return false;
  const row = leave as Record<string, unknown>;
  const id = String(row.id || '');
  const reason = String(row.reason || '');
  const hrNote = String(row.hrNote || '');
  return (
    id.startsWith('encash-leave') ||
    /تصفية\s*نقدية|Encashment\s*&\s*Liquidation/i.test(reason) ||
    /سند التسوية|تسييل\s*رصيد/i.test(hrNote)
  );
}

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

export function sumEncashmentDaysFromLog(rows: LeavePrintLogRow[]): number {
  return rows
    .filter((r) => r.kind === 'encashment' || r.kind === 'settlement_voucher')
    .reduce((sum, r) => sum + Number(r.paidDays || 0), 0);
}
