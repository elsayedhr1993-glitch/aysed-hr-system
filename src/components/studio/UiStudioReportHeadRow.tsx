import React, { useMemo } from 'react';
import type { ReportColumnDef } from '../../config/uiStudio/reportColumns';
import { useRegisterReorderGroup } from '../../context/UiStudioContext';
import { UiStudioTableHead } from './UiStudioTableHead';

export const UiStudioReportHeadRow: React.FC<{
  columns: ReportColumnDef[];
  reorderGroupId: string;
}> = ({ columns, reorderGroupId }) => {
  const keys = useMemo(() => columns.map(c => c.key), [columns]);
  useRegisterReorderGroup(reorderGroupId, keys);
  return (
    <tr>
      {columns.map(col => (
        <UiStudioTableHead
          key={col.key}
          uiKey={col.key}
          defaults={{ label: { ar: col.ar, en: col.en } }}
          reorderGroupId={reorderGroupId}
          className={col.className || 'p-3.5'}
        />
      ))}
    </tr>
  );
};
