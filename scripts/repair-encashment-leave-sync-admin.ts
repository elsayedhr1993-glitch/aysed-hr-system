/**
 * Sync encash-leave-{voucherId} rows in leave_requests with locked settlement vouchers (SSOT: encashedLeaveDays).
 *
 * Usage:
 *   npx tsx scripts/repair-encashment-leave-sync-admin.ts --dry-run
 *   npx tsx scripts/repair-encashment-leave-sync-admin.ts --apply
 *   npx tsx scripts/repair-encashment-leave-sync-admin.ts --apply --companyId=comp-1788442584841
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import {
  buildEncashmentLeaveRequestFromSettlement,
  encashmentLeaveRequestIdForSettlement,
  cleanDayDecimals,
} from '../src/services/leaveSettlementService.ts';
import type { Employee, LeaveSettlementVoucher } from '../src/types.ts';

const MANAR_COMPANY_ID = 'comp-1788442584841';

function parseArgs() {
  const apply = process.argv.includes('--apply');
  const companyArg = process.argv.find((a) => a.startsWith('--companyId='));
  const companyId = companyArg?.split('=')[1]?.trim() || MANAR_COMPANY_ID;
  return { apply, companyId };
}

function isLockedSettlement(v: LeaveSettlementVoucher): boolean {
  const status = String(v.status || '').toLowerCase();
  return status === 'settled_locked' || status === 'paid' || status === 'validated';
}

function settlementEncashDays(v: LeaveSettlementVoucher): number {
  const encash = Number(v.encashedLeaveDays || 0);
  if (encash > 0) return cleanDayDecimals(encash);
  if (v.settlementMode === 'ENCASHMENT_LIQUIDATION') {
    return cleanDayDecimals(Number(v.consumedLeaveDays || 0));
  }
  return 0;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(obj)) {
    if (val !== undefined) out[k] = val;
  }
  return out as T;
}

async function loadEmployeesByCompany(db: ReturnType<typeof getAdminFirestore>, companyId: string) {
  const snap = await db.collection('employees').where('companyId', '==', companyId).get();
  const byId = new Map<string, Employee & { id: string }>();
  const byCode = new Map<string, Employee & { id: string }>();
  snap.docs.forEach((d) => {
    const row = { id: d.id, ...d.data() } as Employee & { id: string };
    byId.set(d.id, row);
    const code = String(row.employeeCode || '').trim();
    if (code) byCode.set(code, row);
  });
  return { byId, byCode };
}

function resolveEmployeeForVoucher(
  v: LeaveSettlementVoucher & { id: string },
  byId: Map<string, Employee & { id: string }>,
  byCode: Map<string, Employee & { id: string }>
): (Employee & { id: string }) | null {
  const empId = String(v.employeeId || '').trim();
  if (empId && byId.has(empId)) return byId.get(empId)!;
  if (empId && byCode.has(empId)) return byCode.get(empId)!;
  const code = String(v.employeeCode || '').trim();
  if (code && byCode.has(code)) return byCode.get(code)!;
  return null;
}

async function main() {
  const { apply, companyId } = parseArgs();
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT)');

  console.log(apply ? '[APPLY] Writing encash leave rows' : '[DRY-RUN] No writes', { companyId });

  const { byId, byCode } = await loadEmployeesByCompany(db, companyId);
  const settlementsSnap = await db.collection('leave_settlements').where('companyId', '==', companyId).get();

  let scanned = 0;
  let needsRepair = 0;
  let written = 0;
  let skippedNoEmployee = 0;
  let skippedNoEncash = 0;
  const orphans: string[] = [];

  for (const docSnap of settlementsSnap.docs) {
    const voucher = { id: docSnap.id, ...docSnap.data() } as LeaveSettlementVoucher & { id: string };
    scanned += 1;
    if (!isLockedSettlement(voucher)) continue;

    const encashDays = settlementEncashDays(voucher);
    if (encashDays <= 0) {
      skippedNoEncash += 1;
      continue;
    }

    const employee = resolveEmployeeForVoucher(voucher, byId, byCode);
    if (!employee) {
      skippedNoEmployee += 1;
      console.warn('No employee for voucher', voucher.voucherNumber, voucher.id, voucher.employeeId, voucher.employeeCode);
      continue;
    }

    const leaveId = encashmentLeaveRequestIdForSettlement(voucher.id);
    const expected = buildEncashmentLeaveRequestFromSettlement(employee, encashDays, {
      settlementVoucherId: voucher.id,
      settlementVoucherNumber: voucher.voucherNumber,
      settlementDate: voucher.settlementDate || voucher.createdAt?.slice(0, 10),
      netPayoutKwd: Number(voucher.netSettlementPayout || 0),
    });

    const existingSnap = await db.collection('leave_requests').doc(leaveId).get();
    const existing = existingSnap.exists ? existingSnap.data() : null;
    const existingDays = cleanDayDecimals(
      Number(existing?.daysCount ?? existing?.totalDays ?? existing?.paidDays ?? 0)
    );
    const mismatch =
      !existingSnap.exists ||
      existingDays !== encashDays ||
      existing?.isEncashment !== true ||
      String(existing?.companyId || '') !== String(companyId);

    if (mismatch) {
      needsRepair += 1;
      console.log(
        mismatch && existingSnap.exists ? 'MISMATCH' : 'MISSING',
        leaveId,
        `voucher=${voucher.voucherNumber}`,
        `expectedDays=${encashDays}`,
        existingSnap.exists ? `currentDays=${existingDays}` : 'no row'
      );
      if (apply) {
        const payload = stripUndefined({ ...expected, companyId: employee.companyId || companyId });
        await db.collection('leave_requests').doc(leaveId).set(payload, { merge: true });
        written += 1;
      }
    }
  }

  const encashSnap = await db.collection('leave_requests').where('companyId', '==', companyId).get();
  for (const d of encashSnap.docs) {
    if (!d.id.startsWith('encash-leave-')) continue;
    const voucherId = d.id.replace(/^encash-leave-/, '');
    const voucherDoc = await db.collection('leave_settlements').doc(voucherId).get();
    if (!voucherDoc.exists) {
      orphans.push(d.id);
    }
  }

  console.log(
    JSON.stringify(
      {
        companyId,
        mode: apply ? 'apply' : 'dry-run',
        settlementsScanned: scanned,
        repairsNeeded: needsRepair,
        writes: written,
        skippedNoEmployee,
        skippedNoEncash,
        orphanEncashRows: orphans,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
