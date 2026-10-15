import { getAdminFirestore } from './firebaseAdmin';
import {
  companyIdFromRegistration,
  type DeviceRegistration,
  type PresentedDevice,
} from '../src/security/deviceCompany';

export interface UnregisteredDeviceAttempt {
  path: string;
  serialTail: string;
  at: string;
}

const attempts: UnregisteredDeviceAttempt[] = [];

type DeviceLoader = (presented: PresentedDevice) => Promise<DeviceRegistration[]>;

function readRegistration(data: Record<string, unknown> | undefined, id: string): DeviceRegistration {
  const row = data || {};
  return {
    serial: String(row.serialNumber || row.serial || id || '').trim() || undefined,
    token: String(row.token || '').trim() || undefined,
    companyId: String(row.companyId || row.company_id || '').trim() || undefined,
  };
}

async function loadFromFirestore(presented: PresentedDevice): Promise<DeviceRegistration[]> {
  const db = getAdminFirestore();
  if (!db) return [];
  const col = db.collection('biometric_devices');
  const found: DeviceRegistration[] = [];
  const serial = String(presented.serial || '').trim();
  const token = String(presented.token || '').trim();
  if (serial) {
    const byId = await col.doc(serial).get();
    if (byId.exists) found.push(readRegistration(byId.data(), byId.id));
    const bySerial = await col.where('serialNumber', '==', serial).limit(5).get();
    bySerial.docs.forEach((doc) => found.push(readRegistration(doc.data(), doc.id)));
  }
  if (token) {
    const byToken = await col.where('token', '==', token).limit(5).get();
    byToken.docs.forEach((doc) => found.push(readRegistration(doc.data(), doc.id)));
  }
  return found;
}

let loader: DeviceLoader = loadFromFirestore;

export function __setDeviceRecordLoaderForTests(next: DeviceLoader | null): void {
  loader = next || loadFromFirestore;
}

export function recordUnregisteredDeviceAttempt(path: string, serial?: string): UnregisteredDeviceAttempt {
  const event: UnregisteredDeviceAttempt = {
    path,
    serialTail: serial ? String(serial).slice(-4) : '',
    at: new Date().toISOString(),
  };
  attempts.unshift(event);
  if (attempts.length > 200) attempts.pop();
  console.info('[device] unregistered', { path: event.path, serialTail: event.serialTail });
  return event;
}

export function unregisteredDeviceAttemptCount(): number {
  return attempts.length;
}

export function __resetDeviceAttemptsForTests(): void {
  attempts.length = 0;
}

export async function resolveRegisteredDeviceCompany(presented: PresentedDevice): Promise<string | undefined> {
  const serial = String(presented.serial || '').trim();
  const token = String(presented.token || '').trim();
  if (!serial && !token) return undefined;
  try {
    const records = await loader({ serial, token });
    for (const record of records) {
      const companyId = companyIdFromRegistration(record, { serial, token });
      if (companyId) return companyId;
    }
    return undefined;
  } catch (error) {
    console.info('[device] lookup failed', { serialTail: serial ? serial.slice(-4) : '' });
    void error;
    return undefined;
  }
}

export function devicePresentedFrom(input: {
  query?: Record<string, unknown>;
  body?: unknown;
  headerToken?: unknown;
}): PresentedDevice {
  const query = input.query || {};
  const body = input.body && typeof input.body === 'object' && !Array.isArray(input.body)
    ? input.body as Record<string, unknown>
    : {};
  const serial = [query.SN, query.sn, query.serial, body.SN, body.sn, body.serial, body.serialNumber, body.deviceSn]
    .map((value) => String(value ?? '').trim())
    .find(Boolean);
  const token = [query.token, body.token, body.deviceToken, input.headerToken]
    .map((value) => String(value ?? '').trim())
    .find(Boolean);
  return { serial, token };
}
