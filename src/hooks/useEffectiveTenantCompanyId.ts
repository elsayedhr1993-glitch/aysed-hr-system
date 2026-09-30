import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { isSuperAdminPrincipal } from '../config/superAdminAccess';
import {
  isQueryableTenantCompanyId,
  readCompanyIdFromUrl,
  resolveTenantCompanyId,
} from '../utils/tenantCompanyId';

/**
 * Single SSOT for Firestore `where('companyId', '==', …)` across launcher, hierarchy, and apps.
 * Honors ?companyId= for platform super admins and for tenants when it matches their bound company.
 */
export function useEffectiveTenantCompanyId(): string {
  const { user } = useAuth();
  const { activeCompany, activeCompanyId } = useCompany();

  return useMemo(() => {
    const urlCompanyId = readCompanyIdFromUrl();
    const authCompanyId = String(user?.companyId || '').trim();
    const superAdmin = isSuperAdminPrincipal({ role: user?.role, email: user?.email });

    if (superAdmin && isQueryableTenantCompanyId(urlCompanyId)) {
      return urlCompanyId;
    }

    if (
      !superAdmin &&
      isQueryableTenantCompanyId(urlCompanyId) &&
      authCompanyId &&
      urlCompanyId === authCompanyId
    ) {
      return urlCompanyId;
    }

    if (isQueryableTenantCompanyId(authCompanyId)) {
      return authCompanyId;
    }

    const resolved = resolveTenantCompanyId(activeCompanyId, activeCompany?.id, urlCompanyId);
    if (isQueryableTenantCompanyId(resolved)) {
      return resolved as string;
    }

    return 'comp-super-admin';
  }, [user?.role, user?.companyId, user?.email, activeCompanyId, activeCompany?.id]);
}
