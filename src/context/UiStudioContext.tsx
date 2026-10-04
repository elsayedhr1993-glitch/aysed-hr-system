import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import { useTenant } from './TenantContext';
import { patchUiOverrides, subscribeUiOverrides } from '../services/uiOverrideService';
import type { UiElementDefaults, UiElementOverride, UiOverridesDocument, UiElementKind } from '../types/uiOverrides';
import { resolveUiElement } from '../utils/uiOverrideUtils';
import type { ResolvedUiElement } from '../types/uiOverrides';
import { toast } from 'react-hot-toast';

const SESSION_KEY = 'aysed_ui_studio_mode';

export interface StudioSelection {
  uiKey: string;
  defaults: UiElementDefaults;
  kind?: UiElementKind;
  reorderGroupId?: string;
}

interface UiStudioContextValue {
  canUseUiStudio: boolean;
  uiStudioActive: boolean;
  toggleUiStudio: () => void;
  setUiStudioActive: (active: boolean) => void;
  overridesDoc: UiOverridesDocument | null;
  selection: StudioSelection | null;
  selectElement: (sel: StudioSelection) => void;
  clearSelection: () => void;
  registerReorderGroup: (groupId: string, orderedKeys: string[]) => void;
  reorderInGroup: (groupId: string, fromKey: string, toKey: string) => Promise<void>;
  resolveElement: (key: string, defaults: UiElementDefaults) => ResolvedUiElement;
  saveElementPatch: (
    key: string,
    patch: Partial<UiElementOverride>,
    options?: { quiet?: boolean }
  ) => Promise<void>;
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
  const [selection, setSelection] = useState<StudioSelection | null>(null);
  const reorderGroupsRef = useRef<Record<string, string[]>>({});

  const setUiStudioActive = useCallback((active: boolean) => {
    setUiStudioActiveState(active);
    if (!active) setSelection(null);
    try {
      sessionStorage.setItem(SESSION_KEY, active ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleUiStudio = useCallback(() => {
    const next = !uiStudioActive;
    setUiStudioActive(next);
    toast(next ? 'وضع Studio — انقر عنصراً لتحريره من اللوحة الجانبية' : 'تم إيقاف وضع التخصيص', {
      icon: next ? '🎨' : '⏸️',
    });
  }, [uiStudioActive, setUiStudioActive]);

  useEffect(() => {
    if (!companyId) {
      setOverridesDoc(null);
      return;
    }
    return subscribeUiOverrides(companyId, setOverridesDoc);
  }, [companyId]);

  const selectElement = useCallback((sel: StudioSelection) => {
    setSelection(sel);
  }, []);

  const clearSelection = useCallback(() => setSelection(null), []);

  const registerReorderGroup = useCallback((groupId: string, orderedKeys: string[]) => {
    reorderGroupsRef.current[groupId] = orderedKeys;
  }, []);

  const resolveElement = useCallback(
    (key: string, defaults: UiElementDefaults): ResolvedUiElement => {
      const override = overridesDoc?.elements?.[key];
      return resolveUiElement(key, defaults, override);
    },
    [overridesDoc]
  );

  const saveElementPatch = useCallback(
    async (
      key: string,
      patch: Partial<UiElementOverride>,
      options?: { quiet?: boolean }
    ) => {
      if (!isActualSuperAdmin || !companyId) return;
      try {
        const next = await patchUiOverrides(
          companyId,
          { [key]: patch },
          user?.email || user?.uid,
          overridesDoc ?? undefined
        );
        setOverridesDoc(next);
        if (!options?.quiet) toast.success('تم حفظ التخصيص');
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
      } catch (e) {
        console.error(e);
        toast.error('فشل حفظ الترتيب');
      }
    },
    [isActualSuperAdmin, companyId, user, overridesDoc]
  );

  const reorderInGroup = useCallback(
    async (groupId: string, fromKey: string, toKey: string) => {
      let keys = reorderGroupsRef.current[groupId];
      if (!keys?.length && groupId.startsWith('legacy:')) {
        keys = groupId.replace('legacy:', '').split('|').filter(Boolean);
      }
      if (!keys?.length) return;
      const from = keys.indexOf(fromKey);
      const to = keys.indexOf(toKey);
      if (from < 0 || to < 0) return;
      const next = [...keys];
      next.splice(from, 1);
      next.splice(to, 0, fromKey);
      reorderGroupsRef.current[groupId] = next;
      await reorderKeys(next);
    },
    [reorderKeys]
  );

  const value = useMemo<UiStudioContextValue>(
    () => ({
      canUseUiStudio: isActualSuperAdmin,
      uiStudioActive: isActualSuperAdmin && uiStudioActive,
      toggleUiStudio,
      setUiStudioActive,
      overridesDoc,
      selection,
      selectElement,
      clearSelection,
      registerReorderGroup,
      reorderInGroup,
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
      selection,
      selectElement,
      clearSelection,
      registerReorderGroup,
      reorderInGroup,
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

/** Call from list parents to enable drag-and-drop reorder for a Studio group. */
export function useRegisterReorderGroup(groupId: string, orderedKeys: string[]) {
  const { registerReorderGroup } = useUiStudio();
  useEffect(() => {
    registerReorderGroup(groupId, orderedKeys);
  }, [groupId, orderedKeys, registerReorderGroup]);
}
