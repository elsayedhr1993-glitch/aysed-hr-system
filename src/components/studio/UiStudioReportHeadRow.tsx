import React from 'react';
import type { ReportColumnDef } from '../../config/uiStudio/reportColumns';
import { UiStudioTableHead } from './UiStudioTableHead';

export const UiStudioReportHeadRow: React.FC<{ columns: ReportColumnDef[] }> = ({ columns }) => {
  const keys = columns.map(c => c.key);
  return (
    <tr>
      {columns.map(col => (
        <UiStudioTableHead
          key={col.key}
          uiKey={col.key}
          defaults={{ label: { ar: col.ar, en: col.en } }}
          reorderGroupKeys={keys}
          className={col.className || 'p-3.5'}
        />
      ))}
    </tr>
  );
};
