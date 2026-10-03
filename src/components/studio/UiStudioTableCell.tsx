import React from 'react';
import type { UiElementDefaults } from '../../types/uiOverrides';
import { useUiStudioLabel } from './UiStudioTarget';

interface Props {
  uiKey: string;
  defaults: UiElementDefaults;
  className?: string;
  children: React.ReactNode;
}

/** Hides table cell when column is hidden in Studio (batch 6). */
export const UiStudioTableCell: React.FC<Props> = ({ uiKey, defaults, className, children }) => {
  const { hidden } = useUiStudioLabel(uiKey, { ...defaults, kind: 'column' });
  if (hidden) return null;
  return <td className={className}>{children}</td>;
};
