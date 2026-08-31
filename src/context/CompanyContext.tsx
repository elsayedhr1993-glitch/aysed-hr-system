import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompanyContextType {
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    return localStorage.getItem('active_company_id') || localStorage.getItem('odoo_active_company_id') || 'comp-1';
  });

  useEffect(() => {
    localStorage.setItem('active_company_id', activeCompanyId);
    localStorage.setItem('odoo_active_company_id', activeCompanyId);
  }, [activeCompanyId]);

  return (
    <CompanyContext.Provider value={{ activeCompanyId, setActiveCompanyId }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within CompanyProvider');
  return context;
};
