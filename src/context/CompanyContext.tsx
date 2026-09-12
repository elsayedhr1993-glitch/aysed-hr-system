import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company } from '../types';
import { useAuth } from './AuthContext';

const ALMANAR_COMPANY_ID = 'comp-1788442584841';
const ALMANAR_COMPANY_NAME_AR = 'مستوصف المنار الطبي (Almanar Clinic)';

const defaultMasterCompany: Company = {
  id: 'comp-super-admin',
  nameAr: 'إدارة النظام المركزية (Super Admin)',
  nameEn: 'Central Management System',
  crNumber: '300000',
  pifssNumber: 'KUW-100000',
  mohLicense: 'MOH-MASTER',
  isDefault: true,
  name: 'إدارة النظام المركزية (Super Admin)',
  commercialRegNo: '300000',
  civilIdCompany: '200000',
  bankName: 'بنك الكويت الوطني (NBK)',
  iban: 'KW12NBOK000000000000300000',
  wsiCode: 'WSI-MASTER',
  currency: 'KWD',
  status: 'active'
};

export function getDeterministicCompanyId(companyOrName: string | Partial<Company>): string {
  const nameStr = typeof companyOrName === 'string' 
    ? companyOrName 
    : (companyOrName.nameAr || companyOrName.name || '');

  if (!nameStr || nameStr === 'comp-super-admin' || nameStr.includes('المركزية') || nameStr.includes('Super Admin')) {
    return 'comp-super-admin';
  }

  let baseId = '';
  if (nameStr.includes('المنار')) {
    baseId = ALMANAR_COMPANY_ID;
  } else if (nameStr.includes('الفنار')) {
    baseId = 'comp-alfanar';
  } else if (nameStr.includes('إيليت') || nameStr.includes('Elite')) {
    baseId = 'comp-elite';
  } else if (typeof companyOrName === 'object' && companyOrName.id && !['comp-01', 'comp-1', 'comp-demo', 't-comp-01'].includes(companyOrName.id)) {
    baseId = companyOrName.id;
  } else {
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = ((hash << 5) - hash) + nameStr.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(36);
    baseId = `comp_${positiveHash}`;
  }

  return baseId;
}

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company;
  activeCompanyId: string;
  isImpersonating: boolean;
  impersonatedCompany: Company | null;
  startImpersonation: (companyOrName: string | Partial<Company>) => void;
  exitImpersonation: () => void;
  switchCompany: (companyId: string) => void;
  addNewCompany: (company: Omit<Company, 'id'>) => void;
  updateActiveCompany: (updatedData: Partial<Company>) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const authCompanyId = user?.companyId || null;

  // Master Company State (Persisted) - Default strictly to Almanar Clinic
  const [masterCompany, setMasterCompany] = useState<Company>(() => {
    try {
      const savedMaster = localStorage.getItem('master_company_profile') || localStorage.getItem('active_company_profile');
      if (savedMaster) {
        const parsed = JSON.parse(savedMaster);
        if (parsed && (parsed.nameAr || parsed.name)) {
          return { ...defaultMasterCompany, ...parsed, id: parsed.id || authCompanyId || ALMANAR_COMPANY_ID };
        }
      }
    } catch (e) {
      console.error('Error loading master company profile:', e);
    }
    return {
      ...defaultMasterCompany,
      id: authCompanyId || ALMANAR_COMPANY_ID,
      nameAr: ALMANAR_COMPANY_NAME_AR,
      nameEn: 'Almanar Clinic',
      name: ALMANAR_COMPANY_NAME_AR
    };
  });

  // Impersonation state - default to false so it stays on Almanar Clinic unless explicitly requested
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    return localStorage.getItem('aysed_is_impersonating') === 'true';
  });

  const [impersonatedCompany, setImpersonatedCompany] = useState<Company | null>(() => {
    try {
      const saved = localStorage.getItem('aysed_impersonated_comp');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading impersonated company:', e);
    }
    return {
      id: authCompanyId || ALMANAR_COMPANY_ID,
      nameAr: ALMANAR_COMPANY_NAME_AR,
      nameEn: 'Almanar Clinic',
      name: ALMANAR_COMPANY_NAME_AR,
      crNumber: '301122',
      pifssNumber: 'KUW-554433',
      commercialRegNo: '301122',
      civilIdCompany: '203344',
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: 'KW12NBOK000000000000301122',
      wsiCode: 'WSI-ALMANAR',
      currency: 'KWD',
      status: 'active'
    };
  });

  // Automatically listen to auth session or active company changes in localStorage
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const authUserRaw = localStorage.getItem('aysed_auth_user');
        const isImpersonatingFlag = localStorage.getItem('aysed_is_impersonating') === 'true';
        const savedImpersonated = localStorage.getItem('aysed_impersonated_comp');

        if (isImpersonatingFlag && savedImpersonated) {
          const parsedComp = JSON.parse(savedImpersonated);
          setIsImpersonating(true);
          setImpersonatedCompany(parsedComp);
          return;
        }

        if (authUserRaw) {
          const authUser = JSON.parse(authUserRaw);
          if (authUser && authUser.role !== 'SUPER_ADMIN' && (authUser.companyId || authUser.name)) {
            // Tenant Company user logged in
            const compName = authUser.name || 'شركة المنشأة المستقلة';
            const compId = authUser.companyId || getDeterministicCompanyId(compName);
            const tenantComp: Company = {
              id: compId,
              nameAr: compName,
              nameEn: compName,
              name: compName,
              crNumber: '301122',
              pifssNumber: 'KUW-554433',
              commercialRegNo: '301122',
              civilIdCompany: '203344',
              bankName: 'بنك الكويت الوطني (NBK)',
              iban: 'KW12NBOK000000000000301122',
              wsiCode: 'WSI-TENANT',
              currency: 'KWD',
              status: 'active'
            };
            setIsImpersonating(true);
            setImpersonatedCompany(tenantComp);
            return;
          }
        }
      } catch (e) {
        console.warn('Error syncing company context from storage:', e);
      }
    };

    syncFromStorage();
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('aysed_auth_changed', syncFromStorage);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('aysed_auth_changed', syncFromStorage);
    };
  }, []);

  // Active company: if impersonating, use impersonatedCompany, else use masterCompany
  const rawActive = isImpersonating && impersonatedCompany ? impersonatedCompany : masterCompany;
  const activeCompanyId = authCompanyId || (isImpersonating && impersonatedCompany ? getDeterministicCompanyId(impersonatedCompany) : getDeterministicCompanyId(rawActive));
  const activeCompany = { ...rawActive, id: activeCompanyId };

  // Strict SaaS Isolation: The accessible companies in dropdown is strictly the active context
  const companies = [activeCompany];

  useEffect(() => {
    if (!authCompanyId) return;
    localStorage.setItem('activeCompanyId', authCompanyId);
  }, [authCompanyId]);

  // Sync state to local storage
  useEffect(() => {
    if (!isImpersonating) {
      localStorage.setItem('master_company_profile', JSON.stringify(masterCompany));
      localStorage.setItem('active_company_profile', JSON.stringify(masterCompany));
      localStorage.setItem('activeCompanyId', masterCompany.id);
      localStorage.setItem('aysed_is_impersonating', 'false');
    } else if (impersonatedCompany) {
      localStorage.setItem('aysed_impersonated_comp', JSON.stringify(impersonatedCompany));
      localStorage.setItem('active_company_profile', JSON.stringify(impersonatedCompany));
      localStorage.setItem('activeCompanyId', impersonatedCompany.id);
      localStorage.setItem('aysed_is_impersonating', 'true');
    }
  }, [masterCompany, impersonatedCompany, isImpersonating]);

  // Start Impersonation Mode
  const startImpersonation = (companyOrName: string | Partial<Company>) => {
    let target: Company;
    const deterministicId = getDeterministicCompanyId(companyOrName);
    if (typeof companyOrName === 'string') {
      target = {
        id: deterministicId,
        nameAr: companyOrName,
        nameEn: companyOrName,
        name: companyOrName,
        crNumber: '301122',
        pifssNumber: 'KUW-554433',
        commercialRegNo: '301122',
        civilIdCompany: '203344',
        bankName: 'بنك الكويت الوطني (NBK)',
        iban: 'KW12NBOK000000000000301122',
        wsiCode: 'WSI-' + companyOrName.slice(0, 4).toUpperCase(),
        currency: 'KWD',
        status: 'active'
      };
    } else {
      target = {
        ...companyOrName,
        id: deterministicId,
        nameAr: companyOrName.nameAr || companyOrName.name || 'شركة مشتركة',
        nameEn: companyOrName.nameEn || '',
        name: companyOrName.nameAr || companyOrName.name || 'شركة مشتركة',
        crNumber: companyOrName.crNumber || companyOrName.commercialRegNo || '301122',
        pifssNumber: companyOrName.pifssNumber || 'KUW-554433',
        commercialRegNo: companyOrName.commercialRegNo || companyOrName.crNumber || '301122',
        civilIdCompany: companyOrName.civilIdCompany || companyOrName.crNumber || '203344',
        bankName: companyOrName.bankName || 'بيت التمويل الكويتي (KFH)',
        iban: companyOrName.iban || 'KW12KFH000000000000301122',
        wsiCode: companyOrName.wsiCode || 'WSI-TENANT',
        currency: companyOrName.currency || 'KWD',
        status: companyOrName.status || 'active'
      };
    }

    setImpersonatedCompany(target);
    setIsImpersonating(true);
    localStorage.setItem('aysed_is_impersonating', 'true');
    localStorage.setItem('aysed_impersonated_comp', JSON.stringify(target));
    localStorage.setItem('active_company_profile', JSON.stringify(target));
    localStorage.setItem('activeCompanyId', target.id);
  };

  // Exit Impersonation Mode
  const exitImpersonation = () => {
    setIsImpersonating(false);
    setImpersonatedCompany(null);
    localStorage.setItem('aysed_is_impersonating', 'false');
    localStorage.removeItem('aysed_impersonated_comp');
    localStorage.setItem('active_company_profile', JSON.stringify(masterCompany));
    localStorage.setItem('activeCompanyId', masterCompany.id);
  };

  const switchCompany = (companyId: string) => {
    // If switching back to master
    if (companyId === masterCompany.id) {
      exitImpersonation();
    }
  };

  const updateActiveCompany = (updatedData: Partial<Company>) => {
    if (isImpersonating && impersonatedCompany) {
      setImpersonatedCompany((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          ...updatedData,
          name: updatedData.nameAr || prev.nameAr || prev.name,
          commercialRegNo: updatedData.crNumber || prev.crNumber || prev.commercialRegNo,
          civilIdCompany: updatedData.crNumber || prev.civilIdCompany
        };
        localStorage.setItem('aysed_impersonated_comp', JSON.stringify(updated));
        localStorage.setItem('active_company_profile', JSON.stringify(updated));
        return updated;
      });
    } else {
      setMasterCompany((prev) => {
        const updated = {
          ...prev,
          ...updatedData,
          name: updatedData.nameAr || prev.nameAr || prev.name,
          commercialRegNo: updatedData.crNumber || prev.crNumber || prev.commercialRegNo,
          civilIdCompany: updatedData.crNumber || prev.civilIdCompany
        };
        localStorage.setItem('master_company_profile', JSON.stringify(updated));
        localStorage.setItem('active_company_profile', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const addNewCompany = (companyData: Omit<Company, 'id'>) => {
    const newId = `comp-${Date.now().toString(36)}`;
    const newComp: Company = { 
      ...companyData, 
      id: newId,
      name: companyData.nameAr,
      commercialRegNo: companyData.crNumber || '100000',
      civilIdCompany: companyData.crNumber || '200000',
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: 'KW12KFH000000000000' + (companyData.crNumber || '111111'),
      wsiCode: 'WSI-' + (companyData.nameEn ? companyData.nameEn.replace(/\s+/g, '').toUpperCase().slice(0, 8) : 'NEW'),
      currency: 'KWD',
      status: 'active'
    };
    startImpersonation(newComp);
  };

  return (
    <CompanyContext.Provider value={{ 
      companies, 
      activeCompany, 
      activeCompanyId, 
      isImpersonating,
      impersonatedCompany,
      startImpersonation,
      exitImpersonation,
      switchCompany, 
      addNewCompany, 
      updateActiveCompany 
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within a CompanyProvider');
  return context;
};
