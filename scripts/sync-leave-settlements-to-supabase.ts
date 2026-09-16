/**
 * Mirror Firestore `leave_settlements` into Supabase `leave_settlements`.
 * Optional: pass --from-json path/to/vouchers.json (array of LeaveSettlementVoucher).
 *
 * Usage: npx tsx scripts/sync-leave-settlements-to-supabase.ts
 *        npx tsx scripts/sync-leave-settlements-to-supabase.ts --from-json ./export.json
 */
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { upsertLeaveSettlementToSupabase } from '../src/services/leaveSupabaseSync';
import { LeaveSettlementVoucher } from '../src/types';

dotenv.config();

async function syncFromFirestore(companyFilter?: string) {
  const snap = await getDocs(collection(db, 'leave_settlements'));
  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as LeaveSettlementVoucher;
    const voucher = { ...data, id: docSnap.id } as LeaveSettlementVoucher;
    const companyId = voucher.companyId || (data as any).company_id;

    if (companyFilter && companyId && companyId !== companyFilter) {
      skipped++;
      continue;
    }

    if (!voucher.employeeId) {
      skipped++;
      continue;
    }

    const ok = await upsertLeaveSettlementToSupabase(voucher, companyId, true);
    if (ok) synced++;
    else failed++;
  }

  return { total: snap.size, synced, failed, skipped };
}

async function syncFromJson(filePath: string, companyFilter?: string) {
  const raw = readFileSync(filePath, 'utf8');
  const vouchers = JSON.parse(raw) as LeaveSettlementVoucher[];
  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const voucher of vouchers) {
    const companyId = voucher.companyId || (voucher as any).company_id;
    if (companyFilter && companyId && companyId !== companyFilter) {
      skipped++;
      continue;
    }
    if (!voucher.id || !voucher.employeeId) {
      skipped++;
      continue;
    }

    const ok = await upsertLeaveSettlementToSupabase(voucher, companyId, true);
    if (ok) synced++;
    else failed++;
  }

  return { total: vouchers.length, synced, failed, skipped };
}

async function main() {
  const companyIdx = process.argv.indexOf('--company-id');
  const companyFilter = companyIdx >= 0 ? process.argv[companyIdx + 1] : undefined;
  const jsonIdx = process.argv.indexOf('--from-json');
  const jsonPath = jsonIdx >= 0 ? process.argv[jsonIdx + 1] : undefined;

  const result = jsonPath
    ? await syncFromJson(jsonPath, companyFilter)
    : await syncFromFirestore(companyFilter);

  const source = jsonPath ? `JSON ${jsonPath}` : 'Firestore leave_settlements';
  console.log(`[sync-leave-settlements] ${source} → Supabase`);
  console.log(`  total docs: ${result.total}`);
  console.log(`  synced:     ${result.synced}`);
  console.log(`  failed:     ${result.failed}`);
  console.log(`  skipped:    ${result.skipped}`);
}

main().catch(err => {
  console.error('[sync-leave-settlements] failed:', err);
  process.exit(1);
});
