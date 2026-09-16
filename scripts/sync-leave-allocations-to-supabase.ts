/**
 * Mirror Firestore `leave_allocations` into Supabase `leave_allocations`.
 *
 * Usage: npx tsx scripts/sync-leave-allocations-to-supabase.ts
 *        npx tsx scripts/sync-leave-allocations-to-supabase.ts --company-id comp-main
 */
import dotenv from 'dotenv';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { upsertLeaveAllocationToSupabase } from '../src/services/leaveSupabaseSync';
import { HrLeaveAllocation } from '../src/types';

dotenv.config();

async function main() {
  const companyIdx = process.argv.indexOf('--company-id');
  const companyFilter = companyIdx >= 0 ? process.argv[companyIdx + 1] : undefined;

  const snap = await getDocs(collection(db, 'leave_allocations'));
  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as HrLeaveAllocation;
    const allocation = { ...data, id: docSnap.id } as HrLeaveAllocation;
    const companyId = allocation.companyId || (data as any).company_id;

    if (companyFilter && companyId && companyId !== companyFilter) {
      skipped++;
      continue;
    }

    if (!allocation.employeeId) {
      skipped++;
      continue;
    }

    const ok = await upsertLeaveAllocationToSupabase(allocation, companyId, true);
    if (ok) synced++;
    else failed++;
  }

  console.log('[sync-leave-allocations] Firestore leave_allocations → Supabase');
  console.log(`  total docs: ${snap.size}`);
  console.log(`  synced:     ${synced}`);
  console.log(`  failed:     ${failed}`);
  console.log(`  skipped:    ${skipped}`);
}

main().catch(err => {
  console.error('[sync-leave-allocations] failed:', err);
  process.exit(1);
});
