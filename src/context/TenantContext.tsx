import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantCompany } from '../types';

interface TenantContextType {
  isSuperAdmin: boolean;
  activeCompany: TenantCompany | null;
  companies: TenantCompany[];
  impersonatingCompanyId: string | null;
  addCompany: (company: Omit<TenantCompany, 'id' | 'createdAt' | 'isActive'>) => void;
  updateCompanyPassword: (companyId: string, newPass: string) => void;
  deleteCompany: (companyId: string) => void;
  impersonateCompany: (companyId: string) => void;
  exitImpersonation: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // تصفير البيانات والبدء بحالة سحابية نظيفة
  const [companies, setCompanies] = useState<TenantCompany[]>(() => {
    const saved = localStorage.getItem('saas_tenants_registry');
    return saved ? JSON.parse(saved) : [
      {
        id: 'clinic-01',
        nameAr: 'مستوصف المنار كلينك الطبي',
        nameEn: 'Al-Manar Clinic Medical Center',
        adminUsername: 'admin_manar',
        adminPassword: 'Password123@',
        contactPhone: '96590000000',
        pamFileNumber: 'PAM-88990',
        commercialReg: 'CR-10293',
        mohLicense: 'MOH-4402',
        iban: 'KW00NBK000000000000000000',
        bankName: 'بنك الكويت الوطني',
        isActive: true,
        createdAt: '2026-09-01'
      }
    ];
  });

  const [impersonatingCompanyId, setImpersonatingCompanyId] = useState<string | null>(() => {
    return localStorage.getItem('saas_impersonating_id') || null;
  });
  const isSuperAdmin = true; // يتم ربطه بمحدد المصادقة الفعلي

  useEffect(() => {
    localStorage.setItem('saas_tenants_registry', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    if (impersonatingCompanyId) {
      localStorage.setItem('saas_impersonating_id', impersonatingCompanyId);
    } else {
      localStorage.removeItem('saas_impersonating_id');
    }
  }, [impersonatingCompanyId]);

  const activeCompany = impersonatingCompanyId 
    ? companies.find(c => c.id === impersonatingCompanyId) || null 
    : (isSuperAdmin ? null : companies[0] || null);

  const addCompany = (compData: Omit<TenantCompany, 'id' | 'createdAt' | 'isActive'>) => {
    const newCompany: TenantCompany = {
      ...compData,
      id: `tenant_${Date.now()}`,
      isActive: true,
      createdAt: '2026-09-01'
    };
    setCompanies(prev => [...prev, newCompany]);
  };

  const updateCompanyPassword = (companyId: string, newPass: string) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, adminPassword: newPass } : c));
  };

  const deleteCompany = (companyId: string) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    if (impersonatingCompanyId === companyId) {
      setImpersonatingCompanyId(null);
    }
  };

  const impersonateCompany = (companyId: string) => {
    setImpersonatingCompanyId(companyId);
  };

  const exitImpersonation = () => {
    setImpersonatingCompanyId(null);
  };

  return (
    <TenantContext.Provider value={{
      isSuperAdmin,
      activeCompany,
      companies,
      impersonatingCompanyId,
      addCompany,
      updateCompanyPassword,
      deleteCompany,
      impersonateCompany,
      exitImpersonation
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
};
