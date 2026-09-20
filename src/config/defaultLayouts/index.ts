import type { ScreenCustomLayout, ScreenId } from '../../types/customLayout';
import { defaultEmployeesScreenLayout } from './employees';
import { defaultLeavesScreenLayout } from './leaves';

export function getDefaultScreenLayout(screenId: ScreenId, companyId: string): ScreenCustomLayout {
  switch (screenId) {
    case 'employees':
      return defaultEmployeesScreenLayout(companyId);
    case 'leaves':
      return defaultLeavesScreenLayout(companyId);
    default:
      return {
        screenId,
        companyId,
        version: 1,
        tabs: [],
        fields: [],
        customFields: [],
        updatedAt: new Date().toISOString(),
      };
  }
}
