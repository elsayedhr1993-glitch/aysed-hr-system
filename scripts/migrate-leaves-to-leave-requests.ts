/**
 * One-time migration: copy Firestore `leaves` → `leave_requests` (+ optional Supabase mirror).
 *
 * Usage:
 *   npx tsx scripts/migrate-leaves-to-leave-requests.ts
 *   npx tsx scripts/migrate-leaves-to-leave-requests.ts --delete-source
 *   npm run leaves:purge-legacy   (migrate + delete all legacy docs)
 *   npx tsx scripts/migrate-leaves-to-leave-requests.ts --company-id comp-main
 *   npx tsx scripts/migrate-leaves-to-leave-requests.ts --sync-supabase
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
  const deleteSource = args.includes('--delete-source');
  const syncSupabase = args.includes('--sync-supabase') || isSupabaseConfigured(true);
  const companyIdx = args.indexOf('--company-id');
  const companyId = companyIdx >= 0 ? args[companyIdx + 1] : undefined;
  return { deleteSource, syncSupabase, companyId };
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
    state: statusRaw === 'validate' ? 'validate' : undefined,
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

async function migrateLeavesCollection() {
  const { deleteSource, syncSupabase, companyId } = parseArgs();

  const sourceSnap = await getDocs(collection(db, SOURCE_COLLECTION));
  let migrated = 0;
  let skipped = 0;
  let deleted = 0;
  let supabaseSynced = 0;
  let supabaseFailed = 0;

  for (const sourceDoc of sourceSnap.docs) {
    const data = sourceDoc.data() as Record<string, unknown>;
    const recordCompanyId = String(data.companyId || data.company_id || '');

    if (companyId && recordCompanyId && recordCompanyId !== companyId) {
      skipped++;
      continue;
    }

    const normalized = normalizeLeaveRecord(data, sourceDoc.id);
    const targetId = String(normalized.id || sourceDoc.id);

    await setDoc(doc(db, TARGET_COLLECTION, targetId), normalized, { merge: true });
    migrated++;

    if (syncSupabase) {
      const leaveReq = toLeaveRequest(normalized as Record<string, unknown>, targetId);
      const ok = await upsertLeaveToSupabase(leaveReq, recordCompanyId || companyId, true);
      if (ok) supabaseSynced++;
      else supabaseFailed++;
    }

    if (deleteSource) {
      await deleteDoc(doc(db, SOURCE_COLLECTION, sourceDoc.id));
      deleted++;
    }
  }

  console.log(`[migrate-leaves] source="${SOURCE_COLLECTION}" target="${TARGET_COLLECTION}"`);
  console.log(`  migrated: ${migrated}`);
  console.log(`  skipped:  ${skipped}`);
  if (syncSupabase) {
    console.log(`  supabase synced: ${supabaseSynced}`);
    if (supabaseFailed > 0) console.log(`  supabase failed:  ${supabaseFailed}`);
  } else {
    console.log('  supabase: skipped (set VITE_SUPABASE_URL + key or pass --sync-supabase)');
  }
  if (deleteSource) {
    console.log(`  deleted from source: ${deleted}`);
  } else {
    console.log('  source kept (pass --delete-source to remove after copy)');
  }
}

migrateLeavesCollection().catch(error => {
  console.error('[migrate-leaves] failed:', error);
  process.exit(1);
});
