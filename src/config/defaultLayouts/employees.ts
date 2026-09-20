import type { ScreenCustomLayout } from '../../types/customLayout';

/** Anchor tab for custom fields shown in EmployeeQuickEditModal */
export const EMPLOYEES_QUICK_EDIT_TAB_ID = 'quick_edit';

export const defaultEmployeesScreenLayout = (companyId: string): ScreenCustomLayout => ({
  screenId: 'employees',
  companyId,
  version: 1,
  tabs: [
    {
      id: EMPLOYEES_QUICK_EDIT_TAB_ID,
      label: { ar: 'تعديل سريع (دليل الموظفين)', en: 'Employee quick edit' },
      order: 1,
      visible: true,
      icon: 'User',
    },
  ],
  fields: [],
  customFields: [],
  updatedAt: new Date().toISOString(),
});
