import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { CompanyProvider } from './CompanyContext';
import { SystemSettingsProvider } from './SystemSettingsContext';
export { CompanyProvider, useCompany } from './CompanyContext';
export { SystemSettingsProvider, useSystemSettings } from './SystemSettingsContext';
export { useIsolatedData } from '../hooks/useIsolatedData';

// 1. تعريف الهوية التقنية للنظام (طبق الأصل من Odoo Context)
interface AysedContextType {
  user: { id: number | string; name: string; email: string; role: string };
  company: { id: number | string; name: string; currency: string };
  isStable: boolean;
  refreshSystem: () => void;
}

const AysedContext = createContext<AysedContextType | undefined>(undefined);

export const AysedCoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemState, setSystemState] = useState<any>({
    user: { id: '', name: '', email: '', role: '' },
    company: { id: '', name: '', currency: 'KWD' },
    isStable: true
  });
  const [loading, setLoading] = useState(false);

  const initializeSystem = async () => {
    const authUser = auth.currentUser;
    setSystemState({
      user: authUser ? { id: authUser.uid, name: authUser.displayName || '', email: authUser.email || '', role: 'user' } : { id: '', name: '', email: '', role: '' },
      company: { id: '', name: '', currency: 'KWD' },
      isStable: true
    });
    setLoading(false);
  };

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, () => { void initializeSystem(); });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="starting-server flex items-center justify-center min-h-screen bg-slate-900 text-white font-bold text-lg">جاري تشغيل محرك Aysed S HR 2026...</div>;

  return (
    <AysedContext.Provider value={{ ...systemState, refreshSystem: initializeSystem }}>
      {/* 4. حقن كود الأناقة والاستقرار البصري (Enterprise CSS) */}
      <style>{`
        :root { --odoo-primary: #71639e; --odoo-secondary: #008784; }
        .o_main_content { 
            margin-right: 0px !important; /* حل مشكلة تداخل اللوحة الجانبية والتكيف مع التصميم */
            transition: all 0.3s ease; 
        }
        .o_stat_value { font-family: 'Inter', sans-serif; font-weight: 700; color: var(--odoo-primary); }
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; }
      `}</style>
      <CompanyProvider>
        <SystemSettingsProvider>
          {children}
        </SystemSettingsProvider>
      </CompanyProvider>
    </AysedContext.Provider>);
};

// هوك (Hook) لاستدعاء النظام في أي صفحة
export const useAysedSystem = () => {
  const context = useContext(AysedContext);
  if (!context) throw new Error("يجب استخدام useAysedSystem داخل AysedCoreProvider");
  return context;
};
