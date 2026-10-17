import { recordAuditEvent } from './auditLog';
import { normalizeHrRole } from '../src/security/accessRoles';
import { openPlatformStore, type PlatformActor, type PlatformResult } from './platformOwnerWrites';

const PROFILE_ROLES = new Set(['COMPANY_ADMIN', 'HR_MANAGER', 'HR_USER']);

const LICENSE_FIELDS = [
  'nameAr',
  'name',
  'nameEn',
  'commercialRegNo',
  'crNumber',
  'civilIdCompany',
  'paciNumber',
  'logoUrl',
  'logo',
  'mohLicense',
  'wsiCode',
  'authorizedSignatory',
] as const;

function deny(status: number, error: string): PlatformResult {
  return { ok: false, status, error };
}

function text(value: unknown, max = 300): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function actorCompany(actor: PlatformActor): string {
  return String(actor.companyId || '').trim();
}

async function audit(
  actor: PlatformActor,
  input: {
    action: 'create' | 'update';
    entityType: string;
    entityId: string;
    details: string;
    after?: Record<string, unknown>;
  }
): Promise<void> {
  await recordAuditEvent({
    actor: { uid: actor.uid, name: actor.email, role: actor.role },
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    after: input.after,
    ip: actor.ip,
    sessionCompanyId: actor.companyId,
    details: input.details,
  });
}

export function companyProfileRoleAllowed(role: string | undefined | null): boolean {
  return PROFILE_ROLES.has(normalizeHrRole(role));
}

export function companyAdminRole(role: string | undefined | null): boolean {
  return normalizeHrRole(role) === 'COMPANY_ADMIN';
}

/** Merges license fields and contract coordinates onto the session company only. */
export async function mergeSessionCompanyProfile(
  actor: PlatformActor,
  input: { patch?: unknown }
): Promise<PlatformResult> {
  if (!companyProfileRoleAllowed(actor.role)) return deny(403, 'Unauthorized');
  const companyId = actorCompany(actor);
  if (!companyId) return deny(403, 'Unauthorized');
  if (!input.patch || typeof input.patch !== 'object' || Array.isArray(input.patch)) {
    return deny(400, 'بيانات المنشأة مطلوبة');
  }
  const source = input.patch as Record<string, unknown>;
  const next: Record<string, unknown> = { id: companyId };
  let license = false;
  for (const key of LICENSE_FIELDS) {
    const value = text(source[key]);
    if (value) {
      next[key] = value;
      license = true;
    }
  }
  const wantsPam = (source.pamOverlayCoords != null && source.pamOverlayCoords !== '')
    || (source.pamFontChoice != null && source.pamFontChoice !== '');
  if (wantsPam && !companyAdminRole(actor.role)) return deny(403, 'Unauthorized');
  if (source.pamOverlayCoords && typeof source.pamOverlayCoords === 'object' && !Array.isArray(source.pamOverlayCoords)) {
    const encoded = JSON.stringify(source.pamOverlayCoords);
    if (encoded.length > 80_000) return deny(400, 'الإحداثيات أكبر من الحد');
    next.pamOverlayCoords = JSON.parse(encoded) as Record<string, unknown>;
  }
  if (source.pamFontChoice != null && source.pamFontChoice !== '') {
    const font = String(source.pamFontChoice);
    if (font !== 'cairo' && font !== 'amiri') return deny(400, 'خط العقد غير صالح');
    next.pamFontChoice = font;
  }
  const version = Number(source.pamOverlaySchemaVersion);
  const hasPam = 'pamOverlayCoords' in next || 'pamFontChoice' in next;
  if (hasPam) {
    next.pamOverlaySchemaVersion = Number.isInteger(version) && version >= 2 && version <= 50 ? version : 2;
    next.pamSettingsUpdatedAt = new Date().toISOString();
  }
  if (license) next.licensesSyncedAt = new Date().toISOString();
  if (Object.keys(next).length <= 1) return deny(400, 'لا حقول للحفظ');
  const store = await openPlatformStore();
  await store.merge(`companies/${companyId}`, next);
  await audit(actor, {
    action: 'update',
    entityType: 'companies',
    entityId: companyId,
    details: 'دمج حقول الترخيص أو إحداثيات العقد',
    after: { fields: Object.keys(next).filter((key) => key !== 'id') },
  });
  return { ok: true, status: 200, body: { success: true, companyId } };
}

function branchRow(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const name = text(row.name, 160);
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  const radiusMeters = Number(row.radiusMeters);
  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radiusMeters)) return null;
  return {
    id: text(row.id, 80) || undefined,
    name,
    latitude,
    longitude,
    radiusMeters,
    isActive: row.isActive !== false,
    address: text(row.address, 240) || '',
    notes: text(row.notes, 240) || '',
  };
}

/** Company-admin integrations. Secrets stay on the server document and are not returned. */
export async function saveSessionIntegrations(
  actor: PlatformActor,
  input: {
    publicVerificationDomain?: unknown;
    branches?: unknown;
    whatsAppGateway?: unknown;
    geminiApiKey?: unknown;
  }
): Promise<PlatformResult> {
  if (!companyAdminRole(actor.role)) return deny(403, 'Unauthorized');
  const companyId = actorCompany(actor);
  if (!companyId) return deny(403, 'Unauthorized');
  const gateway = input.whatsAppGateway && typeof input.whatsAppGateway === 'object'
    ? input.whatsAppGateway as Record<string, unknown>
    : {};
  const store = await openPlatformStore();
  const existing = await store.read(`system_integrations/${companyId}`);
  const previousGateway = existing?.whatsAppGateway && typeof existing.whatsAppGateway === 'object'
    ? existing.whatsAppGateway as Record<string, unknown>
    : {};
  const token = text(gateway.apiToken, 240) || text(previousGateway.apiToken, 240) || '';
  const gemini = text(input.geminiApiKey, 240) || text(existing?.geminiApiKey, 240) || '';
  const branches = Array.isArray(input.branches)
    ? input.branches.map(branchRow).filter((row): row is Record<string, unknown> => Boolean(row)).slice(0, 50)
    : [];
  const stored = {
    id: `config-${companyId}`,
    companyId,
    publicVerificationDomain: text(input.publicVerificationDomain, 240) || '',
    branches,
    whatsAppGateway: {
      instanceId: text(gateway.instanceId, 120) || '',
      apiToken: token,
      defaultCountryCode: text(gateway.defaultCountryCode, 8) || '+965',
      serverUrl: text(gateway.serverUrl, 240) || '',
      isActive: gateway.isActive !== false,
      webhookUrl: text(gateway.webhookUrl, 240) || '',
    },
    ...(gemini ? { geminiApiKey: gemini } : {}),
    updatedAt: new Date().toISOString(),
  };
  await store.merge(`system_integrations/${companyId}`, stored);
  await audit(actor, {
    action: 'update',
    entityType: 'system_integrations',
    entityId: companyId,
    details: 'حفظ ربط المنشأة',
    after: {
      companyId,
      branchCount: branches.length,
      tokenStored: Boolean(token),
      geminiKeyStored: Boolean(gemini),
    },
  });
  return {
    ok: true,
    status: 200,
    body: {
      success: true,
      companyId,
      tokenStored: Boolean(token),
      geminiKeyStored: Boolean(gemini),
    },
  };
}
