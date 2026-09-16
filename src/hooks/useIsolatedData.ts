import { useCompany } from '../context/CompanyContext';

export function useIsolatedData<T extends { companyId?: string }>(dataList: T[]) {
  const { activeCompanyId } = useCompany();

  // 1. Strict tenant isolation filtering
  const isolatedData = dataList.filter(
    (item) => {
      if (!activeCompanyId || activeCompanyId === 'comp-super-admin') return true;
      const itemComp = item.companyId || 'comp-super-admin';
      return itemComp === activeCompanyId;
    }
  );

  // 2. دالة لختم كود الشركة تلقائياً عند إنشاء أي سجل جديد
  const attachCompany = (newItem: Omit<T, 'companyId'>): T => {
    return {
      ...newItem,
      companyId: activeCompanyId,
    } as T;
  };

  return {
    isolatedData,
    attachCompany,
    activeCompanyId,
  };
}
