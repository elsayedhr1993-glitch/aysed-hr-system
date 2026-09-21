/**
 * One-shot Firestore cleanup: remove duplicate company docs and fix user companyId.
 * Requires FIREBASE_SERVICE_ACCOUNT JSON in env (same as Vercel server).
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { dedupeTenantCompanies } from '../src/utils/companyDedupe.ts';

async function main() {
  const db = getAdminFirestore();
  if (!db) {
    console.error('Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT).');
    process.exit(1);
  }

  const snap = await db.collection('companies').get();
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
    id: string;
    nameAr?: string;
    nameEn?: string;
    name?: string;
  }>;

  console.log(`Found ${all.length} company documents before dedupe.`);
  const { companies, duplicateIds, idRemap } = dedupeTenantCompanies(
    all.map((c) => ({
      id: c.id,
      nameAr: c.nameAr || c.name || '—',
      nameEn: c.nameEn || c.name || '—',
      adminUsername: (c as any).adminUsername || '',
      adminPassword: '',
      contactPhone: (c as any).contactPhone || '',
      pamFileNumber: (c as any).pamFileNumber || '',
      commercialReg: (c as any).commercialReg || '',
      mohLicense: (c as any).mohLicense || '',
      iban: (c as any).iban || '',
      bankName: (c as any).bankName || '',
      isActive: true,
      createdAt: (c as any).createdAt || '',
    }))
  );

  for (const dupId of duplicateIds) {
    const canonicalId = idRemap[dupId];
    console.log(`DELETE company ${dupId} -> canonical ${canonicalId}`);
    await db.collection('companies').doc(dupId).delete();
  }

  for (const canonical of companies) {
    const donors = all.filter((c) => idRemap[c.id] === canonical.id);
    if (donors.length === 0) continue;
    const patch: Record<string, unknown> = {};
    for (const donor of donors) {
      const d = donor as Record<string, unknown>;
      const t = canonical as Record<string, unknown>;
      if (!t.pamFileNumber && d.pamFileNumber) patch.pamFileNumber = d.pamFileNumber;
      if (!t.commercialReg && d.commercialReg) patch.commercialReg = d.commercialReg;
      if (!t.adminUsername && d.adminUsername) patch.adminUsername = d.adminUsername;
    }
    if (Object.keys(patch).length > 0) {
      console.log(`PATCH canonical ${canonical.id}`, patch);
      await db.collection('companies').doc(canonical.id).set(patch, { merge: true });
    }
  }

  const usersSnap = await db.collection('users').get();
  let userUpdates = 0;
  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const email = String(data.email || '').trim().toLowerCase();
    let companyId = String(data.companyId || '').trim();

    if (companyId && idRemap[companyId]) {
      companyId = idRemap[companyId];
    }

    const resolved = email
      ? companies.find((c) => String((c as any).adminUsername || '').toLowerCase() === email)?.id
      : undefined;

    if (resolved && resolved !== data.companyId) {
      companyId = resolved;
    }

    const role = String(data.role || 'COMPANY_ADMIN').toUpperCase();
    const normalizedRole = role === 'TENANT_ADMIN' ? 'COMPANY_ADMIN' : role;

    if (!email) continue;

    const needsUpdate =
      (canonicalCompanyId && canonicalCompanyId !== data.companyId) ||
      normalizedRole !== String(data.role || '').toUpperCase();

    if (needsUpdate && canonicalCompanyId) {
      console.log(`UPDATE user ${userDoc.id} companyId ${data.companyId} -> ${companyId}`);
      await userDoc.ref.set(
        {
          ...(email ? { email } : {}),
          companyId: companyId || data.companyId || null,
          role: normalizedRole,
        },
        { merge: true }
      );
      userUpdates += 1;
    }
  }

  console.log(`Done. Removed ${duplicateIds.length} duplicate companies; updated ${userUpdates} users.`);
  console.log(
    'Canonical companies:',
    companies.map((c) => `${c.id} (${c.nameAr})`).join(', ')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
