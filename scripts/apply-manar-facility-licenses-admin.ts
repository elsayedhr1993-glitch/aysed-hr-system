/**
 * Seed / update المنار كلينك facility licenses (Firestore Admin).
 *
 * Usage:
 *   cp scripts/data/manar-facility-licenses.template.json scripts/data/manar-facility-licenses.json
 *   # fill numbers, dates, fileUrl (HTTPS) per license
 *   npx tsx scripts/apply-manar-facility-licenses-admin.ts scripts/data/manar-facility-licenses.json
 *   npx tsx scripts/apply-manar-facility-licenses-admin.ts --dry-run scripts/data/manar-facility-licenses.json
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import {
  buildCompanyDocumentsFromFacility,
  deriveCompanyProfilePatchFromLicenses,
  getFacilityLicensingDocId,
} from '../src/services/companyLicenseSync.ts';
import type { CompanyDocument } from '../src/types/companyDocuments.ts';
import type { FacilityLicenseData } from '../src/types/facilityLicense.ts';
import { createEmptyFacilityData } from '../src/types/facilityLicense.ts';

const DEFAULT_COMPANY_ID = 'comp-1788442584841';

type Payload = {
  companyId?: string;
  companyPatch?: Record<string, unknown>;
  facility?: Partial<FacilityLicenseData>;
  extraDocuments?: CompanyDocument[];
};

function parseArgs(argv: string[]): { dryRun: boolean; jsonPath: string } {
  const dryRun = argv.includes('--dry-run');
  const pathArg = argv.find((a) => !a.startsWith('--') && a.endsWith('.json'));
  if (!pathArg) {
    throw new Error('Pass path to JSON payload (see scripts/data/manar-facility-licenses.template.json)');
  }
  return { dryRun, jsonPath: resolve(pathArg) };
}

function mergeDocuments(
  tenantId: string,
  facility: FacilityLicenseData,
  extra: CompanyDocument[]
): CompanyDocument[] {
  const fromFacility = buildCompanyDocumentsFromFacility(tenantId, facility, {
    id: tenantId,
    regulatoryRegime: 'MOH_MEDICAL',
  } as import('../src/types').Company);

  const byId = new Map<string, CompanyDocument>();
  for (const row of fromFacility) {
    byId.set(row.id, { ...row, companyId: tenantId });
  }
  for (const row of extra) {
    if (!row.documentNumber?.trim() && !row.expiryDate) continue;
    byId.set(row.id, {
      ...row,
      companyId: tenantId,
      id: row.id || `lic-${tenantId}-custom-${byId.size}`,
    });
  }
  return [...byId.values()];
}

async function main() {
  const { dryRun, jsonPath } = parseArgs(process.argv.slice(2));
  const raw = JSON.parse(readFileSync(jsonPath, 'utf8')) as Payload;
  const companyId = String(raw.companyId || DEFAULT_COMPANY_ID).trim();
  const facility: FacilityLicenseData = {
    ...createEmptyFacilityData(),
    ...(raw.facility || {}),
    lastUpdated: new Date().toISOString(),
    isCompleted: raw.facility?.isCompleted ?? true,
  };

  const extraDocuments = (raw.extraDocuments || []).filter(
    (d) => d.documentNumber?.trim() || d.expiryDate
  );

  const mergedDocs = mergeDocuments(companyId, facility, extraDocuments);
  const profilePatch = deriveCompanyProfilePatchFromLicenses(mergedDocs, facility, {
    id: companyId,
    regulatoryRegime: 'MOH_MEDICAL',
  } as import('../src/types').Company);

  const summary = {
    companyId,
    facilityDocId: getFacilityLicensingDocId(companyId),
    licenseRows: mergedDocs.length,
    documents: mergedDocs.map((d) => ({
      id: d.id,
      name: d.name,
      number: d.documentNumber,
      expiry: d.expiryDate,
      hasFile: Boolean(d.fileUrl),
    })),
    companyProfileKeys: Object.keys(profilePatch),
    dryRun,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (dryRun) return;

  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  await db
    .collection('system_config')
    .doc(getFacilityLicensingDocId(companyId))
    .set(facility, { merge: true });

  for (const row of mergedDocs) {
    await db.collection('company_documents').doc(row.id).set({ ...row, companyId }, { merge: true });
  }

  await db.collection('companies').doc(companyId).set(
    {
      ...raw.companyPatch,
      ...profilePatch,
      id: companyId,
      regulatoryRegime: 'MOH_MEDICAL',
      licensesSyncedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(JSON.stringify({ ok: true, companyId, licenseRows: mergedDocs.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
