/**
 * Probe Elite clinic employees by name + tenant visibility.
 * Usage: npx tsx scripts/probe-elite-employees-admin.ts [nameFragment]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import {
  contractQueryCompanyIds,
  employeeBelongsToTenant,
} from '../src/utils/contractTenantRules.ts';

const ELITE_CANONICAL = 'comp-1788435917695';
const ELITE_LEGACY = 'comp-elite';
const filter = (process.argv[2] || '').trim();

function pickName(e: Record<string, unknown>): string {
  return String(e.fullNameAr ?? e.nameAr ?? e.name ?? '');
}

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const civilArg = process.argv.find((a) => /^\d{12}$/.test(a));
  if (civilArg) {
    const civilSnap = await db.collection('employees').where('civilId', '==', civilArg).get();
    console.log(
      JSON.stringify(
        {
          civilId: civilArg,
          matches: civilSnap.docs.map((d) => {
            const e = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              companyId: e.companyId,
              name: pickName(e),
              status: e.status,
              belongsToElite: employeeBelongsToTenant(e, ELITE_CANONICAL),
            };
          }),
        },
        null,
        2
      )
    );
    return;
  }

  const empIdArg = process.argv.find((a) => /^EMP-/.test(a));
  if (empIdArg) {
    const doc = await db.collection('employees').doc(empIdArg).get();
    const contracts = await db
      .collection('contracts')
      .where('employeeId', '==', empIdArg)
      .get();
    console.log(
      JSON.stringify(
        {
          employeeId: empIdArg,
          employee: doc.exists ? { id: doc.id, ...(doc.data() as Record<string, unknown>) } : null,
          contracts: contracts.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })),
        },
        null,
        2
      )
    );
    return;
  }

  const snap = await db.collection('employees').get();
  const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

  const queryIds = new Set(contractQueryCompanyIds(ELITE_CANONICAL));
  const eliteByRule = all.filter((e) => employeeBelongsToTenant(e, ELITE_CANONICAL));
  const eliteByField = all.filter((e) => queryIds.has(String(e.companyId || '')));

  const onlyLegacy = eliteByField.filter(
    (e) => String(e.companyId) === ELITE_LEGACY && !employeeBelongsToTenant(e, ELITE_CANONICAL)
  );
  const onlyCanonical = eliteByField.filter((e) => String(e.companyId) === ELITE_CANONICAL);

  const nameHits = all.filter((e) => {
    const n = pickName(e);
    if (!filter) return false;
    return n.includes(filter);
  });

  const duplicateGroups = new Map<string, Array<Record<string, unknown>>>();
  for (const e of eliteByRule) {
    const civil = String(e.civilId ?? e.civil_id ?? '').replace(/\D/g, '');
    const key = civil || `name:${pickName(e)}`;
    const list = duplicateGroups.get(key) || [];
    list.push(e);
    duplicateGroups.set(key, list);
  }
  const dupesInElite = [...duplicateGroups.entries()].filter(([, rows]) => rows.length > 1);

  console.log(
    JSON.stringify(
      {
        eliteCanonical: ELITE_CANONICAL,
        contractQueryCompanyIds: [...queryIds],
        totalEmployeesCollection: all.length,
        eliteByTenantRule: eliteByRule.length,
        eliteByCompanyIdField: eliteByField.length,
        withLegacyCompEliteOnly: onlyLegacy.length,
        withCanonicalIdOnly: onlyCanonical.length,
        duplicateCivilOrNameInElite: dupesInElite.map(([k, rows]) => ({
          key: k,
          rows: rows.map((r) => ({
            id: r.id,
            companyId: r.companyId,
            name: pickName(r),
            civilId: r.civilId,
            status: r.status,
            isDeleted: r.isDeleted,
          })),
        })),
        nameFilter: filter || null,
        nameHits: nameHits.map((e) => ({
          id: e.id,
          companyId: e.companyId,
          name: pickName(e),
          civilId: e.civilId,
          status: e.status,
          isDeleted: e.isDeleted,
          belongsToElite: employeeBelongsToTenant(e, ELITE_CANONICAL),
        })),
        eliteRoster: eliteByRule
          .map((e) => ({
            id: e.id,
            companyId: e.companyId,
            name: pickName(e),
            civilId: e.civilId,
          }))
          .sort((a, b) => String(a.name).localeCompare(String(b.name), 'ar')),
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
