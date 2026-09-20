import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import { useTenant } from './TenantContext';
import { saveScreenLayout } from '../services/customLayoutService';
import type {
  CustomFieldLayout,
  CustomFieldType,
  LayoutTabDefinition,
  ResolvedScreenLayout,
  ScreenCustomLayout,
  ScreenId,
} from '../types/customLayout';
import {
  createCustomFieldDraft,
  ensureUniqueStorageKey,
  reorderTabs,
  toEditableScreenLayout,
} from '../utils/customLayoutStudio';
import { toast } from 'react-hot-toast';

export interface StudioSession {
  screenId: ScreenId;
  draft: ScreenCustomLayout;
  dirty: boolean;
}

interface LayoutStudioContextValue {
  canEditCustomLayout: boolean;
  studioMode: boolean;
  drawerOpen: boolean;
  studioSession: StudioSession | null;
  openStudio: (screenId: ScreenId, resolved: ResolvedScreenLayout) => void;
  closeStudio: () => void;
  updateTab: (tabId: string, patch: Partial<LayoutTabDefinition>) => void;
  reorderTab: (fromIndex: number, toIndex: number) => void;
  moveTab: (tabId: string, direction: 'up' | 'down') => void;
  addCustomField: (tabId?: string, type?: CustomFieldType) => void;
  updateCustomField: (fieldId: string, patch: Partial<CustomFieldLayout>) => void;
  removeCustomField: (fieldId: string) => void;
  saveStudio: () => Promise<void>;
  discardStudio: () => void;
}

const LayoutStudioContext = createContext<LayoutStudioContextValue | undefined>(undefined);

export const LayoutStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isActualSuperAdmin } = useTenant();
  const { activeCompanyId, activeCompany } = useCompany();
  const { user } = useAuth();
  const [studioSession, setStudioSession] = useState<StudioSession | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const companyId =
    activeCompanyId && activeCompanyId !== 'SAAS_PLATFORM'
      ? activeCompanyId
      : activeCompany?.id || '';

  const closeStudio = useCallback(() => {
    setDrawerOpen(false);
    setStudioSession(null);
  }, []);

  const openStudio = useCallback(
    (screenId: ScreenId, resolved: ResolvedScreenLayout) => {
      if (!isActualSuperAdmin) return;
      setStudioSession({
        screenId,
        draft: toEditableScreenLayout(resolved),
        dirty: false,
      });
      setDrawerOpen(true);
    },
    [isActualSuperAdmin]
  );

  const updateTab = useCallback((tabId: string, patch: Partial<LayoutTabDefinition>) => {
    setStudioSession(prev => {
      if (!prev) return prev;
      const tabs = prev.draft.tabs.map(tab => {
        if (tab.id !== tabId) return tab;
        if (tab.locked && patch.visible === false) return tab;
        return { ...tab, ...patch };
      });
      return { ...prev, draft: { ...prev.draft, tabs }, dirty: true };
    });
  }, []);

  const reorderTab = useCallback((fromIndex: number, toIndex: number) => {
    setStudioSession(prev => {
      if (!prev) return prev;
      const sorted = [...prev.draft.tabs].sort((a, b) => a.order - b.order);
      const tabs = reorderTabs(sorted, fromIndex, toIndex);
      return { ...prev, draft: { ...prev.draft, tabs }, dirty: true };
    });
  }, []);

  const moveTab = useCallback(
    (tabId: string, direction: 'up' | 'down') => {
      setStudioSession(prev => {
        if (!prev) return prev;
        const sorted = [...prev.draft.tabs].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex(t => t.id === tabId);
        if (index < 0) return prev;
        const toIndex = direction === 'up' ? index - 1 : index + 1;
        const tabs = reorderTabs(sorted, index, toIndex);
        return { ...prev, draft: { ...prev.draft, tabs }, dirty: true };
      });
    },
    []
  );

  const addCustomField = useCallback((tabId?: string, type: CustomFieldType = 'text') => {
    setStudioSession(prev => {
      if (!prev) return prev;
      const tabs = [...prev.draft.tabs].sort((a, b) => a.order - b.order);
      const targetTab = tabId || tabs[0]?.id;
      if (!targetTab) {
        toast.error('أضف تبويباً أولاً قبل إنشاء حقول مخصصة');
        return prev;
      }
      const maxOrder = prev.draft.customFields.reduce((m, f) => Math.max(m, f.order), 0);
      const field = createCustomFieldDraft(targetTab, maxOrder + 1, type);
      return {
        ...prev,
        draft: { ...prev.draft, customFields: [...prev.draft.customFields, field] },
        dirty: true,
      };
    });
  }, []);

  const updateCustomField = useCallback((fieldId: string, patch: Partial<CustomFieldLayout>) => {
    setStudioSession(prev => {
      if (!prev) return prev;
      const customFields = prev.draft.customFields.map(field => {
        if (field.id !== fieldId) return field;
        const next = { ...field, ...patch };
        if (patch.storageKey != null) {
          next.storageKey = ensureUniqueStorageKey(patch.storageKey, prev.draft.customFields, fieldId);
        }
        if (patch.label) {
          next.label = { ...field.label, ...patch.label };
        }
        return next;
      });
      return { ...prev, draft: { ...prev.draft, customFields }, dirty: true };
    });
  }, []);

  const removeCustomField = useCallback((fieldId: string) => {
    setStudioSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        draft: {
          ...prev.draft,
          customFields: prev.draft.customFields.filter(f => f.id !== fieldId),
        },
        dirty: true,
      };
    });
  }, []);

  const discardStudio = useCallback(() => {
    closeStudio();
    toast('تم إلغاء التعديلات على التخطيط', { icon: '↩️' });
  }, [closeStudio]);

  const saveStudio = useCallback(async () => {
    if (!studioSession || !companyId) return;
    try {
      await saveScreenLayout(companyId, studioSession.screenId, studioSession.draft, user?.email || user?.uid);
      toast.success('تم حفظ تخطيط الشاشة وتفعيله');
      closeStudio();
    } catch (error) {
      console.error(error);
      toast.error('فشل حفظ التخطيط — تحقق من صلاحيات السوبر أدمن');
    }
  }, [studioSession, companyId, user, closeStudio]);

  const value = useMemo<LayoutStudioContextValue>(
    () => ({
      canEditCustomLayout: isActualSuperAdmin,
      studioMode: isActualSuperAdmin && drawerOpen,
      drawerOpen: isActualSuperAdmin && drawerOpen,
      studioSession: isActualSuperAdmin ? studioSession : null,
      openStudio,
      closeStudio,
      updateTab,
      reorderTab,
      moveTab,
      addCustomField,
      updateCustomField,
      removeCustomField,
      saveStudio,
      discardStudio,
    }),
    [
      isActualSuperAdmin,
      drawerOpen,
      studioSession,
      openStudio,
      closeStudio,
      updateTab,
      reorderTab,
      moveTab,
      addCustomField,
      updateCustomField,
      removeCustomField,
      saveStudio,
      discardStudio,
    ]
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
