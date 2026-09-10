import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { useCompany } from './CompanyContext';

export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  basic_salary: number;
  remaining_leaves: number;
  civil_id?: string;
  email?: string;
  phone?: string;
  date_start?: string;
  status?: string;
  company_id?: string;
  [key: string]: any;
}

export interface HRContextType {
  employees: Employee[];
  loading: boolean;
  refreshData: () => Promise<void>;
  updateEmployeeBalance: (employeeId: string, daysDeducted: number) => Promise<void>;
  updateEmployee?: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompanyId, activeCompany } = useCompany();
  const companyId = activeCompanyId || activeCompany?.id || '';

  const refreshData = async () => {};

  useEffect(() => {
    if (!companyId) {
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const employeesQuery = query(collection(db, 'employees'), where('companyId', '==', companyId));
    return onSnapshot(employeesQuery, snapshot => {
      setEmployees(snapshot.docs.map(item => {
        const emp = item.data() as any;
        return {
          ...emp,
          id: item.id,
          name: emp.name || emp.fullNameAr || emp.fullNameEn || 'موظف',
          job_title: emp.job_title || emp.jobTitle || 'موظف',
          department: emp.department || 'عام',
          basic_salary: Number(emp.basic_salary ?? emp.basicSalary ?? emp.salary ?? 0),
          remaining_leaves: Number(emp.remaining_leaves ?? emp.leaveBalance ?? 0),
          civil_id: emp.civil_id || emp.civilId || '',
          company_id: emp.company_id || emp.companyId || companyId
        } as Employee;
      }));
      setLoading(false);
    }, error => {
      console.error('Failed to load employees from Firestore:', error);
      setEmployees([]);
      setLoading(false);
    });
  }, [companyId]);

  // 2. دالة ربط الإجازة بخصم الرصيد وتحديث كل الشاشات فوراً
  const updateEmployeeBalance = async (employeeId: string, daysDeducted: number) => {
    const target = employees.find(e => e.id === employeeId);
    if (!target) return;

    const newBalance = Math.max(0, (target.remaining_leaves || 0) - daysDeducted);

    await setDoc(doc(db, 'employees', employeeId), cleanFirestoreData({
      remaining_leaves: newBalance,
      leave_balance: newBalance,
      companyId,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    // تحديث الحالة المحلية لتتغير الأرقام في كل التطبيقات لحظياً
    setEmployees(prev =>
      prev.map(emp => emp.id === employeeId ? { ...emp, remaining_leaves: newBalance, leave_balance: newBalance } : emp)
    );
  };

  // دالة تحديث بيانات موظف عامة
  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    await setDoc(doc(db, 'employees', employeeId), cleanFirestoreData({
      ...updates,
      companyId,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    setEmployees(prev =>
      prev.map(emp => emp.id === employeeId ? { ...emp, ...updates } : emp)
    );
  };

  return (
    <HRContext.Provider value={{ employees, loading, refreshData, updateEmployeeBalance, updateEmployee }}>
      {children}
    </HRContext.Provider>);
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) throw new Error('useHR must be used within an HRProvider');
  return context;
};
