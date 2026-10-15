export interface AuditWritePlan {
  action: 'create' | 'update' | 'delete' | 'permission_change' | 'customization';
  entityType: string;
  entityId: string;
  keepAction: boolean;
}

const ROOTS = new Set([
  'employees',
  'contracts',
  'payslips',
  'payroll_runs',
  'leave_settlements',
  'leave_requests',
  'documents',
  'companies',
  'dev_companies',
  'subscription_requests',
  'subscriptions',
]);

function entityTypeFor(root: string): string {
  if (root === 'companies' || root === 'dev_companies' || root === 'subscriptions' || root === 'subscription_requests') {
    return 'facility';
  }
  if (root === 'payslips' || root === 'payroll_runs') return 'payroll';
  if (root === 'leave_settlements') return 'settlement';
  if (root === 'leave_requests') return 'leave';
  if (root === 'employees') return 'employee';
  if (root === 'contracts') return 'contract';
  return 'document';
}

function isManualAttendance(data: unknown): boolean {
  const blob = JSON.stringify(data ?? {});
  return /يدوي|manual/i.test(blob);
}

export function planFirestoreAudit(path: string, data: unknown, op: 'set' | 'delete'): AuditWritePlan | null {
  const parts = String(path || '').split('/').filter(Boolean);
  if (parts.includes('custom_layouts')) {
    return {
      action: 'customization',
      entityType: 'custom_layout',
      entityId: parts[parts.length - 1] || '',
      keepAction: true,
    };
  }
  const root = parts[0] || '';
  const id = parts[1] || '';
  if (root === 'users') {
    if (op === 'delete') {
      return { action: 'permission_change', entityType: 'user', entityId: id, keepAction: true };
    }
    if (!data || typeof data !== 'object' || !('role' in (data as object))) return null;
    return { action: 'permission_change', entityType: 'user', entityId: id, keepAction: true };
  }
  if (root === 'attendance' || root === 'attendance_records') {
    if (op !== 'delete' && !isManualAttendance(data)) return null;
    if (op === 'delete' && !isManualAttendance(data)) return null;
    return {
      action: op === 'delete' ? 'delete' : 'update',
      entityType: 'attendance',
      entityId: id,
      keepAction: false,
    };
  }
  if (!ROOTS.has(root)) return null;
  const entityType = entityTypeFor(root);
  if (entityType === 'facility' && data && typeof data === 'object') {
    const row = data as Record<string, unknown>;
    const status = String(row.status || row.state || '').toLowerCase();
    if (status === 'archived' || row.archived === true) {
      return { action: 'delete', entityType, entityId: id, keepAction: true };
    }
  }
  return {
    action: op === 'delete' ? 'delete' : 'update',
    entityType,
    entityId: id,
    keepAction: false,
  };
}
