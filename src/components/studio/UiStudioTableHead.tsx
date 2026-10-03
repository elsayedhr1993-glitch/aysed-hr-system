import React from 'react';
import type { UiElementDefaults } from '../../types/uiOverrides';
import { UiStudioTarget, useUiStudioLabel } from './UiStudioTarget';

interface Props {
  uiKey: string;
  defaults: UiElementDefaults;
  reorderGroupKeys?: string[];
  className?: string;
}

export const UiStudioTableHead: React.FC<Props> = ({
  uiKey,
  defaults,
  reorderGroupKeys,
  className = 'p-3.5',
}) => {
  const { hidden, label } = useUiStudioLabel(uiKey, { ...defaults, kind: 'column' });
  if (hidden) return null;
  return (
    <th className={className}>
      <UiStudioTarget
        uiKey={uiKey}
        kind="column"
        defaults={defaults}
        reorderGroupKeys={reorderGroupKeys}
      >
        {label}
      </UiStudioTarget>
    </th>
  );
};
