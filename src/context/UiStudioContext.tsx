import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import { useTenant } from './TenantContext';
import { patchUiOverrides, subscribeUiOverrides } from '../services/uiOverrideService';
import type { UiElementDefaults, UiElementOverride, UiOverridesDocument } from '../types/uiOverrides';
import { resolveUiElement } from '../utils/uiOverrideUtils';
import type { ResolvedUiElement } from '../types/uiOverrides';
import { toast } from 'react-hot-toast';

const SESSION_KEY = 'aysed_ui_studio_mode';

interface UiStudioContextValue {
  canUseUiStudio: boolean;
  uiStudioActive: boolean;
  toggleUiStudio: () => void;
  setUiStudioActive: (active: boolean) => void;
  overridesDoc: UiOverridesDocument | null;
  resolveElement: (key: string, defaults: UiElementDefaults) => ResolvedUiElement;
  saveElementPatch: (key: string, patch: Partial<UiElementOverride>) => Promise<void>;
  hideElement: (key: string) => Promise<void>;
  reorderKeys: (orderedKeys: string[], baseOrders?: number[]) => Promise<void>;
  exportOverridesJson: () => void;
}

const UiStudioContext = createContext<UiStudioContextValue | undefined>(undefined);

export const UiStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isActualSuperAdmin } = useTenant();
  const { activeCompanyId, activeCompany } = useCompany();
  const { user } = useAuth();

  const companyId =
    activeCompanyId && activeCompanyId !== 'SAAS_PLATFORM'
      ? activeCompanyId
      : activeCompany?.id || '';

  const [uiStudioActive, setUiStudioActiveState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_KEY) === '1';
  });
  const [overridesDoc, setOverridesDoc] = useState<UiOverridesDocument | null>(null);

  const setUiStudioActive = useCallback((active: boolean) => {
    setUiStudioActiveState(active);
    try {
      sessionStorage.setItem(SESSION_KEY, active ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleUiStudio = useCallback(() => {
    setUiStudioActive(!uiStudioActive);
    toast(uiStudioActive ? 'تم إيقاف وضع التخصيص' : 'وضع التخصيص (Studio) مفعّل', {
      icon: uiStudioActive ? '⏸️' : '🎨',
    });
  }, [uiStudioActive, setUiStudioActive]);

  useEffect(() => {
    if (!companyId) {
      setOverridesDoc(null);
      return;
    }
    return subscribeUiOverrides(companyId, setOverridesDoc);
  }, [companyId]);

  const resolveElement = useCallback(
    (key: string, defaults: UiElementDefaults): ResolvedUiElement => {
      const override = overridesDoc?.elements?.[key];
      return resolveUiElement(key, defaults, override);
    },
    [overridesDoc]
  );

  const saveElementPatch = useCallback(
    async (key: string, patch: Partial<UiElementOverride>) => {
      if (!isActualSuperAdmin || !companyId) return;
      try {
        const next = await patchUiOverrides(
          companyId,
          { [key]: patch },
          user?.email || user?.uid,
          overridesDoc ?? undefined
        );
        setOverridesDoc(next);
        toast.success('تم حفظ التخصيص');
      } catch (e) {
        console.error(e);
        toast.error('فشل حفظ التخصيص في Firestore');
      }
    },
    [isActualSuperAdmin, companyId, user, overridesDoc]
  );

  const hideElement = useCallback(
    async (key: string) => {
      await saveElementPatch(key, { hidden: true });
    },
    [saveElementPatch]
  );

  const exportOverridesJson = useCallback(() => {
    if (!overridesDoc) {
      toast.error('لا توجد تخصيصات لتصديرها بعد');
      return;
    }
    const blob = new Blob([JSON.stringify(overridesDoc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ui_overrides_${companyId || 'tenant'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تصدير تخصيصات Studio');
  }, [overridesDoc, companyId]);

  const reorderKeys = useCallback(
    async (orderedKeys: string[], baseOrders: number[] = []) => {
      if (!isActualSuperAdmin || !companyId) return;
      const patches: Record<string, Partial<UiElementOverride>> = {};
      orderedKeys.forEach((key, index) => {
        patches[key] = { order: baseOrders[index] ?? (index + 1) * 10 };
      });
      try {
        const next = await patchUiOverrides(
          companyId,
          patches,
          user?.email || user?.uid,
          overridesDoc ?? undefined
        );
        setOverridesDoc(next);
        toast.success('تم تحديث الترتيب');
      } catch (e) {
        console.error(e);
        toast.error('فشل حفظ الترتيب');
      }
    },
    [isActualSuperAdmin, companyId, user, overridesDoc]
  );

  const value = useMemo<UiStudioContextValue>(
    () => ({
      canUseUiStudio: isActualSuperAdmin,
      uiStudioActive: isActualSuperAdmin && uiStudioActive,
      toggleUiStudio,
      setUiStudioActive,
      overridesDoc,
      resolveElement,
      saveElementPatch,
      hideElement,
      reorderKeys,
      exportOverridesJson,
    }),
    [
      isActualSuperAdmin,
      uiStudioActive,
      toggleUiStudio,
      setUiStudioActive,
      overridesDoc,
      resolveElement,
      saveElementPatch,
      hideElement,
      reorderKeys,
      exportOverridesJson,
    ]
  );

  return <UiStudioContext.Provider value={value}>{children}</UiStudioContext.Provider>;
};

export function useUiStudio(): UiStudioContextValue {
  const ctx = useContext(UiStudioContext);
  if (!ctx) {
    throw new Error('useUiStudio must be used within UiStudioProvider');
  }
  return ctx;
}
