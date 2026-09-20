import type { ScreenCustomLayout } from '../../types/customLayout';

export const defaultLeavesScreenLayout = (companyId: string): ScreenCustomLayout => ({
  screenId: 'leaves',
  companyId,
  version: 1,
  tabs: [
    {
      id: 'requests',
      label: {
        ar: 'طلبات الإجازات والاعتمادات',
        en: 'Leave requests & approvals',
      },
      order: 1,
      visible: true,
      icon: 'CalendarDays',
    },
    {
      id: 'timeline',
      label: {
        ar: 'مخطط تداخل الغيابات وتغطية الأقسام (Timeline)',
        en: 'Absence overlap timeline',
      },
      order: 2,
      visible: true,
      icon: 'BarChart',
    },
    {
      id: 'operational_absence',
      label: {
        ar: 'غياب تشغيلي (من الحضور)',
        en: 'Operational absence (attendance)',
      },
      order: 3,
      visible: true,
      icon: 'AlertTriangle',
    },
    {
      id: 'allocations',
      label: {
        ar: 'الأرصدة الافتتاحية والمرحّلة',
        en: 'Opening & carried balances',
      },
      order: 4,
      visible: true,
      icon: 'Layers',
    },
    {
      id: 'finance',
      label: {
        ar: 'المركز المالي لتسويات وبدل الإجازات (Settlements)',
        en: 'Finance & leave settlements',
      },
      order: 5,
      visible: true,
      locked: true,
      icon: 'DollarSign',
    },
  ],
  fields: [],
  customFields: [],
  updatedAt: new Date().toISOString(),
});
