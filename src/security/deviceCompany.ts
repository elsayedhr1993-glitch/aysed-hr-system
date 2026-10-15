/** Company ids that must never be assigned to a biometric device. */
const REJECTED_DEVICE_COMPANIES = new Set([
  'default',
  'default_company',
  'default_comp',
  'comp-clinic-01',
  'all',
]);

export interface DeviceRegistration {
  serial?: string;
  token?: string;
  companyId?: string;
}

export interface PresentedDevice {
  serial?: string;
  token?: string;
}

export function acceptedDeviceCompanyId(value: unknown): string | undefined {
  const id = String(value ?? '').trim();
  if (!id || REJECTED_DEVICE_COMPANIES.has(id.toLowerCase())) return undefined;
  return id;
}

/** Company comes only from a registration whose serial or token matches. */
export function companyIdFromRegistration(
  registration: DeviceRegistration | null | undefined,
  presented: PresentedDevice
): string | undefined {
  if (!registration) return undefined;
  const companyId = acceptedDeviceCompanyId(registration.companyId);
  if (!companyId) return undefined;
  const serial = String(presented.serial || '').trim();
  const token = String(presented.token || '').trim();
  const serialHit = Boolean(serial && registration.serial && registration.serial === serial);
  const tokenHit = Boolean(token && registration.token && registration.token === token);
  if (!serialHit && !tokenHit) return undefined;
  return companyId;
}
