/**
 * Server-side runner (Firebase Admin) — same policy as employeeCrossTenantSelfHeal.
 * Used for one-shot ops when Web SDK auth is unavailable in Node.
 */
import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const CANONICAL = 'comp-1788442584841';
const CIVIL = '293080106877';

function loadServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  return null;
}

function normCompany(id: string) {
  return String(id || '').trim().replace(/_/g, '-');
}

function pickCivil(data: Record<string, unknown>) {
  return String(data.civilId ?? data.civil_id ?? '').replace(/\D/g, '');
}

async function deleteEmployeeAdmin(
  db: ReturnType<typeof getFirestore>,
  employeeId: string
) {
  await db.collection('employees').doc(employeeId).delete();
  const relCols = [
    'contracts',
    'commencements',
    'leave_requests',
    'leave_allocations',
    'attendance',
    'payslips',
    'loans',
    'documents',
    'employee_lifecycle_events',
    'employeeNotes',
    'warnings',
    'work_on_holidays',
    'onboarding_plans',
  ];
  for (const col of relCols) {
    const snap = await db.collection(col).where('employeeId', '==', employeeId).get();
    for (const d of snap.docs) {
      await d.ref.delete();
    }
  }
  await db.doc(`contracts/contract-${employeeId}`).delete().catch(() => {});
  await db.doc(`commencements/commencement-${employeeId}`).delete().catch(() => {});
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const sa = loadServiceAccount();
  if (!sa) {
    console.error('Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_CLIENT_EMAIL/PRIVATE_KEY in .env');
    process.exit(1);
  }
  const app = getApps().length ? getApps()[0]! : initializeApp({ credential: cert(sa as any) });
  const configPath = await import('../firebase-applet-config.json', { assert: { type: 'json' } });
  const dbId = (configPath.default as { firestoreDatabaseId?: string }).firestoreDatabaseId;
  const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

  const snap = await db.collection('employees').get();
  const matches: Array<{ id: string; companyId: string; name: string }> = [];
  snap.docs.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    if (pickCivil(data) !== CIVIL) return;
    matches.push({
      id: d.id,
      companyId: String(data.companyId ?? data.company_id ?? ''),
      name: String(data.fullNameAr ?? data.nameAr ?? ''),
    });
  });

  const kept = matches.filter((m) => normCompany(m.companyId) === normCompany(CANONICAL));
  const toDelete = matches.filter((m) => normCompany(m.companyId) !== normCompany(CANONICAL));

  const deletedPlans: string[] = [];
  for (const field of ['civilId', 'civil_id']) {
    const planSnap = await db.collection('onboarding_plans').where(field, '==', CIVIL).get();
    for (const d of planSnap.docs) {
      const data = d.data();
      const cid = normCompany(String(data.companyId ?? ''));
      if (cid && cid !== normCompany(CANONICAL)) {
        if (!dryRun) await d.ref.delete();
        deletedPlans.push(d.id);
      }
    }
  }

  if (!dryRun) {
    for (const row of toDelete) {
      await deleteEmployeeAdmin(db, row.id);
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        civilId: CIVIL,
        canonicalCompanyId: CANONICAL,
        kept,
        deletedEmployees: toDelete,
        deletedOnboardingPlanIds: deletedPlans,
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
