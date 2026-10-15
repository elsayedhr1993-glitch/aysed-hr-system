import { reportAudit } from '../services/auditClient';

type AuditUserProfile = {
  id?: string;
  name?: string;
};

const KNOWN_ACTIONS = new Set([
  'create',
  'update',
  'delete',
  'export',
  'view_sensitive',
  'login',
  'login_failure',
  'permission_change',
  'customization',
  'device_rejected',
]);

function normalizeAction(action: string): string {
  const key = String(action || '').trim().toLowerCase();
  if (key === 'soft_delete' || key === 'restore') return 'delete';
  if (KNOWN_ACTIONS.has(key)) return key;
  return 'update';
}

/** Writes through the server audit recorder. A failed write does not throw. */
export async function logAction(
  profile: AuditUserProfile | null,
  action: 'create' | 'update' | 'delete' | string,
  resource: string,
  targetId: string | null,
  details: string
) {
  try {
    await reportAudit({
      action: normalizeAction(action),
      entityType: resource || 'record',
      entityId: targetId || '',
      userName: profile?.name || profile?.id || '',
      details,
    });
  } catch (error) {
    console.error('[audit] logAction failed', error);
  }
  return true;
}
