import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantCompany } from '../types';
import { db, createTenantUserSafely } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query , documentId, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface TenantContextType {
  isSuperAdmin: boolean;
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
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [companies, setCompanies] = useState<TenantCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [impersonatingCompanyId, setImpersonatingCompanyId] = useState<string | null>(() => {
    return localStorage.getItem('saas_impersonating_id') || null;
  });

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setIsLoading(false);
      return;
    }

    // Listen to companies collection
    let q;
    if (isSuperAdmin) {
      q = query(collection(db, 'companies'));
    } else if (user.companyId) {
      q = query(collection(db, 'companies'), where(documentId(), '==', user.companyId));
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
      setCompanies(fetchedCompanies);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching companies: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (impersonatingCompanyId) {
      localStorage.setItem('saas_impersonating_id', impersonatingCompanyId);
    } else {
      localStorage.removeItem('saas_impersonating_id');
    }
  }, [impersonatingCompanyId]);

  const activeCompany = impersonatingCompanyId 
    ? companies.find(c => c.id === impersonatingCompanyId) || null 
    : (isSuperAdmin ? null : companies.find(c => c.id === user?.companyId) || null);

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

      await setDoc(doc(db, 'companies', newCompanyId), newCompany);
    } catch (error) {
      console.error("Error adding company: ", error);
      throw error;
    }
  };

  const updateCompanyPassword = async (companyId: string, newPass: string) => {
    try {
      // Currently, we only update the document here, not the Firebase Auth password since it's a bit complex from client.
      // But keeping it documented for now.
      await updateDoc(doc(db, 'companies', companyId), {
        adminPassword: newPass
      });
    } catch (error) {
      console.error("Error updating company password: ", error);
      throw error;
    }
  };

  const deleteCompany = async (companyId: string) => {
    try {
      await deleteDoc(doc(db, 'companies', companyId));
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
