/**
 * Upload Manar clinic license PDFs from inbox to Firebase Storage (Admin SDK)
 * and patch fileUrl in manar-facility-licenses.json.
 *
 * Usage:
 *   npx tsx scripts/upload-manar-license-pdfs-admin.ts
 *   npx tsx scripts/upload-manar-license-pdfs-admin.ts --apply-firestore
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { getStorage } from 'firebase-admin/storage';
import { getAdminApp, getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788442584841';
const INBOX = join(process.cwd(), 'scripts/data/manar-licenses-inbox');
const JSON_PATH = join(process.cwd(), 'scripts/data/manar-facility-licenses.json');

const UPLOADS: Array<{ docId: string; inboxFile: string }> = [
  { docId: `lic-${COMPANY_ID}-moh`, inboxFile: 'moh-manar-clinic-04-05-2029.pdf' },
  { docId: `lic-${COMPANY_ID}-signature-auth`, inboxFile: 'signature-auth-2029.pdf' },
  { docId: `lic-${COMPANY_ID}-kff`, inboxFile: 'kff-fire-10-11-2027.pdf' },
  { docId: `lic-${COMPANY_ID}-traffic`, inboxFile: 'traffic-approval-4-2029.pdf' },
  { docId: `lic-${COMPANY_ID}-bank-iban`, inboxFile: 'manar-clinic-kfh-account-iban.pdf' },
];

/** Rows built from facility wizard without inbox PDF — mirror attachment from related doc. */
const FILE_URL_ALIASES: Array<{ targetId: string; sourceId: string }> = [
  { targetId: `lic-${COMPANY_ID}-baladiya`, sourceId: `lic-${COMPANY_ID}-traffic` },
  { targetId: `lic-${COMPANY_ID}-pam`, sourceId: `lic-${COMPANY_ID}-signature-auth` },
];

function loadStorageBucketCandidates(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (name?: string) => {
    const n = String(name || '').trim();
    if (!n || seen.has(n)) return;
    seen.add(n);
    out.push(n);
  };

  push(process.env.FIREBASE_STORAGE_BUCKET);

  try {
    const cfg = JSON.parse(
      readFileSync(join(process.cwd(), 'firebase-applet-config.json'), 'utf8')
    ) as { storageBucket?: string; projectId?: string };
    push(cfg.storageBucket);
    if (cfg.storageBucket?.includes('.firebasestorage.app')) {
      push(cfg.storageBucket.replace('.firebasestorage.app', '.appspot.com'));
    }
    if (cfg.projectId) {
      push(`${cfg.projectId}.appspot.com`);
      push(`${cfg.projectId}.firebasestorage.app`);
    }
  } catch {
    /* ignore */
  }

  if (out.length === 0) {
    throw new Error('Set FIREBASE_STORAGE_BUCKET or firebase-applet-config.json storageBucket');
  }
  return out;
}

function buildDownloadUrl(bucketName: string, objectPath: string, token: string): string {
  const encoded = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media&token=${token}`;
}

async function uploadPdf(
  localPath: string,
  storagePath: string,
  bucketCandidates: string[]
): Promise<{ url: string; bucket: string }> {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin unavailable (FIREBASE_SERVICE_ACCOUNT)');

  const token = randomUUID();
  let lastErr: unknown;

  for (const bucketName of bucketCandidates) {
    try {
      const bucket = getStorage(app).bucket(bucketName);
      await bucket.upload(localPath, {
        destination: storagePath,
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            firebaseStorageDownloadTokens: token,
          },
        },
      });
      const downloadBucket =
        bucketName.includes('.appspot.com')
          ? bucketName.replace('.appspot.com', '.firebasestorage.app')
          : bucketName;
      return {
        url: buildDownloadUrl(downloadBucket, storagePath, token),
        bucket: bucketName,
      };
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function main() {
  const applyFirestore = process.argv.includes('--apply-firestore');
  const bucketCandidates = loadStorageBucketCandidates();
  const payload = JSON.parse(readFileSync(JSON_PATH, 'utf8')) as {
    extraDocuments?: Array<{ id: string; fileUrl?: string }>;
  };

  const byId = new Map((payload.extraDocuments || []).map((d) => [d.id, d]));
  const uploaded: Array<{ docId: string; file: string; url: string }> = [];

  for (const row of UPLOADS) {
    const local = join(INBOX, row.inboxFile);
    if (!existsSync(local)) {
      console.warn(JSON.stringify({ skip: true, reason: 'missing_file', file: row.inboxFile }));
      continue;
    }
    const storagePath = `company_documents/${COMPANY_ID}/${basename(row.inboxFile)}`;
    const { url, bucket } = await uploadPdf(local, storagePath, bucketCandidates);
    const doc = byId.get(row.docId);
    if (doc) doc.fileUrl = url;
    uploaded.push({ docId: row.docId, file: row.inboxFile, url, bucket });
  }

  writeFileSync(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ok: true, uploaded, bucketCandidates }, null, 2));

  const urlByDocId = new Map(uploaded.map((u) => [u.docId, u.url]));

  if (applyFirestore) {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(
      'npx',
      ['tsx', 'scripts/apply-manar-facility-licenses-admin.ts', JSON_PATH],
      { stdio: 'inherit', shell: true, cwd: process.cwd() }
    );
    if (r.status !== 0) process.exit(r.status ?? 1);

    const db = getAdminFirestore();
    if (db) {
      const aliasResults: Array<{ targetId: string; sourceId: string; fileUrl: string }> = [];
      for (const { targetId, sourceId } of FILE_URL_ALIASES) {
        let fileUrl = urlByDocId.get(sourceId);
        if (!fileUrl) {
          const snap = await db.collection('company_documents').doc(sourceId).get();
          fileUrl = String(snap.data()?.fileUrl || '');
        }
        if (!fileUrl) continue;
        await db.collection('company_documents').doc(targetId).set({ fileUrl }, { merge: true });
        aliasResults.push({ targetId, sourceId, fileUrl });
      }
      if (aliasResults.length > 0) {
        console.log(JSON.stringify({ fileUrlAliases: aliasResults }, null, 2));
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
