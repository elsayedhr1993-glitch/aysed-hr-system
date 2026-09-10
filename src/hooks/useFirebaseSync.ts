import { useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth, cleanFirestoreData } from '../lib/firebase';
import { Employee, Contract, LeaveRequest, AttendanceRecord, Payslip, DocumentItem, CustodyItem, LoanAdvance, DisciplinaryWarning, EmployeeNote, EmployeeNotification, Company, EmploymentCommencement } from '../types';
import { initialCompanies, initialDepartments, initialJobTitles, initialEmployees, initialContracts } from '../data/initialData';
import { MANARA_STORAGE_KEYS, setPersistentData, getPersistentData } from '../utils/persistentStorage';


enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const isOfflineOrUnavailable =
    errMessage.includes('unavailable') ||
    errMessage.includes('offline') ||
    errMessage.includes('closing') ||
    errMessage.includes('hidden') ||
    errMessage.includes('Database is closing') ||
    errMessage.includes('Failed to get document because the client is offline') ||
    errMessage.includes('Could not reach Cloud Firestore backend') ||
    errMessage.includes('Missing or insufficient permissions') ||
    errMessage.includes('cancelled') ||
    errMessage.includes('terminated');

  if (isOfflineOrUnavailable) {
    console.warn(`[FirestoreSync] Handled ignorable connection notice for ${path}:`, errMessage);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export const useFirebaseSync = (
  isAuthenticated: boolean,
  activeCompanyId: string,
  currentUserRole: string,
  setEmployees: any,
  setContracts: any,
  setLeaves: any,
  setAttendance: any,
  setPayslips: any,
  setDocuments: any,
  setCustodies: any,
  setLoans: any,
  setWarnings: any,
  setEmployeeNotes: any,
  setDepartments?: any,
  setJobTitles?: any,
  setCompanies?: any,
  setNotifications?: any,
  setSubscriptions?: any,
  setCommencements?: any
) => {
  useEffect(() => {
    if (!isAuthenticated) return;

    // Super Admin platform mode or clinic switching: Keep tenant employee data sterile & isolated
    const isSuperAdminPlatformMode = currentUserRole === 'SUPER_ADMIN' && (!activeCompanyId || activeCompanyId === 'SAAS_PLATFORM');
    setEmployees([]);
    setContracts([]);
    setLeaves([]);
    setAttendance([]);
    setPayslips([]);
    setDocuments([]);
    setCustodies([]);
    setLoans([]);
    setWarnings([]);
    setEmployeeNotes([]);

    if (isSuperAdminPlatformMode) {
      return;
    }

    const tenantId = activeCompanyId || 'comp-super-admin';

    // Strict Tenant-Scoped Queries (Strict Multi-Tenancy Architecture)
    // 1. Employees: Strictly scoped to current tenant
    const qEmployees = query(collection(db, 'employees'), where('companyId', '==', tenantId));
    const unsubEmployees = onSnapshot(qEmployees, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id } as any));
            setEmployees(remote);
            setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEES, remote);
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'employees');
        }
    );
    
    // 2. Contracts: Strictly scoped to current tenant
    const qContracts = query(collection(db, 'contracts'), where('companyId', '==', tenantId));
    const unsubContracts = onSnapshot(qContracts, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id } as any));
            setContracts(remote);
            setPersistentData(MANARA_STORAGE_KEYS.CONTRACTS, remote);
          }
        },
        err => {
          handleFirestoreError(err, OperationType.GET, 'contracts');
        }
    );
    
    // 3. Leaves: Strictly scoped to current tenant
    const qLeaves = query(collection(db, 'leaves'), where('companyId', '==', tenantId));
    const unsubLeaves = onSnapshot(qLeaves, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setLeaves(remote);
            setPersistentData(MANARA_STORAGE_KEYS.LEAVES, remote);

            // Mirror leaves to legacy 'odoo_leave_requests_v2' for compatibility
            let empsList: any[] = [];
            try {
              const savedEmps = localStorage.getItem(MANARA_STORAGE_KEYS.EMPLOYEES);
              if (savedEmps) empsList = JSON.parse(savedEmps);
            } catch (e) {
              console.error('Error parsing employees list in sync', e);
            }

            const odooRequests = remote.map((r: any) => {
              const matchedEmp = empsList.find(e => e.id === r.employeeId);
              return {
                id: r.id,
                employeeId: r.employeeId,
                employeeName: r.employeeName || matchedEmp?.fullNameAr || matchedEmp?.name || 'موظف',
                civilId: r.civilId || matchedEmp?.civilId || '',
                department: r.department || matchedEmp?.department || 'العموم',
                leaveType: (r.leaveType || 'annual').toLowerCase(),
                startDate: r.startDate,
                endDate: r.endDate,
                daysCount: r.days || r.requestedDays || r.daysCount || 1,
                reason: r.reason || '',
                status: (r.status || 'approved').toLowerCase(),
                appliedDate: r.createdAt?.split('T')[0] || r.appliedDate || '',
                basicSalary: r.basicSalary || matchedEmp?.basicSalary || 0,
                totalSalary: r.totalSalary || matchedEmp?.totalSalary || 0
              };
            });
            localStorage.setItem('odoo_leave_requests_v2', JSON.stringify(odooRequests));
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'leaves')
    );
    
    // 4. Attendance: Strictly scoped to current tenant
    const qAttendance = query(collection(db, 'attendance'), where('companyId', '==', tenantId));
    const unsubAttendance = onSnapshot(qAttendance, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setAttendance(remote);
            setPersistentData(MANARA_STORAGE_KEYS.ATTENDANCE, remote);
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'attendance')
    );
    
    // 5. Payslips: Strictly scoped to current tenant
    const qPayslips = query(collection(db, 'payslips'), where('companyId', '==', tenantId));
    const unsubPayslips = onSnapshot(qPayslips, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setPayslips(remote);
            setPersistentData(MANARA_STORAGE_KEYS.PAYSLIPS, remote);

            // Mirror payslips to legacy 'odoo_payroll_payslips_' + tenantId
            let empsList: any[] = [];
            try {
              const savedEmps = localStorage.getItem(MANARA_STORAGE_KEYS.EMPLOYEES);
              if (savedEmps) empsList = JSON.parse(savedEmps);
            } catch (e) {
              console.error('Error parsing employees list in payslip sync', e);
            }

            const odooPayslips = remote.map((r: any) => {
              const matchedEmp = empsList.find(e => e.id === r.employeeId);
              const basic = r.basicSalary || r.basic || matchedEmp?.basicSalary || 0;
              const housing = r.housingAllowance || r.housing || matchedEmp?.housingAllowance || 0;
              const transport = r.transportAllowance || r.transport || matchedEmp?.transportAllowance || 0;
              const medical = r.medicalAllowance || r.medical || matchedEmp?.medicalAllowance || 0;
              const other = r.otherAllowances || r.otherAllowance || r.allowances || matchedEmp?.otherAllowances || 0;
              const gross = r.grossSalary || r.gross || (basic + housing + transport + medical + other);
              const deductions = r.totalDeductions || (r.gosiDeduction || r.pifssDeduction || 0) + (r.loanDeduction || 0) + (r.latenessDeduction || r.delayDeduction || r.absenceDeduction || 0);
              const net = r.netSalary || r.net || (gross - deductions);

              return {
                id: r.id,
                payslipNumber: r.payslipNumber || `PAY/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${r.id.split('-').pop()?.toUpperCase() || '0001'}`,
                employeeId: r.employeeId,
                employeeName: r.employeeName || matchedEmp?.fullNameAr || matchedEmp?.name || 'موظف',
                civilId: r.civilId || matchedEmp?.civilId || '',
                jobTitle: r.jobTitle || matchedEmp?.jobTitle || 'موظف',
                department: r.department || matchedEmp?.department || 'العموم',
                bankName: r.bankName || matchedEmp?.bankName || 'بيت التمويل الكويتي (KFH)',
                iban: r.iban || matchedEmp?.iban || '',
                period: r.period || (r.payrollRunId ? r.payrollRunId.split('-').slice(-2).join('-') : '2026-08'),
                basicSalary: basic,
                housingAllowance: housing,
                transportAllowance: transport,
                medicalAllowance: medical,
                overtimeHours: r.overtimeHours || 0,
                overtimeAmount: r.overtimeAmount || 0,
                absenceDays: r.absenceDays || 0,
                absenceDeduction: r.absenceDeduction || 0,
                delayMinutes: r.delayMinutes || 0,
                delayDeduction: r.delayDeduction || 0,
                loanDeduction: r.loanDeduction || 0,
                pifssDeduction: r.pifssDeduction || r.gosiDeduction || 0,
                grossSalary: gross,
                totalDeductions: deductions,
                netSalary: net,
                status: (r.status === 'calculated' ? 'review' : (r.status || 'draft')).toLowerCase(),
                notes: r.notes || ''
              };
            });
            localStorage.setItem(`odoo_payroll_payslips_${tenantId}`, JSON.stringify(odooPayslips));
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'payslips')
    );
    
    // 6. Documents: Strictly scoped to current tenant
    const qDocuments = query(collection(db, 'documents'), where('companyId', '==', tenantId));
    const unsubDocuments = onSnapshot(qDocuments, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setDocuments(remote);
            setPersistentData(MANARA_STORAGE_KEYS.DOCUMENTS, remote);
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'documents')
    );
    
    // 7. Custodies: Strictly scoped to current tenant
    const qCustodies = query(collection(db, 'custodies'), where('companyId', '==', tenantId));
    const unsubCustodies = onSnapshot(qCustodies, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setCustodies(remote);
            setPersistentData(MANARA_STORAGE_KEYS.CUSTODIES, remote);
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'custodies')
    );
    
    // 8. Loans: Strictly scoped to current tenant
    const qLoans = query(collection(db, 'loans'), where('companyId', '==', tenantId));
    const unsubLoans = onSnapshot(qLoans, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setLoans(remote);
            setPersistentData(MANARA_STORAGE_KEYS.LOANS, remote);
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'loans')
    );
    
    // 9. Warnings: Strictly scoped to current tenant
    const qWarnings = query(collection(db, 'warnings'), where('companyId', '==', tenantId));
    const unsubWarnings = onSnapshot(qWarnings, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setWarnings(remote);
            setPersistentData(MANARA_STORAGE_KEYS.WARNINGS, remote);
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'warnings')
    );
    
    // 10. Notes: Strictly scoped to current tenant
    const qNotes = query(collection(db, 'employeeNotes'), where('companyId', '==', tenantId));
    const unsubNotes = onSnapshot(qNotes, 
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setEmployeeNotes(remote);
            setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEE_NOTES, remote);
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'employeeNotes')
    );

    // 11. Leave Allocations: Sync and Mirror to 'odoo_leave_allocations_v2'
    const qLeaveAllocations = query(collection(db, 'leave_allocations'), where('companyId', '==', tenantId));
    const unsubLeaveAllocations = onSnapshot(qLeaveAllocations,
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            
            let empsList: any[] = [];
            try {
              const savedEmps = localStorage.getItem(MANARA_STORAGE_KEYS.EMPLOYEES);
              if (savedEmps) empsList = JSON.parse(savedEmps);
            } catch (e) {
              console.error('Error parsing employees list in allocation sync', e);
            }

            const odooAllocations = remote.map((r: any) => {
              const matchedEmp = empsList.find(e => e.id === r.employeeId);
              return {
                id: r.id,
                employeeId: r.employeeId,
                employeeName: r.employeeName || matchedEmp?.fullNameAr || matchedEmp?.name || 'موظف',
                fromYear: r.fromYear || new Date().getFullYear().toString(),
                days: r.days || r.allocatedDays || 30,
                leaveType: (r.leaveType || 'annual').toLowerCase(),
                allocationDate: r.allocationDate || r.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                notes: r.notes || ''
              };
            });
            localStorage.setItem('odoo_leave_allocations_v2', JSON.stringify(odooAllocations));
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'leave_allocations')
    );

    // 12. Public Holiday Duties: Sync and Mirror to 'odoo_holiday_duties_v2'
    const qHolidays = query(collection(db, 'work_on_holidays'), where('companyId', '==', tenantId));
    const unsubHolidays = onSnapshot(qHolidays,
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            
            let empsList: any[] = [];
            try {
              const savedEmps = localStorage.getItem(MANARA_STORAGE_KEYS.EMPLOYEES);
              if (savedEmps) empsList = JSON.parse(savedEmps);
            } catch (e) {
              console.error('Error parsing employees list in holiday duty sync', e);
            }

            const odooDuties = remote.map((r: any) => {
              const matchedEmp = empsList.find(e => e.id === r.employeeId);
              return {
                id: r.id,
                employeeId: r.employeeId,
                employeeName: r.employeeName || matchedEmp?.fullNameAr || matchedEmp?.name || 'موظف',
                civilId: r.civilId || matchedEmp?.civilId || '',
                jobTitle: r.jobTitle || matchedEmp?.jobTitle || 'موظف',
                department: r.department || matchedEmp?.department || 'العموم',
                holidayName: r.name || r.holidayName || 'عطلة رسمية',
                dutyDate: r.date || r.dutyDate || '',
                basicSalary: r.basicSalary || matchedEmp?.basicSalary || 0,
                totalSalary: r.totalSalary || matchedEmp?.totalSalary || 0,
                compensationType: r.compensationType || 'comp_day_off',
                calculatedAmount: r.calculatedAmount || 0,
                status: (r.status || 'approved').toLowerCase()
              };
            });
            localStorage.setItem('odoo_holiday_duties_v2', JSON.stringify(odooDuties));
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'work_on_holidays')
    );

    let unsubNotifications: (() => void) | null = null;
    if (setNotifications) {
      const qNotifs = query(collection(db, 'notifications'), where('companyId', '==', tenantId));
      unsubNotifications = onSnapshot(qNotifs,
        snap => {
          if (!isSuperAdminPlatformMode) {
            const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            if (remote.length > 0) {
              setNotifications(remote);
              setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEE_NOTIFICATIONS, remote);
            }
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'notifications')
      );
    }

    let unsubDepartments: (() => void) | null = null;
    if (setDepartments) {
      const qDepartments = query(collection(db, 'departments'), where('companyId', '==', tenantId));
      unsubDepartments = onSnapshot(qDepartments, 
          snap => {
            if (!isSuperAdminPlatformMode) {
              const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
              if (remote.length > 0) {
                setDepartments(remote);
                setPersistentData(MANARA_STORAGE_KEYS.DEPARTMENTS, remote);
              }
            }
          },
          err => {
              handleFirestoreError(err, OperationType.GET, 'departments');
          }
      );
    }

    let unsubJobTitles: (() => void) | null = null;
    if (setJobTitles) {
      const qJobTitles = query(collection(db, 'job_titles'), where('companyId', '==', tenantId));
      unsubJobTitles = onSnapshot(qJobTitles, 
          snap => {
            if (!isSuperAdminPlatformMode) {
              const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
              if (remote.length > 0) {
                setJobTitles(remote);
                setPersistentData(MANARA_STORAGE_KEYS.JOB_TITLES, remote);
              }
            }
          },
          err => {
              handleFirestoreError(err, OperationType.GET, 'job_titles');
          }
      );
    }

    // Companies & Subscriptions are available for tenant selection and platform administration
    const unsubCompanies = onSnapshot(collection(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies')), 
        snap => {
            if (setCompanies) {
                const docs = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Company[];
                const map = new Map<string, any>();
                const nameMap = new Map<string, any>();
                docs.forEach(c => {
                    if (!c || !c.id) return;
                    const nameKey = (c.nameAr || (c as any).companyName || '').trim().toLowerCase().replace(/\s+/g, ' ');
                    if (nameKey && nameMap.has(nameKey)) {
                        const existing = nameMap.get(nameKey)!;
                        const merged = { ...existing, ...c };
                        map.set(merged.id, merged);
                        nameMap.set(nameKey, merged);
                    } else {
                        map.set(c.id, c);
                        if (nameKey) nameMap.set(nameKey, c);
                    }
                });
                const remote = Array.from(map.values());
                if (remote.length > 0) {
                  setCompanies(remote);
                  setPersistentData(MANARA_STORAGE_KEYS.COMPANIES, remote, MANARA_STORAGE_KEYS.TENANTS);
                }
            }
        },
        err => handleFirestoreError(err, OperationType.GET, 'companies')
    );

    let unsubSubscriptions: (() => void) | null = null;
    if (setSubscriptions) {
      unsubSubscriptions = onSnapshot(collection(db, 'subscriptions'),
        snap => {
          const remote = snap.docs.map(d => ({ ...d.data(), id: d.id }));
          if (remote.length > 0) {
            setSubscriptions(remote);
            setPersistentData(MANARA_STORAGE_KEYS.SUBSCRIPTIONS, remote);
          }
        },
        err => handleFirestoreError(err, OperationType.GET, 'subscriptions')
      );
    }

    return () => {
      unsubEmployees();
      unsubContracts();
      unsubLeaves();
      unsubAttendance();
      unsubPayslips();
      unsubDocuments();
      unsubCustodies();
      unsubLoans();
      unsubWarnings();
      unsubNotes();
      unsubLeaveAllocations();
      unsubHolidays();
      if(unsubNotifications) unsubNotifications();
      if(unsubDepartments) unsubDepartments();
      if(unsubJobTitles) unsubJobTitles();
      unsubCompanies();
      if(unsubSubscriptions) unsubSubscriptions();
    };
  }, [isAuthenticated, activeCompanyId, currentUserRole]);
};
