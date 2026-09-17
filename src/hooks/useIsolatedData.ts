import { useCompany } from '../context/CompanyContext';

export function useIsolatedData<T extends { companyId?: string }>(dataList: T[]) {
  const { activeCompanyId } = useCompany();

  // Fail-closed tenant isolation: no company context → empty; missing companyId on row → exclude
  const isolatedData =
    !activeCompanyId || activeCompanyId === 'SAAS_PLATFORM'
      ? []
      : dataList.filter((item) => {
          if (!item.companyId) return false;
          return item.companyId === activeCompanyId;
        });

  // Stamp companyId on new records (no-op stamp if platform context)
  const attachCompany = (newItem: Omit<T, 'companyId'>): T => {
    return {
      ...newItem,
      companyId: activeCompanyId && activeCompanyId !== 'SAAS_PLATFORM' ? activeCompanyId : undefined,
    } as T;
  };

  return {
    isolatedData,
    attachCompany,
    activeCompanyId,
  };
}
