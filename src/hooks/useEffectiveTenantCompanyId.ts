import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import {
  isQueryableTenantCompanyId,
  resolveTenantCompanyId,
} from '../utils/tenantCompanyId';
import { normalizeTenantCompanyId } from '../utils/contractTenantRules';

/**
 * Single SSOT for Firestore `where('companyId', '==', …)` across launcher, hierarchy, and apps.
 * The active id comes from the session profile, never from ?companyId=.
 */
export function useEffectiveTenantCompanyId(): string {
  const { user } = useAuth();
  const { activeCompany, activeCompanyId } = useCompany();

  return useMemo(() => {
    const authCompanyId = normalizeTenantCompanyId(String(user?.companyId || '').trim()) ||
      String(user?.companyId || '').trim();

    if (isQueryableTenantCompanyId(authCompanyId)) {
      return authCompanyId;
    }

    const resolved = resolveTenantCompanyId(activeCompanyId, activeCompany?.id);
    if (isQueryableTenantCompanyId(resolved)) {
      return resolved as string;
    }

    return 'comp-super-admin';
  }, [user?.companyId, activeCompanyId, activeCompany?.id]);
}
