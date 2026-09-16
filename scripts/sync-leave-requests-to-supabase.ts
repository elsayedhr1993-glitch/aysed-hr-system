/**
 * Mirror all Firestore `leave_requests` documents into Supabase `leave_requests`.
 *
 * Usage: npx tsx scripts/sync-leave-requests-to-supabase.ts
 *        npx tsx scripts/sync-leave-requests-to-supabase.ts --company-id comp-main
 */
import dotenv from 'dotenv';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { upsertLeaveToSupabase } from '../src/services/leaveSupabaseSync';
import { LeaveRequest } from '../src/types';

dotenv.config();

async function main() {
  const companyIdx = process.argv.indexOf('--company-id');
  const companyFilter = companyIdx >= 0 ? process.argv[companyIdx + 1] : undefined;

  const snap = await getDocs(collection(db, 'leave_requests'));
  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as LeaveRequest;
    const leave = { ...data, id: docSnap.id } as LeaveRequest;
    const companyId = leave.companyId || (data as any).company_id;

    if (companyFilter && companyId && companyId !== companyFilter) {
      skipped++;
      continue;
    }

    const ok = await upsertLeaveToSupabase(leave, companyId, true);
    if (ok) synced++;
    else failed++;
  }

  console.log('[sync-leave-requests] Firestore leave_requests → Supabase');
  console.log(`  total docs: ${snap.size}`);
  console.log(`  synced:     ${synced}`);
  console.log(`  failed:     ${failed}`);
  console.log(`  skipped:    ${skipped}`);
}

main().catch(err => {
  console.error('[sync-leave-requests] failed:', err);
  process.exit(1);
});
