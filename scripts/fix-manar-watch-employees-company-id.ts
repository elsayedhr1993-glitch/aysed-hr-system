/**
 * One-shot check/fix: ensure watched المنار employees (آصف، ديفيكا / Asif, Devika)
 * have companyId + company_id = comp-1788442584841.
 *
 * Usage:
 *   npx tsx scripts/fix-manar-watch-employees-company-id.ts           # dry-run (default)
 *   npx tsx scripts/fix-manar-watch-employees-company-id.ts --apply   # write fixes
 *   npx tsx scripts/fix-manar-watch-employees-company-id.ts --ids=EMP-001,EMP-002 --apply
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const MANAR_COMPANY_ID = 'comp-1788442584841';

const NAME_FRAGMENTS = [
  'آصف',
  'asif',
  'asef',
  'aasef',
  'ديفيكا',
  'devika',
  'ديفيك',
];

function nameMatches(data: Record<string, unknown>): boolean {
  const blob = [
    data.fullNameAr,
    data.fullNameEn,
    data.nameAr,
    data.nameEn,
    data.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return NAME_FRAGMENTS.some((frag) => blob.includes(frag.toLowerCase()));
}

function readCompanyFields(data: Record<string, unknown>) {
  return {
    companyId: String(data.companyId ?? '').trim(),
    company_id: String(data.company_id ?? '').trim(),
  };
}

function needsFix(fields: { companyId: string; company_id: string }): boolean {
  const ok =
    fields.companyId === MANAR_COMPANY_ID && fields.company_id === MANAR_COMPANY_ID;
  if (ok) return false;
  if (fields.companyId === MANAR_COMPANY_ID && !fields.company_id) return true;
  if (!fields.companyId && fields.company_id === MANAR_COMPANY_ID) return true;
  return fields.companyId !== MANAR_COMPANY_ID || fields.company_id !== MANAR_COMPANY_ID;
}

function parseDocIdsArg(): string[] {
  const raw = process.argv.find((a) => a.startsWith('--ids='));
  if (!raw) return [];
  return raw
    .slice('--ids='.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const apply = process.argv.includes('--apply');
  const explicitIds = parseDocIdsArg();
  const db = getAdminFirestore();

  const snap = await db.collection('employees').get();
  const watched = snap.docs.filter((d) => {
    if (explicitIds.length && explicitIds.includes(d.id)) return true;
    return nameMatches(d.data() as Record<string, unknown>);
  });

  const manarByField = snap.docs.filter(
    (d) =>
      String(d.data().companyId || '') === MANAR_COMPANY_ID ||
      String(d.data().company_id || '') === MANAR_COMPANY_ID
  );

  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        targetCompanyId: MANAR_COMPANY_ID,
        totalEmployeesScanned: snap.size,
        manarLinkedByCompanyField: manarByField.length,
        watchedNameMatches: watched.length,
      },
      null,
      2
    )
  );

  const report: Array<Record<string, unknown>> = [];

  for (const doc of watched) {
    const data = doc.data() as Record<string, unknown>;
    const fields = readCompanyFields(data);
    const fix = needsFix(fields);
    const row = {
      id: doc.id,
      fullNameAr: data.fullNameAr ?? data.nameAr,
      civilId: data.civilId,
      companyId: fields.companyId || '(empty)',
      company_id: fields.company_id || '(empty)',
      willFix: fix,
    };
    report.push(row);

    if (fix && apply) {
      const now = new Date().toISOString();
      await doc.ref.set(
        {
          companyId: MANAR_COMPANY_ID,
          company_id: MANAR_COMPANY_ID,
          updatedAt: now,
          manarCompanyIdHealAt: now,
          manarCompanyIdHealNote: 'fix-manar-watch-employees-company-id.ts',
        },
        { merge: true }
      );
      console.log(`[APPLY] Updated ${doc.id} → ${MANAR_COMPANY_ID}`);
    }
  }

  console.log(JSON.stringify({ watchedEmployees: report }, null, 2));

  if (!watched.length) {
    console.warn(
      'No employees matched watch names (آصف / ديفيكا). Search all employees manually or extend NAME_FRAGMENTS.'
    );
  }

  if (!apply && report.some((r) => r.willFix)) {
    console.log('\nRun with --apply to patch companyId / company_id on flagged rows.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
