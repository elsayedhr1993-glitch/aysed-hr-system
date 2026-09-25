import { useMemo } from 'react';
import type { Company } from '../types';
import { useCompany } from '../context/CompanyContext';
import { resolveTenantCompanyId } from '../utils/tenantCompanyId';
import { useTenantCompanyProfile } from './useTenantCompanyProfile';
import { getCompanyPrintProfile, type CompanyPrintProfile } from '../utils/companyPrintProfile';

/** Live tenant company + print profile (Firestore overlay + SSOT header fields). */
export function useCompanyForPrint(
  tenantCompanyIdOverride?: string
): { company: Company; profile: CompanyPrintProfile } {
  const { activeCompany, activeCompanyId } = useCompany();
  const tenantId = resolveTenantCompanyId(
    tenantCompanyIdOverride || activeCompanyId,
    activeCompany?.id
  );
  const company = useTenantCompanyProfile(tenantId, activeCompany);
  const profile = useMemo(() => getCompanyPrintProfile(company), [company]);
  return { company, profile };
}
