/**
 * Seed / export PAM Form (2) print calibration (pamOverlayCoords + pamFontChoice).
 *
 * Apply from JSON (defaults merged with code DEFAULT_PAM_COORDINATES):
 *   npx tsx scripts/seed-pam-overlay-settings.ts
 *   npx tsx scripts/seed-pam-overlay-settings.ts --dry-run
 *
 * Export platform + clinic companies from Firestore into JSON:
 *   npx tsx scripts/seed-pam-overlay-settings.ts --export
 *
 * Custom JSON path:
 *   npx tsx scripts/seed-pam-overlay-settings.ts --file scripts/data/pam-overlay-seed.json
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import {
  DEFAULT_PAM_COORDINATES,
  mergePamCoordinates,
  type PamCoordinatesConfig,
  type PamFontChoice,
} from '../src/services/pamContractPdfService.ts';

const PLATFORM_COLLECTION = 'platform_settings';
const PLATFORM_PAM_DOC_ID = 'pam_form_2';
const COMPANIES_COLLECTION = 'companies';

const DEFAULT_SEED_PATH = path.join(process.cwd(), 'scripts/data/pam-overlay-seed.json');

const KNOWN_CLINIC_IDS = [
  'comp-1788442584841',
  'tenant_1788413304890',
  'comp-1788435917695',
];

type SeedCompanyRow = {
  companyId: string;
  label?: string;
  inheritPlatformCoords?: boolean;
  pamFontChoice?: PamFontChoice | null;
  pamOverlayCoords?: Partial<PamCoordinatesConfig> | PamCoordinatesConfig | null;
};

type SeedFile = {
  platform?: {
    pamFontChoice?: PamFontChoice | null;
    pamOverlayCoords?: Partial<PamCoordinatesConfig> | PamCoordinatesConfig | null;
  };
  companies?: SeedCompanyRow[];
};

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const exportMode = argv.includes('--export');
  const fileIdx = argv.indexOf('--file');
  const file =
    fileIdx >= 0 && argv[fileIdx + 1]
      ? path.resolve(argv[fileIdx + 1])
      : DEFAULT_SEED_PATH;
  return { dryRun, exportMode, file };
}

function resolveCoords(
  layer: Partial<PamCoordinatesConfig> | PamCoordinatesConfig | null | undefined
): PamCoordinatesConfig {
  return mergePamCoordinates(DEFAULT_PAM_COORDINATES, layer || undefined);
}

function resolveFont(
  ...candidates: (PamFontChoice | null | undefined)[]
): PamFontChoice {
  for (const c of candidates) {
    if (c === 'cairo' || c === 'amiri') return c;
  }
  return 'cairo';
}

async function exportToJson(file: string) {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable — set FIREBASE_SERVICE_ACCOUNT in .env');

  const platformSnap = await db.collection(PLATFORM_COLLECTION).doc(PLATFORM_PAM_DOC_ID).get();
  const platformData = platformSnap.exists ? platformSnap.data() : {};

  const companies: SeedCompanyRow[] = [];
  for (const companyId of KNOWN_CLINIC_IDS) {
    const snap = await db.collection(COMPANIES_COLLECTION).doc(companyId).get();
    const data = snap.exists ? snap.data() : {};
    const nameAr = String(data?.nameAr || data?.name || companyId);
    companies.push({
      companyId,
      label: nameAr,
      inheritPlatformCoords: false,
      pamFontChoice: (data?.pamFontChoice as PamFontChoice) || null,
      pamOverlayCoords: (data?.pamOverlayCoords as PamCoordinatesConfig) || null,
    });
  }

  const out: SeedFile & { _exportedAt: string } = {
    _exportedAt: new Date().toISOString(),
    _readme:
      'Exported from Firestore. Edit pamOverlayCoords then run: npx tsx scripts/seed-pam-overlay-settings.ts',
    platform: {
      pamFontChoice: (platformData?.pamFontChoice as PamFontChoice) || 'cairo',
      pamOverlayCoords: (platformData?.pamOverlayCoords as PamCoordinatesConfig) || null,
    },
    companies,
  };

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', file);
  console.log('Platform doc:', platformSnap.exists ? 'found' : 'missing (will use code defaults on seed)');
}

async function applySeed(file: string, dryRun: boolean) {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable — set FIREBASE_SERVICE_ACCOUNT in .env');

  if (!fs.existsSync(file)) {
    throw new Error(`Seed file not found: ${file}`);
  }

  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as SeedFile;
  const platformCoords = resolveCoords(raw.platform?.pamOverlayCoords);
  const platformFont = resolveFont(raw.platform?.pamFontChoice);

  const platformPayload = {
    pamOverlayCoords: platformCoords,
    pamFontChoice: platformFont,
    updatedAt: new Date().toISOString(),
    seededFrom: path.basename(file),
  };

  console.log('\n=== platform_settings/pam_form_2 ===');
  console.log('font:', platformFont, '| fields:', Object.keys(platformCoords).length);
  if (dryRun) {
    console.log('[dry-run] skip write');
  } else {
    await db.collection(PLATFORM_COLLECTION).doc(PLATFORM_PAM_DOC_ID).set(platformPayload, { merge: true });
    console.log('OK');
  }

  const rows = raw.companies?.length ? raw.companies : KNOWN_CLINIC_IDS.map((id) => ({ companyId: id }));

  for (const row of rows) {
    const companyId = row.companyId;
    if (!companyId) continue;

    const usePlatform = row.inheritPlatformCoords !== false && !row.pamOverlayCoords;
    const coords = usePlatform
      ? platformCoords
      : resolveCoords(row.pamOverlayCoords);
    const font = resolveFont(row.pamFontChoice, platformFont);

    const payload = {
      pamOverlayCoords: coords,
      pamFontChoice: font,
      pamSettingsUpdatedAt: new Date().toISOString(),
      pamSettingsSeededFrom: path.basename(file),
    };

    console.log(`\n=== companies/${companyId} (${row.label || '—'}) ===`);
    console.log('inheritPlatform:', usePlatform, '| font:', font);
    if (dryRun) {
      console.log('[dry-run] skip write');
      continue;
    }

    const ref = db.collection(COMPANIES_COLLECTION).doc(companyId);
    const exists = (await ref.get()).exists;
    if (!exists) {
      console.warn('WARN: company doc missing — writing calibration fields only (merge)');
    }
    await ref.set(payload, { merge: true });
    console.log('OK');
  }

  console.log('\nDone.');
}

async function main() {
  const { dryRun, exportMode, file } = parseArgs();
  if (exportMode) {
    await exportToJson(file);
    return;
  }
  await applySeed(file, dryRun);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
