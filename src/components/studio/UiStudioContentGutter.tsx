import React from 'react';
import { useUiStudio } from '../../context/UiStudioContext';

/** Reserves space for the fixed Studio inspector without reflowing inner layouts. */
export const UiStudioContentGutter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uiStudioActive, canUseUiStudio } = useUiStudio();
  const reserve = canUseUiStudio && uiStudioActive;

  return (
    <div
      className="flex flex-col flex-1 min-h-0 min-w-0 transition-[padding] duration-200"
      style={reserve ? { paddingInlineStart: '20rem' } : undefined}
    >
      {children}
    </div>
  );
};
