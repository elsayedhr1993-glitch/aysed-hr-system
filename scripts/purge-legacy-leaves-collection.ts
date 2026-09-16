/**
 * Migrate any remaining Firestore `leaves` docs → `leave_requests`, then delete the legacy collection.
 *
 * Usage:
 *   npx tsx scripts/purge-legacy-leaves-collection.ts
 *   npx tsx scripts/purge-legacy-leaves-collection.ts --dry-run
 *   npx tsx scripts/purge-legacy-leaves-collection.ts --skip-migrate
 */
import dotenv from 'dotenv';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../src/lib/firebase';
import { isSupabaseConfigured } from '../src/lib/supabase';
import { upsertLeaveToSupabase } from '../src/services/leaveSupabaseSync';
import { LeaveRequest } from '../src/types';

dotenv.config();

const SOURCE_COLLECTION = 'leaves';
const TARGET_COLLECTION = 'leave_requests';

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    skipMigrate: args.includes('--skip-migrate'),
    syncSupabase: args.includes('--sync-supabase') || isSupabaseConfigured(true),
  };
}

function normalizeLeaveRecord(raw: Record<string, unknown>, docId: string) {
  const statusRaw = String(raw.status || raw.state || 'APPROVED').toLowerCase();
  const status =
    statusRaw === 'validate' || statusRaw === 'validated' || statusRaw === 'approved'
      ? 'APPROVED'
      : String(raw.status || 'APPROVED').toUpperCase();

  return cleanFirestoreData({
    ...raw,
    id: raw.id || docId,
    employeeId: raw.employeeId || raw.employee_id,
    companyId: raw.companyId || raw.company_id,
    leaveType: raw.leaveType || raw.leave_type || raw.type || 'ANNUAL',
    startDate: raw.startDate || raw.start_date,
    endDate: raw.endDate || raw.end_date,
    totalDays: raw.totalDays ?? raw.days ?? raw.numberOfDays ?? 0,
    paidDays: raw.paidDays ?? raw.aysed_paid_days,
    unpaidDays: raw.unpaidDays ?? raw.aysed_unpaid_days,
    status,
    migratedFrom: SOURCE_COLLECTION,
    migratedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function toLeaveRequest(normalized: Record<string, unknown>, targetId: string): LeaveRequest {
  return {
    id: targetId,
    companyId: String(normalized.companyId || ''),
    employeeId: String(normalized.employeeId || ''),
    leaveType: (normalized.leaveType || 'ANNUAL') as LeaveRequest['leaveType'],
    startDate: String(normalized.startDate || ''),
    endDate: String(normalized.endDate || ''),
    totalDays: Number(normalized.totalDays || 0),
    paidDays: normalized.paidDays !== undefined ? Number(normalized.paidDays) : undefined,
    unpaidDays: normalized.unpaidDays !== undefined ? Number(normalized.unpaidDays) : undefined,
    reason: String(normalized.reason || ''),
    status: (normalized.status || 'APPROVED') as LeaveRequest['status'],
    validatedBy: normalized.validatedBy as string | undefined,
    validatedAt: normalized.validatedAt as string | undefined,
    createdAt: String(normalized.createdAt || new Date().toISOString()),
  };
}

async function main() {
  const { dryRun, skipMigrate, syncSupabase } = parseArgs();

  const sourceSnap = await getDocs(collection(db, SOURCE_COLLECTION));
  const targetSnap = await getDocs(collection(db, TARGET_COLLECTION));

  console.log('=== Purge legacy Firestore collection: leaves ===\n');
  console.log(`  ${SOURCE_COLLECTION}: ${sourceSnap.size} doc(s)`);
  console.log(`  ${TARGET_COLLECTION}: ${targetSnap.size} doc(s)`);
  console.log(`  dry-run: ${dryRun ? 'yes' : 'no'}`);
  console.log(`  skip-migrate: ${skipMigrate ? 'yes' : 'no'}`);
  console.log(`  supabase sync: ${syncSupabase ? 'yes' : 'no'}\n`);

  let migrated = 0;
  let supabaseSynced = 0;
  let deleted = 0;

  if (!skipMigrate) {
    for (const sourceDoc of sourceSnap.docs) {
      const data = sourceDoc.data() as Record<string, unknown>;
      const normalized = normalizeLeaveRecord(data, sourceDoc.id);
      const targetId = String(normalized.id || sourceDoc.id);
      const companyId = String(normalized.companyId || '');

      if (!dryRun) {
        await setDoc(doc(db, TARGET_COLLECTION, targetId), normalized, { merge: true });

        if (syncSupabase) {
          const leaveReq = toLeaveRequest(normalized as Record<string, unknown>, targetId);
          const ok = await upsertLeaveToSupabase(leaveReq, companyId, true);
          if (ok) supabaseSynced++;
        }
      }

      migrated++;
    }
  }

  for (const sourceDoc of sourceSnap.docs) {
    if (!dryRun) {
      await deleteDoc(doc(db, SOURCE_COLLECTION, sourceDoc.id));
    }
    deleted++;
  }

  const verifySnap = dryRun ? sourceSnap : await getDocs(collection(db, SOURCE_COLLECTION));

  console.log('Results:');
  console.log(`  migrated to ${TARGET_COLLECTION}: ${migrated}`);
  if (syncSupabase) console.log(`  supabase synced: ${supabaseSynced}`);
  console.log(`  deleted from ${SOURCE_COLLECTION}: ${deleted}`);
  console.log(`  remaining in ${SOURCE_COLLECTION}: ${verifySnap.size}`);

  if (verifySnap.size === 0) {
    console.log('\n✅ Legacy collection `leaves` is empty. Safe to ignore going forward.');
  } else if (dryRun) {
    console.log('\n⚠ Dry-run only — re-run without --dry-run to apply.');
  } else {
    console.log('\n❌ Some documents remain in `leaves`. Re-run or inspect manually.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[purge-legacy-leaves] failed:', err);
  process.exit(1);
});
