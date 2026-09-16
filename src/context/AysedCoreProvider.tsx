import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { CompanyProvider, useCompany } from './CompanyContext';
import { SystemSettingsProvider } from './SystemSettingsContext';
import { LanguageProvider, useLang } from '../lib/i18n';
export { CompanyProvider, useCompany } from './CompanyContext';
export { SystemSettingsProvider, useSystemSettings } from './SystemSettingsContext';
export { useIsolatedData } from '../hooks/useIsolatedData';

interface AysedCompanyRecord {
  id: string;
  name: string;
  currency: string;
}

interface AysedContextType {
  user: { id: number | string; name: string; email: string; role: string };
  company: AysedCompanyRecord;
  currentCompany: AysedCompanyRecord;
  selectedCompanyId: string;
  isStable: boolean;
  refreshSystem: () => Promise<void>;
}

const AysedContext = createContext<AysedContextType | undefined>(undefined);

const normalizeCompanyName = (value: unknown, fallback = 'Company') => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
};

const readUrlCompanyId = () => {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('companyId') || params.get('company_id') || '';
};

const readLastActiveCompanyId = () => {
  try {
    return localStorage.getItem('lastActiveCompanyId') || localStorage.getItem('activeCompanyId') || '';
  } catch {
    return '';
  }
};

const resolveSelectedCompanyId = (
  urlCompanyId: string,
  firebaseCompanyId: string,
  fallbackCompanyId: string,
  currentCompanyId: string,
  currentCompanyName: string
) => {
  const candidates = [
    urlCompanyId,
    firebaseCompanyId,
    fallbackCompanyId,
    currentCompanyId,
    currentCompanyName && currentCompanyName.includes('المركزية') ? 'comp-super-admin' : ''
  ].filter((value): value is string => Boolean(value) && value.trim().length > 0);

  const validCandidate = candidates.find((value) => value !== 'SAAS_PLATFORM' && value !== 'comp-super-admin' && value !== 'default_settings');
  if (validCandidate) return validCandidate;

  if (fallbackCompanyId) return fallbackCompanyId;
  if (currentCompanyId) return currentCompanyId;
  if (urlCompanyId) return urlCompanyId;
  if (firebaseCompanyId) return firebaseCompanyId;
  return 'comp-super-admin';
};

const buildCompanyRecord = (id: string, name: string, currency?: string): AysedCompanyRecord => ({
  id: id || 'comp-super-admin',
  name: normalizeCompanyName(name, 'Company'),
  currency: currency || 'KWD'
});

const AysedCoreShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang } = useLang();
  const companyState = useCompany();
  const { activeCompany, activeCompanyId } = companyState;

  const [systemState, setSystemState] = useState<AysedContextType>({
    user: { id: '', name: '', email: '', role: '' },
    company: buildCompanyRecord('comp-super-admin', 'Company'),
    currentCompany: buildCompanyRecord('comp-super-admin', 'Company'),
    selectedCompanyId: 'comp-super-admin',
    isStable: true,
    refreshSystem: async () => undefined
  });
  const [loading, setLoading] = useState(false);

  const initializeSystem = async () => {
    const authUser = auth.currentUser;
    const urlCompanyId = readUrlCompanyId();
    const localProfileCompanyId = readLastActiveCompanyId();

    let firebaseCompanyId = '';
    if (authUser?.uid) {
      try {
        const profile = await getDoc(doc(db, 'users', authUser.uid));
        if (profile.exists()) {
          const profileData = profile.data() as Record<string, unknown>;
          firebaseCompanyId = (profileData.lastActiveCompanyId || profileData.companyId || '') as string;
        }
      } catch {
        firebaseCompanyId = '';
      }
    }

    const fallbackCompanyId = activeCompanyId || activeCompany?.id || localProfileCompanyId || '';
    const selectedCompanyId = resolveSelectedCompanyId(
      urlCompanyId,
      firebaseCompanyId,
      fallbackCompanyId,
      activeCompanyId || activeCompany?.id || '',
      activeCompany?.name || ''
    );

    const resolvedCompany = buildCompanyRecord(
      selectedCompanyId,
      activeCompany?.nameAr || activeCompany?.name || normalizeCompanyName(activeCompany?.name, 'Company'),
      activeCompany?.currency || 'KWD'
    );

    const nextUser = authUser
      ? {
          id: authUser.uid,
          name: authUser.displayName || authUser.email || 'User',
          email: authUser.email || '',
          role: 'user'
        }
      : { id: '', name: '', email: '', role: '' };

    if (authUser?.uid && selectedCompanyId && selectedCompanyId !== 'SAAS_PLATFORM') {
      try {
        await setDoc(doc(db, 'users', authUser.uid), { lastActiveCompanyId: selectedCompanyId }, { merge: true });
        localStorage.setItem('lastActiveCompanyId', selectedCompanyId);
      } catch {
        // Ignore persistence failures; the selection is still valid in-memory.
      }
    }

    if (selectedCompanyId && selectedCompanyId !== urlCompanyId && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('companyId', selectedCompanyId);
      const nextUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', nextUrl);
    }

    setSystemState({
      user: nextUser,
      company: resolvedCompany,
      currentCompany: resolvedCompany,
      selectedCompanyId,
      isStable: true,
      refreshSystem: async () => { await initializeSystem(); }
    });
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      void initializeSystem();
    });
    return () => unsubscribe();
  }, [activeCompanyId, activeCompany?.id, activeCompany?.name]);

  const value = useMemo(
    () => ({
      ...systemState,
      refreshSystem: initializeSystem
    }),
    [systemState, activeCompanyId, activeCompany?.id, activeCompany?.name]
  );

  if (loading) {
    return (
      <div className="starting-server flex items-center justify-center min-h-screen bg-slate-900 text-white font-bold text-lg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {lang === 'ar' ? 'جاري تشغيل محرك Aysed S HR 2026...' : 'Starting the Aysed S HR 2026 engine...'}
      </div>
    );
  }

  return (
    <AysedContext.Provider value={value}>
      <style>{`
        :root { --odoo-primary: #71639e; --odoo-secondary: #008784; }
        .o_main_content {
            margin-right: 0px !important;
            transition: all 0.3s ease;
        }
        .o_stat_value { font-family: 'Inter', sans-serif; font-weight: 700; color: var(--odoo-primary); }
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; }
      `}</style>
      {children}
    </AysedContext.Provider>
  );
};

export const AysedCoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <CompanyProvider>
      <SystemSettingsProvider>
        <AysedCoreShell>{children}</AysedCoreShell>
      </SystemSettingsProvider>
    </CompanyProvider>
  </LanguageProvider>
);

export const useAysedSystem = () => {
  const context = useContext(AysedContext);
  if (!context) throw new Error('useAysedSystem must be used inside AysedCoreProvider');
  return context;
};

export const useAysedCore = useAysedSystem;
