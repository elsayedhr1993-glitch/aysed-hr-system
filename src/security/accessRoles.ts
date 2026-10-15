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

export type TenantCollection =
  | 'payslips'
  | 'contracts'
  | 'employees'
  | 'other';

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
  if (!input.sameTenant && !input.emailMatchesCompanyAdmin) return false;
  const role = normalizeHrRole(input.role);
  if (input.emailMatchesCompanyAdmin) return true;

  if (input.collection === 'payslips') {
    return input.op === 'read' ? canReadPayroll(role) : canReadPayroll(role);
  }
  if (input.collection === 'contracts') {
    return input.op === 'read'
      ? canReadContracts(role, input.ownRecord)
      : canWriteContracts(role);
  }
  if (input.collection === 'employees') {
    if (input.op === 'read') {
      return (
        role === 'COMPANY_ADMIN' ||
        role === 'HR_MANAGER' ||
        role === 'HR_USER' ||
        role === 'FINANCE' ||
        (role === 'DEPARTMENT_MANAGER' && Boolean(input.sameDepartment)) ||
        Boolean(input.ownRecord)
      );
    }
    return role === 'COMPANY_ADMIN' || role === 'HR_MANAGER' || role === 'HR_USER';
  }
  return role !== 'UNKNOWN' && role !== 'EMPLOYEE';
}
