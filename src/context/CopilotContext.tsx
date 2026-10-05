import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Company, Contract, Employee } from '../types';
import type { CopilotScreenDescriptor } from '../lib/copilotScreenTypes';

export type CopilotQuickActionHandler = (actionType: string, payload?: unknown) => void;

export interface CopilotRuntime {
  companyId?: string;
  activeCompany?: Company | null;
  activeApp?: string;
  employees: Employee[];
  contracts: Contract[];
  leaveSummary?: { pending?: number; onLeaveToday?: number };
  setActiveApp?: (appId: string) => void;
  onQuickAction?: CopilotQuickActionHandler;
}

interface CopilotContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  activeApp: string;
  setActiveAppId: (appId: string) => void;
  screen: CopilotScreenDescriptor | null;
  screenSummary: string;
  registerScreen: (screen: CopilotScreenDescriptor | null, summary?: string) => void;
  runtime: CopilotRuntime;
}

const defaultRuntime: CopilotRuntime = {
  employees: [],
  contracts: [],
};

const CopilotContext = createContext<CopilotContextValue | undefined>(undefined);

export const CopilotProvider: React.FC<{
  children: React.ReactNode;
  runtime: CopilotRuntime;
  initialActiveApp?: string;
}> = ({ children, runtime, initialActiveApp = 'switcher' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeApp, setActiveAppId] = useState(initialActiveApp);
  const [screen, setScreen] = useState<CopilotScreenDescriptor | null>(null);
  const [screenSummary, setScreenSummary] = useState('');

  useEffect(() => {
    if (runtime.activeApp) {
      setActiveAppId(runtime.activeApp);
    }
  }, [runtime.activeApp]);

  const registerScreen = useCallback(
    (next: CopilotScreenDescriptor | null, summary?: string) => {
      setScreen(next);
      if (summary !== undefined) setScreenSummary(summary);
    },
    []
  );

  const value = useMemo<CopilotContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
      activeApp,
      setActiveAppId,
      screen,
      screenSummary,
      registerScreen,
      runtime: { ...defaultRuntime, ...runtime },
    }),
    [isOpen, activeApp, screen, screenSummary, registerScreen, runtime]
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
};

export function useCopilotContext(): CopilotContextValue {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    throw new Error('useCopilotContext must be used within CopilotProvider');
  }
  return ctx;
}

/** Optional — for components that may render outside provider during tests. */
export function useCopilotContextOptional(): CopilotContextValue | null {
  return useContext(CopilotContext) ?? null;
}

export function useRegisterCopilotScreen(
  screen: CopilotScreenDescriptor | null,
  screenSummary?: string
) {
  const { registerScreen } = useCopilotContext();
  const screenKey = useMemo(() => JSON.stringify(screen ?? null), [screen]);

  useEffect(() => {
    registerScreen(screen, screenSummary);
    return () => registerScreen(null, '');
  }, [registerScreen, screenKey, screenSummary, screen]);
}
