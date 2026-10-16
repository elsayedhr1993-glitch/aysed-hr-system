import { afterEach, describe, expect, it } from 'vitest';
import type { Request } from 'express';
import {
  applySessionCompanyOnBody,
  sessionCompanyFromPrincipal,
  sessionRoleFromPrincipal,
  stripClientCompanyHints,
} from '../../server/tenantScope';
import { setImpersonationGate } from './impersonationGate';
import {
  canReadPayroll,
  canRevealIdentity,
  decideTenantAccess,
  normalizeHrRole,
} from './accessRoles';
import {
  canAutoMaterializeContractForEmployee,
  employeeBelongsToTenant,
  employeeVisibleInDirectory,
} from '../utils/contractTenantRules';

const MANAR = 'comp-1788442584841';
const ELITE = 'comp-1788435917695';
const FANAR = 'tenant_1788413304890';

afterEach(() => {
  setImpersonationGate({ readOnly: false, hideSensitive: false });
});

describe('tenant isolation edges', () => {
  it('keeps an employee inside the facility and out of the others', () => {
    const manarEmployee = { companyId: '1788442584841', fullNameAr: 'اختبار' };
    const eliteEmployee = { companyId: ELITE, fullNameAr: 'اختبار' };
    expect(employeeBelongsToTenant(manarEmployee, MANAR)).toBe(true);
    expect(employeeBelongsToTenant(manarEmployee, ELITE)).toBe(false);
    expect(employeeBelongsToTenant(eliteEmployee, MANAR)).toBe(false);
    expect(employeeBelongsToTenant({ companyId: 'comp-alfanar' }, FANAR)).toBe(true);
    expect(employeeBelongsToTenant(manarEmployee, '')).toBe(false);
    expect(employeeBelongsToTenant({}, MANAR)).toBe(false);
    expect(canAutoMaterializeContractForEmployee(eliteEmployee, MANAR)).toBe(false);
    expect(canAutoMaterializeContractForEmployee(manarEmployee, MANAR)).toBe(true);
  });

  it('does not list another facility unless the directory flag says so', () => {
    const eliteEmployee = { companyId: ELITE };
    expect(employeeVisibleInDirectory(eliteEmployee, MANAR)).toBe(false);
    expect(employeeVisibleInDirectory(eliteEmployee, MANAR, { includeNonTenantCompany: true })).toBe(true);
    expect(employeeVisibleInDirectory(eliteEmployee, 'comp-super-admin')).toBe(true);
    expect(employeeVisibleInDirectory({ companyId: ELITE, _tenantFirestoreMatch: true }, MANAR)).toBe(true);
  });

  it('takes the facility from the server profile, not from a forged claim', () => {
    expect(sessionCompanyFromPrincipal({
      userDoc: { companyId: MANAR },
      claims: { companyId: ELITE },
    })).toBe(MANAR);
    expect(sessionCompanyFromPrincipal({
      userDoc: {},
      claims: { company_id: ELITE },
    })).toBe(ELITE);
    expect(sessionCompanyFromPrincipal({ userDoc: {}, claims: {} })).toBeUndefined();
    expect(sessionRoleFromPrincipal({
      isPlatformAdmin: true,
      userDoc: { role: 'EMPLOYEE' },
      claims: { role: 'EMPLOYEE' },
    })).toBe('SUPER_ADMIN');
    expect(sessionRoleFromPrincipal({
      userDoc: { role: 'HR_MANAGER' },
      claims: { role: 'EMPLOYEE' },
    })).toBe('HR_MANAGER');
    expect(normalizeHrRole('TENANT_ADMIN')).toBe('COMPANY_ADMIN');
    expect(normalizeHrRole('')).toBe('UNKNOWN');
  });

  it('rejects a body facility id that is not the session facility', () => {
    const forged = { companyId: ELITE, name: 'x' };
    expect(applySessionCompanyOnBody(forged, MANAR)).toEqual({
      ok: false,
      error: 'معرّف المنشأة يُؤخذ من الجلسة فقط',
    });
    expect(forged.companyId).toBe(ELITE);

    const blank = { companyId: '   ' };
    expect(applySessionCompanyOnBody(blank, MANAR)).toEqual({ ok: true });
    expect(blank.companyId).toBe(MANAR);

    const unscoped = { name: 'x' };
    expect(applySessionCompanyOnBody(unscoped, MANAR)).toEqual({ ok: true });
    expect(applySessionCompanyOnBody([{ companyId: ELITE }], MANAR)).toEqual({ ok: true });
    expect(applySessionCompanyOnBody(null, MANAR)).toEqual({ ok: true });

    const req = {
      query: { companyId: ELITE, cid: ELITE, keep: '1' },
      headers: { 'x-company-id': ELITE, authorization: 'Bearer token' },
    } as unknown as Request;
    stripClientCompanyHints(req);
    expect(req.query.companyId).toBeUndefined();
    expect(req.query.cid).toBeUndefined();
    expect(req.query.keep).toBe('1');
    expect(req.headers['x-company-id']).toBeUndefined();
    expect(req.headers.authorization).toBe('Bearer token');
  });
});

describe('permission edges', () => {
  it('blocks payroll and identity while impersonation hides sensitive data', () => {
    setImpersonationGate({ readOnly: true, hideSensitive: true });
    expect(canReadPayroll('FINANCE')).toBe(false);
    expect(canRevealIdentity('COMPANY_ADMIN')).toBe(false);
    expect(decideTenantAccess({
      role: 'FINANCE',
      collection: 'payslips',
      op: 'read',
      sameTenant: true,
    })).toBe(false);
  });

  it('denies cross-facility reads and writes for facility roles', () => {
    const denied = [
      decideTenantAccess({ role: 'HR_MANAGER', collection: 'employees', op: 'read', sameTenant: false }),
      decideTenantAccess({ role: 'COMPANY_ADMIN', collection: 'payslips', op: 'read', sameTenant: false }),
      decideTenantAccess({ role: 'HR_USER', collection: 'contracts', op: 'write', sameTenant: false }),
      decideTenantAccess({ role: 'FINANCE', collection: 'leave_settlements', op: 'read', sameTenant: false }),
      decideTenantAccess({ role: 'HR_MANAGER', collection: 'audit_logs', op: 'read', sameTenant: false }),
    ];
    expect(denied).toEqual([false, false, false, false, false]);
    expect(decideTenantAccess({
      role: 'SUPER_ADMIN',
      collection: 'employees',
      op: 'read',
      sameTenant: false,
    })).toBe(true);
    // TODO: مراجعة امتثال. السلوك الحالي يسمح بعبور المنشأة عند تطابق بريد مدير المنشأة.
    expect(decideTenantAccess({
      role: 'UNKNOWN',
      collection: 'payslips',
      op: 'read',
      sameTenant: false,
      emailMatchesCompanyAdmin: true,
    })).toBe(true);
  });

  it('keeps salary data, contracts, and audit writes on the current role matrix', () => {
    expect(decideTenantAccess({ role: 'EMPLOYEE', collection: 'payslips', op: 'read', sameTenant: true })).toBe(false);
    expect(decideTenantAccess({ role: 'HR_USER', collection: 'payslips', op: 'read', sameTenant: true })).toBe(false);
    expect(decideTenantAccess({ role: 'FINANCE', collection: 'payslips', op: 'read', sameTenant: true })).toBe(true);
    expect(decideTenantAccess({ role: 'FINANCE', collection: 'contracts', op: 'write', sameTenant: true })).toBe(false);
    expect(decideTenantAccess({ role: 'HR_USER', collection: 'contracts', op: 'read', sameTenant: true })).toBe(true);
    expect(decideTenantAccess({ role: 'HR_USER', collection: 'contracts', op: 'write', sameTenant: true })).toBe(false);
    expect(decideTenantAccess({
      role: 'EMPLOYEE',
      collection: 'contracts',
      op: 'read',
      sameTenant: true,
      ownRecord: true,
    })).toBe(true);
    expect(decideTenantAccess({
      role: 'EMPLOYEE',
      collection: 'contracts',
      op: 'write',
      sameTenant: true,
      ownRecord: true,
    })).toBe(false);
    expect(decideTenantAccess({
      role: 'EMPLOYEE',
      collection: 'leave_requests',
      op: 'read',
      sameTenant: true,
      ownRecord: true,
    })).toBe(true);
    expect(decideTenantAccess({
      role: 'EMPLOYEE',
      collection: 'leave_requests',
      op: 'read',
      sameTenant: true,
      ownRecord: false,
    })).toBe(false);
    expect(decideTenantAccess({
      role: 'DEPARTMENT_MANAGER',
      collection: 'attendance',
      op: 'read',
      sameTenant: true,
      sameDepartment: true,
    })).toBe(true);
    expect(decideTenantAccess({
      role: 'DEPARTMENT_MANAGER',
      collection: 'attendance',
      op: 'read',
      sameTenant: true,
      sameDepartment: false,
    })).toBe(false);
    expect(decideTenantAccess({
      role: 'DEPARTMENT_MANAGER',
      collection: 'payslips',
      op: 'read',
      sameTenant: true,
      sameDepartment: true,
    })).toBe(false);
    expect(decideTenantAccess({ role: 'UNKNOWN', collection: 'employees', op: 'read', sameTenant: true })).toBe(false);
    expect(decideTenantAccess({ role: '', collection: 'employees', op: 'read', sameTenant: true })).toBe(false);
    expect(decideTenantAccess({
      role: 'TENANT_ADMIN',
      collection: 'employees',
      op: 'write',
      sameTenant: true,
    })).toBe(true);
    expect(decideTenantAccess({
      role: 'COMPANY_ADMIN',
      collection: 'subscriptions',
      op: 'read',
      sameTenant: true,
    })).toBe(false);
    expect(decideTenantAccess({
      role: 'COMPANY_ADMIN',
      collection: 'companies',
      op: 'write',
      sameTenant: true,
    })).toBe(false);
    expect(decideTenantAccess({
      role: 'COMPANY_ADMIN',
      collection: 'companies',
      op: 'read',
      sameTenant: true,
    })).toBe(true);
    expect(decideTenantAccess({
      role: 'EMPLOYEE',
      collection: 'users',
      op: 'read',
      sameTenant: true,
      ownRecord: true,
    })).toBe(true);
    expect(decideTenantAccess({
      role: 'EMPLOYEE',
      collection: 'users',
      op: 'read',
      sameTenant: true,
      ownRecord: false,
    })).toBe(false);
    expect(decideTenantAccess({
      role: 'SUPER_ADMIN',
      collection: 'audit_logs',
      op: 'delete',
      sameTenant: true,
      platformAdmin: true,
    })).toBe(false);
    expect(decideTenantAccess({
      role: 'HR_MANAGER',
      collection: 'audit_logs',
      op: 'read',
      sameTenant: true,
    })).toBe(true);
    expect(decideTenantAccess({
      role: 'HR_USER',
      collection: 'audit_logs',
      op: 'read',
      sameTenant: true,
    })).toBe(false);
  });
});
