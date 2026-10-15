/** Roles enforced by server session and security rules. UI hiding is not enough. */
export const HR_ROLES = [
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'HR_MANAGER',
  'HR_USER',
  'FINANCE',
  'DEPARTMENT_MANAGER',
  'EMPLOYEE',
] as const;

export type HrRole = (typeof HR_ROLES)[number] | 'UNKNOWN';

const PAYROLL_ROLES = new Set(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'FINANCE']);
const CONTRACT_READ_ROLES = new Set([...PAYROLL_ROLES, 'HR_USER']);
const CONTRACT_WRITE_ROLES = new Set(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER']);
const IDENTITY_REVEAL_ROLES = new Set(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'FINANCE']);
const TOTP_REQUIRED_ROLES = new Set(['SUPER_ADMIN', 'HR_MANAGER', 'FINANCE']);

export function normalizeHrRole(role: string | undefined | null): HrRole {
  const value = String(role || '').trim().toUpperCase();
  if (value === 'TENANT_ADMIN') return 'COMPANY_ADMIN';
  if (value === 'DEPT_MANAGER') return 'DEPARTMENT_MANAGER';
  if ((HR_ROLES as readonly string[]).includes(value)) return value as HrRole;
  return 'UNKNOWN';
}

export function canReadPayroll(role: string | undefined | null): boolean {
  return PAYROLL_ROLES.has(normalizeHrRole(role));
}

export function canReadContracts(role: string | undefined | null, ownRecord = false): boolean {
  return ownRecord || CONTRACT_READ_ROLES.has(normalizeHrRole(role));
}

export function canWriteContracts(role: string | undefined | null): boolean {
  return CONTRACT_WRITE_ROLES.has(normalizeHrRole(role));
}

export function canRevealIdentity(role: string | undefined | null): boolean {
  return IDENTITY_REVEAL_ROLES.has(normalizeHrRole(role));
}

export function totpRequiredForRole(role: string | undefined | null): boolean {
  return TOTP_REQUIRED_ROLES.has(normalizeHrRole(role));
}

export const RULED_COLLECTIONS = [
  'employees',
  'contracts',
  'payslips',
  'leave_settlements',
  'loans',
  'commencements',
  'onboarding_plans',
  'documents',
  'company_documents',
  'attendance_records',
  'attendance',
  'work_entries',
  'employee_lifecycle_events',
  'work_on_holidays',
  'custodies',
  'candidates',
  'biometric_devices',
  'company_templates',
  'leave_requests',
  'leave_allocations',
  'audit_logs',
  'facility_alerts',
  'users',
  'companies',
  'dev_companies',
  'subscriptions',
  'subscription_requests',
  'system_config',
] as const;

export type TenantCollection = (typeof RULED_COLLECTIONS)[number] | 'other';

const HR_OPERATIONS = new Set<TenantCollection>([
  'commencements',
  'onboarding_plans',
  'documents',
  'company_documents',
  'attendance_records',
  'attendance',
  'work_entries',
  'employee_lifecycle_events',
  'work_on_holidays',
  'custodies',
  'candidates',
  'biometric_devices',
  'company_templates',
]);

const DEPARTMENT_READ = new Set<TenantCollection>([
  'attendance_records',
  'attendance',
  'work_entries',
  'work_on_holidays',
  'leave_requests',
  'leave_allocations',
]);

const PAYROLL_COLLECTIONS = new Set<TenantCollection>(['payslips', 'leave_settlements', 'loans']);

const PLATFORM_ONLY = new Set<TenantCollection>(['subscriptions', 'subscription_requests']);

/**
 * Simulation of the Firestore role matrix. Tests call this instead of production.
 * firestore.rules must stay aligned with these decisions.
 */
export function decideTenantAccess(input: {
  role: string | undefined | null;
  collection: TenantCollection;
  op: 'read' | 'write';
  sameTenant: boolean;
  platformAdmin?: boolean;
  ownRecord?: boolean;
  sameDepartment?: boolean;
  emailMatchesCompanyAdmin?: boolean;
}): boolean {
  if (input.platformAdmin || normalizeHrRole(input.role) === 'SUPER_ADMIN') return true;
  const role = normalizeHrRole(input.role);
  if (role === 'UNKNOWN' && !input.emailMatchesCompanyAdmin) return false;
  if (PLATFORM_ONLY.has(input.collection)) return false;
  if (!input.sameTenant && !input.emailMatchesCompanyAdmin) return false;
  if (input.emailMatchesCompanyAdmin) return true;

  const readHr = role === 'COMPANY_ADMIN' || role === 'HR_MANAGER' || role === 'HR_USER' || role === 'FINANCE';
  const writeHr = role === 'COMPANY_ADMIN' || role === 'HR_MANAGER' || role === 'HR_USER';
  const deptRead = role === 'DEPARTMENT_MANAGER' && Boolean(input.sameDepartment);
  const own = Boolean(input.ownRecord);

  if (PAYROLL_COLLECTIONS.has(input.collection)) return canReadPayroll(role);
  if (input.collection === 'contracts') {
    return input.op === 'read' ? canReadContracts(role, own) : canWriteContracts(role);
  }
  if (input.collection === 'employees') {
    if (input.op === 'read') return readHr || deptRead || own;
    return writeHr;
  }
  if (input.collection === 'leave_requests') {
    if (input.op === 'read') return readHr || deptRead || own;
    return writeHr || own;
  }
  if (input.collection === 'leave_allocations') {
    if (input.op === 'read') return readHr || deptRead || own;
    return writeHr;
  }
  if (input.collection === 'audit_logs') {
    return role === 'COMPANY_ADMIN' || role === 'HR_MANAGER';
  }
  if (input.collection === 'facility_alerts') {
    if (input.op === 'read') return role === 'COMPANY_ADMIN' || role === 'HR_MANAGER' || role === 'HR_USER';
    return role === 'COMPANY_ADMIN' || role === 'HR_MANAGER';
  }
  if (input.collection === 'users') return own;
  if (input.collection === 'companies' || input.collection === 'dev_companies') {
    return input.op === 'read';
  }
  if (input.collection === 'system_config') {
    return input.op === 'read' ? readHr : role === 'COMPANY_ADMIN';
  }
  if (HR_OPERATIONS.has(input.collection)) {
    if (input.op === 'read') return readHr || (deptRead && DEPARTMENT_READ.has(input.collection));
    return writeHr;
  }
  return false;
}
