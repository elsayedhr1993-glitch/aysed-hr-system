import { useCompany } from '../context/CompanyContext';

export function useIsolatedData<T extends { companyId?: string }>(dataList: T[]) {
  const { activeCompanyId } = useCompany();

  // 1. فلترة البيانات المعروضة لتطابق الشركة المحددة فقط (أو العناصر التي ليس لها companyId لتوافق التوافقية)
  const isolatedData = dataList.filter(
    (item) => !item.companyId || item.companyId === activeCompanyId || activeCompanyId === 'comp-super-admin'
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
