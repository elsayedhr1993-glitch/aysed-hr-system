import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantCompany } from '../types';
import { db, createTenantUserSafely } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query , documentId, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ALMANAR_COMPANY_ID = 'comp-1788442584841';
const ALMANAR_COMPANY_NAME_AR = 'مستوصف المنار الطبي (Almanar Clinic)';

interface TenantContextType {
  isSuperAdmin: boolean;
  isActualSuperAdmin: boolean;
  isTenantViewEnabled: boolean;
  setIsTenantViewEnabled: (enabled: boolean) => void;
  activeCompany: TenantCompany | null;
  companies: TenantCompany[];
  impersonatingCompanyId: string | null;
  isLoading: boolean;
  addCompany: (company: Omit<TenantCompany, 'id' | 'createdAt' | 'isActive'>) => Promise<void>;
  updateCompanyPassword: (companyId: string, newPass: string) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  impersonateCompany: (companyId: string) => void;
  exitImpersonation: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const authCompanyId = user?.companyId || null;
  
  const isActualSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [isTenantViewEnabled, setIsTenantViewEnabledState] = useState(() => {
    return localStorage.getItem('saas_tenant_view_enabled') === 'true';
  });

  const setIsTenantViewEnabled = (val: boolean) => {
    setIsTenantViewEnabledState(val);
    localStorage.setItem('saas_tenant_view_enabled', String(val));
  };

  const isSuperAdmin = isActualSuperAdmin && !isTenantViewEnabled;

  const [companies, setCompanies] = useState<TenantCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [impersonatingCompanyId, setImpersonatingCompanyId] = useState<string | null>(() => {
    return localStorage.getItem('saas_impersonating_id') || null;
  });

  const isDevPreview = typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost'));
  const collectionName = isDevPreview ? 'dev_companies' : 'companies';

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setIsLoading(false);
      return;
    }

    const fallbackCompany: TenantCompany | null = !isActualSuperAdmin && authCompanyId ? {
      id: authCompanyId,
      nameAr: user.name || ALMANAR_COMPANY_NAME_AR,
      nameEn: 'Almanar Clinic',
      name: user.name || ALMANAR_COMPANY_NAME_AR,
      adminUsername: user.email || '',
      isActive: true,
      createdAt: new Date().toISOString()
    } as TenantCompany : null;

    // Listen to companies collection
    let q;
    if (isActualSuperAdmin) {
      q = query(collection(db, collectionName));
    } else if (authCompanyId) {
      q = query(collection(db, collectionName), where(documentId(), '==', authCompanyId));
    } else {
      setCompanies([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCompanies: TenantCompany[] = [];
      snapshot.forEach((doc) => {
        fetchedCompanies.push({ id: doc.id, ...doc.data() } as TenantCompany);
      });
      if (fetchedCompanies.length > 0) {
        setCompanies(fetchedCompanies);
      } else if (fallbackCompany) {
        setCompanies([fallbackCompany]);
      } else {
        setCompanies([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching companies: ", error);
      if (fallbackCompany) {
        setCompanies([fallbackCompany]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authCompanyId, isActualSuperAdmin, collectionName]);

  useEffect(() => {
    if (impersonatingCompanyId) {
      localStorage.setItem('saas_impersonating_id', impersonatingCompanyId);
    } else {
      localStorage.removeItem('saas_impersonating_id');
    }
  }, [impersonatingCompanyId]);

  const activeCompany = impersonatingCompanyId 
    ? companies.find(c => c.id === impersonatingCompanyId) || null 
    : (isActualSuperAdmin ? null : companies.find(c => c.id === authCompanyId) || companies[0] || null);

  const addCompany = async (compData: Omit<TenantCompany, 'id' | 'createdAt' | 'isActive'>) => {
    try {
      // 1. Create the user in Firebase Auth safely
      const authResult = await createTenantUserSafely(compData.adminUsername, compData.adminPassword);
      
      if (!authResult || !authResult.success) {
        throw new Error('Failed to create Firebase Auth user for the tenant admin.');
      }

      const newCompanyId = `tenant_${Date.now()}`;
      
      // 2. Create the User Document for rules checking
      await setDoc(doc(db, 'users', authResult.uid), {
        email: compData.adminUsername,
        name: compData.nameAr,
        role: 'TENANT_ADMIN',
        companyId: newCompanyId,
        createdAt: new Date().toISOString()
      });

      // 3. Create the Company Document
      const newCompany: TenantCompany = {
        ...compData,
        id: newCompanyId,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, collectionName, newCompanyId), newCompany);
    } catch (error) {
      console.error("Error adding company: ", error);
      throw error;
    }
  };

  const updateCompanyPassword = async (companyId: string, newPass: string) => {
    try {
      // Currently, we only update the document here, not the Firebase Auth password since it's a bit complex from client.
      // But keeping it documented for now.
      await updateDoc(doc(db, collectionName, companyId), {
        adminPassword: newPass
      });
    } catch (error) {
      console.error("Error updating company password: ", error);
      throw error;
    }
  };

  const deleteCompany = async (companyId: string) => {
    try {
      await deleteDoc(doc(db, collectionName, companyId));
      if (impersonatingCompanyId === companyId) {
        setImpersonatingCompanyId(null);
      }
    } catch (error) {
      console.error("Error deleting company: ", error);
      throw error;
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
      isActualSuperAdmin,
      isTenantViewEnabled,
      setIsTenantViewEnabled,
      activeCompany,
      companies,
      impersonatingCompanyId,
      isLoading,
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
