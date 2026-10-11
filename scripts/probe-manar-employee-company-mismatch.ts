/**
 * List employees that likely belong to المنار but companyId ≠ comp-1788442584841.
 * Usage: npx tsx scripts/probe-manar-employee-company-mismatch.ts
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const MANAR = 'comp-1788442584841';
const MANAR_VARIANTS = new Set([
  MANAR,
  '1788442584841',
  'tenant_1788442584841',
  'comp-manar',
  'comp-almanar',
]);

async function main() {
  const db = getAdminFirestore();
  const snap = await db.collection('employees').get();
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

  const wrongCompany = rows.filter((r) => {
    const cid = String(r.companyId ?? '').trim();
    const legacy = String(r.company_id ?? '').trim();
    const linked = MANAR_VARIANTS.has(cid) || MANAR_VARIANTS.has(legacy);
    if (linked) return false;
    const email = String(r.email ?? r.workEmail ?? '').toLowerCase();
    const name = String(r.fullNameAr ?? r.nameAr ?? '');
    return email.includes('almanar') || name.includes('المنار');
  });

  const emptyCompany = rows.filter((r) => {
    const cid = String(r.companyId ?? '').trim();
    const legacy = String(r.company_id ?? '').trim();
    return !cid && !legacy;
  });

  console.log(
    JSON.stringify(
      {
        total: rows.length,
        manarExactCompanyId: rows.filter((r) => String(r.companyId) === MANAR).length,
        likelyManarWrongCompany: wrongCompany.map((r) => ({
          id: r.id,
          fullNameAr: r.fullNameAr ?? r.nameAr,
          companyId: r.companyId,
          company_id: r.company_id,
          email: r.email,
        })),
        emptyCompanyIdCount: emptyCompany.length,
        emptyCompanySample: emptyCompany.slice(0, 15).map((r) => ({
          id: r.id,
          fullNameAr: r.fullNameAr ?? r.nameAr,
        })),
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
