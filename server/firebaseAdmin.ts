import crypto from 'crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let authAdmin: ReturnType<typeof getAuth> | null = null;
let firebaseAdminInitAttempted = false;

function normalizeAndValidatePrivateKey(rawKey: unknown): string | null {
  if (!rawKey || typeof rawKey !== 'string') return null;
  let key = rawKey.trim();
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, '\n').trim();

  if (!key.includes('-----BEGIN') || !key.includes('KEY-----')) {
    return null;
  }

  const beginMatch = key.match(/-----BEGIN [A-Z0-9_\-\s]+KEY-----/);
  const endMatch = key.match(/-----END [A-Z0-9_\-\s]+KEY-----/);
  if (!beginMatch || !endMatch) {
    return null;
  }

  const header = beginMatch[0];
  const footer = endMatch[0];
  const startIndex = key.indexOf(header) + header.length;
  const endIndex = key.indexOf(footer);
  if (startIndex >= endIndex) return null;

  const rawBase64 = key.substring(startIndex, endIndex).replace(/\s+/g, '');
  if (!rawBase64 || rawBase64.length < 50) return null;

  const chunks = rawBase64.match(/.{1,64}/g);
  if (!chunks) return null;

  const formattedKey = `${header}\n${chunks.join('\n')}\n${footer}\n`;

  try {
    crypto.createPrivateKey(formattedKey);
    return formattedKey;
  } catch {
    return null;
  }
}

export function getAdminAuth(): ReturnType<typeof getAuth> | null {
  if (authAdmin) return authAdmin;
  if (firebaseAdminInitAttempted && !adminApp) return null;
  firebaseAdminInitAttempted = true;

  try {
    let rawCreds = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!rawCreds || rawCreds.trim() === '' || rawCreds.includes('YOUR_')) {
      return null;
    }
    rawCreds = rawCreds.trim();
    let parsedServiceAccount: Record<string, unknown>;
    if (rawCreds.startsWith('{')) {
      parsedServiceAccount = JSON.parse(rawCreds);
    } else if (rawCreds.startsWith('"{') && rawCreds.endsWith('}"')) {
      parsedServiceAccount = JSON.parse(JSON.parse(rawCreds));
    } else {
      try {
        const decoded = Buffer.from(rawCreds, 'base64').toString('utf8');
        if (decoded.trim().startsWith('{')) {
          parsedServiceAccount = JSON.parse(decoded);
        } else {
          parsedServiceAccount = JSON.parse(rawCreds);
        }
      } catch {
        parsedServiceAccount = JSON.parse(rawCreds);
      }
    }

    if (
      parsedServiceAccount &&
      (parsedServiceAccount.private_key || parsedServiceAccount.client_email)
    ) {
      const validKey = normalizeAndValidatePrivateKey(parsedServiceAccount.private_key);
      if (!validKey) {
        return null;
      }
      parsedServiceAccount.private_key = validKey;

      if (getApps().length === 0) {
        adminApp = initializeApp({
          credential: cert(parsedServiceAccount as Parameters<typeof cert>[0]),
        });
      } else {
        adminApp = getApps()[0];
      }
      authAdmin = getAuth(adminApp);
      return authAdmin;
    }
  } catch {
    return null;
  }
  return null;
}

export function getAdminApp(): App | null {
  getAdminAuth();
  return adminApp;
}

function resolveFirestoreDatabaseId(): string | undefined {
  const fromEnv =
    process.env.FIRESTORE_DATABASE_ID ||
    process.env.FIREBASE_FIRESTORE_DATABASE_ID ||
    '';
  if (fromEnv.trim()) return fromEnv.trim();

  try {
    const configPath = join(process.cwd(), 'firebase-applet-config.json');
    const raw = readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw) as { firestoreDatabaseId?: string };
    if (parsed.firestoreDatabaseId?.trim()) return parsed.firestoreDatabaseId.trim();
  } catch {
    /* optional local config */
  }

  return 'ai-studio-remixaysedshr202-98c882d5-9491-4f4b-a838-c6b0b10a0472';
}

export function getAdminFirestore() {
  if (!getAdminAuth() || !adminApp) return null;
  try {
    const databaseId = resolveFirestoreDatabaseId();
    return databaseId ? getFirestore(adminApp, databaseId) : getFirestore(adminApp);
  } catch {
    return null;
  }
}
