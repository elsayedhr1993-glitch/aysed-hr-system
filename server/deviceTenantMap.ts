/** Server-side serial → company map. The value is never logged. */
export function companyForDevice(serial: string | undefined): string | undefined {
  const raw = process.env.DEVICE_TENANT_MAP;
  if (!raw || !serial) return undefined;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const companyId = parsed[serial];
    return typeof companyId === 'string' && companyId.trim() ? companyId.trim() : undefined;
  } catch {
    return undefined;
  }
}
