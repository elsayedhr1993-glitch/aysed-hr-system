import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTenant } from './TenantContext';

interface LayoutStudioContextValue {
  /** True only for platform Super Admin (not tenant COMPANY_ADMIN) */
  canEditCustomLayout: boolean;
  studioMode: boolean;
  setStudioMode: (enabled: boolean) => void;
  toggleStudioMode: () => void;
}

const LayoutStudioContext = createContext<LayoutStudioContextValue | undefined>(undefined);

export const LayoutStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isActualSuperAdmin } = useTenant();
  const [studioMode, setStudioMode] = useState(false);

  const value = useMemo<LayoutStudioContextValue>(
    () => ({
      canEditCustomLayout: isActualSuperAdmin,
      studioMode: isActualSuperAdmin && studioMode,
      setStudioMode: enabled => {
        if (!isActualSuperAdmin) return;
        setStudioMode(enabled);
      },
      toggleStudioMode: () => {
        if (!isActualSuperAdmin) return;
        setStudioMode(prev => !prev);
      },
    }),
    [isActualSuperAdmin, studioMode]
  );

  return <LayoutStudioContext.Provider value={value}>{children}</LayoutStudioContext.Provider>;
};

export function useLayoutStudio(): LayoutStudioContextValue {
  const ctx = useContext(LayoutStudioContext);
  if (!ctx) {
    throw new Error('useLayoutStudio must be used within LayoutStudioProvider');
  }
  return ctx;
}
