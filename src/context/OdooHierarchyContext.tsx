import React, { createContext, useContext, useState, useEffect } from 'react';
import { KUWAIT_LABOR_CONFIG } from '../config/kuwaitLaborConfig';
import { useCompany } from './CompanyContext';
import { TenantDatabaseService } from '../services/tenantDataService';

// 1. المستوى الأول: العقد والبيانات الثابتة (hr.contract & hr.employee)
export interface EmployeeContract {
  id: string;
  companyId?: string;
  name: string;
  civilId: string;
  jobTitle: string;
  department: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance?: number;
  isKuwaiti: boolean;
  bankName: string;
  iban: string;
  contractStatus: 'running' | 'expired' | 'draft';
  
  // ترقية نموذج عقد العمل: نوع العقد والدوام والجداول المخصصة
  employmentType?: 'full_time' | 'part_time'; // دوام كامل (راتب شهري) أو دوام جزئي / استشاري زائر (أجر الساعة)
  hasCustomSchedule?: boolean; // تفعيل جدول ساعات مخصصة
  dailyHours?: number; // ساعات العمل اليومية المتفق عليها (Default: 8)
  shiftStartTime?: string; // وقت الحضور المتوقع e.g. "08:00"
  shiftEndTime?: string; // وقت الانصراف المتوقع e.g. "16:00"
  gracePeriodMinutes?: number; // دقائق السماح الصباحية (Default: 15)
  hourlyRate?: number; // أجر الساعة التعاقدي بالدينار (في حالة الدوام الجزئي)
}

// 2. المستوى الثاني: حركات التشغيل اليومية (Daily Operations)
export interface ShiftSchedule {
  expectedDailyHours: number; // 8 ساعات
  startTime: string;          // 08:00
  endTime: string;            // 16:00
  gracePeriodMinutes: number; // فترة سماح 15 دقيقة
}

export interface AttendanceLog {
  employeeId: string;
  delayMinutes: number; // دقائق التأخير
  unpaidAbsenceDays: number; // أيام الغياب بدون إذن
  overtimeHours: number; // ساعات العمل الإضافي
  actualHours?: number; // إجمالي ساعات البصمة الفعلية
  checkIn?: string; // e.g. "08:00"
  checkOut?: string; // e.g. "18:00"
  isHoliday?: boolean;
}

// دالة احتساب الإضافي والتأخير التلقائي مع مراعاة خصائص العقد الفردية
export const computeAttendanceAndOvertime = (
  checkIn: string,   // "08:00"
  checkOut: string,  // "18:00"
  grossSalary: number,
  isHoliday: boolean = false,
  contractSchedule?: {
    dailyHours?: number;
    shiftStartTime?: string;
    shiftEndTime?: string;
    gracePeriodMinutes?: number;
    employmentType?: 'full_time' | 'part_time';
    hourlyRate?: number;
  }
) => {
  if (!checkIn || !checkOut || typeof checkIn !== 'string' || typeof checkOut !== 'string') {
    return {
      actualHours: 0,
      overtimeHours: 0,
      overtimeAmount: 0,
      delayMinutes: 0,
      delayDeduction: 0
    };
  }

  // حساب الساعات الفعلية من البصمة
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  
  const actualMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
  const actualHours = actualMinutes / 60;
  
  // معايير العقد المخصص
  const standardHours = contractSchedule?.dailyHours && contractSchedule.dailyHours > 0 
    ? contractSchedule.dailyHours 
    : 8; // الافتراضي 8 ساعات

  let startTimeStr = contractSchedule?.shiftStartTime || '08:00';
  if (typeof startTimeStr !== 'string') startTimeStr = '08:00';
  const [expectedInH, expectedInM] = startTimeStr.split(':').map(Number);
  const expectedInTotalMin = (expectedInH || 8) * 60 + (expectedInM || 0);

  const graceMinutes = contractSchedule?.gracePeriodMinutes !== undefined 
    ? contractSchedule.gracePeriodMinutes 
    : 15; // فترة السماح الافتراضية 15 دقيقة

  // احتساب أجر الساعة
  let hourRate = 0;
  if (contractSchedule?.employmentType === 'part_time' && (contractSchedule.hourlyRate || 0) > 0) {
    hourRate = contractSchedule.hourlyRate || 0;
  } else {
    hourRate = (grossSalary / 26) / standardHours; // أجر الساعة (أساس 26 يوم)
  }

  let overtimeHours = 0;
  let delayMinutes = 0;

  // للموظف دوام كامل: ما زاد عن الساعات القياسية يحسب كإضافي
  if (actualHours > standardHours) {
    overtimeHours = actualHours - standardHours;
  }

  const actualInTotalMin = inH * 60 + inM;
  if (actualInTotalMin > expectedInTotalMin + graceMinutes) {
    delayMinutes = actualInTotalMin - expectedInTotalMin;
  }

  // نسبة البدل للإضافي
  const multiplier = isHoliday ? 2.0 : 1.25;
  const overtimeAmount = overtimeHours * hourRate * multiplier;
  const delayDeduction = (delayMinutes / 60) * hourRate;

  return {
    actualHours: Math.round(actualHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    overtimeAmount: Math.round(overtimeAmount * 1000) / 1000,
    delayMinutes: Math.round(delayMinutes),
    delayDeduction: Math.round(delayDeduction * 1000) / 1000
  };
};

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  totalAmount: number;
  monthlyInstallment: number;
  remainingAmount: number;
}

export interface LeaveAccrual {
  employeeId: string;
  carriedFrom2025: number;
  earned2026: number;
  consumedDays: number;
  prepaidLeaveDays: number; // إجازات تم صرف راتبها مقدماً (مادة 71)
  excludedServiceDays?: number; // أيام الإجازة الزائدة عن الرصيد غير المحسوبة في الخدمة
  unpaidExcessDays?: number; // أيام التجاوز غير المدفوعة
}

// 3. المستوى الثالث: مسير الرواتب المحسوب تلقائياً (hr.payslip)
export interface PayslipComputation {
  employeeId: string;
  name: string;
  civilId: string;
  iban: string;
  basic: number;
  allowances: number;
  grossSalary: number;
  attendanceDeduction: number;
  loanDeduction: number;
  pifssDeduction: number; // التأمينات الاجتماعية
  overtimeAmount: number;
  prepaidDeduction: number; // خصم ما تم صرفه مقدماً
  netSalary: number;
}

interface OdooHierarchyContextType {
  employees: EmployeeContract[];
  attendance: Record<string, AttendanceLog>;
  loans: EmployeeLoan[];
  leaveAccruals: Record<string, LeaveAccrual>;
  computedPayslips: PayslipComputation[];
  updateContractSalary: (empId: string, newBasic: number, newHousing: number) => void;
  updateContractDetails: (contractData: Partial<EmployeeContract> & { id: string }) => void;
  recordAttendanceShift: (empId: string, delayMin: number, overtimeHr: number) => void;
  recordAttendanceTimes: (empId: string, checkIn: string, checkOut?: string, delayMinutes?: number, overtimeHours?: number, isHoliday?: boolean) => void;
  addLoan: (empId: string, amount: number, installment: number) => void;
  deleteLoan: (loanId: string) => void;
  registerLoanPayment: (loanId: string, amountToPay: number) => void;
  addEmployee: (emp: EmployeeContract) => void;
  recordUnpaidAbsence: (empId: string, days: number) => void;
  updateLeaveAccrual: (empId: string, carried: number, earned: number, consumed: number, excludedServiceDays?: number) => void;
  processMonthlyAccruals: () => void;
  calculateEmployeeServiceYearsWithExclusions: (empId: string, joinDateStr: string, endDateStr?: string) => {
    grossYears: number;
    excludedDays: number;
    netServiceYears: number;
    actualServiceDays: number;
  };
  processMonthlyBatch: () => void;
}

const OdooHierarchyContext = createContext<OdooHierarchyContextType | undefined>(undefined);

export const OdooHierarchyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeCompany, activeCompanyId } = useCompany();
  const currentCompanyId = activeCompanyId || activeCompany?.id || 'comp-super-admin';

  // بيانات العقود المركزية
  const [employees, setEmployees] = useState<EmployeeContract[]>([]);

  // مزامنة الموظفين حياً من قاعدة البيانات للشركة النشطة
  useEffect(() => {
    let isMounted = true;
    setEmployees([]); // Clear immediately on company change to prevent cross-company bleed
    async function syncEmployeesFromDb() {
      if (!currentCompanyId) return;
      try {
        const dbEmps = await TenantDatabaseService.getEmployeesByTenant(currentCompanyId);
        if (isMounted) {
          if (dbEmps && dbEmps.length > 0) {
            const mapped: EmployeeContract[] = dbEmps.map(emp => ({
              id: emp.id,
              companyId: emp.companyId || currentCompanyId,
              name: emp.fullNameAr || (emp as any).nameAr || (emp as any).name || 'موظف',
              civilId: emp.civilId || '',
              jobTitle: emp.jobTitle || 'موظف',
              department: emp.department || (emp as any).dept || 'العموم',
              basicSalary: (emp as any).basicSalary || (emp as any).contractSalary || 1000,
              housingAllowance: (emp as any).housingAllowance || 0,
              transportAllowance: (emp as any).transportAllowance || 0,
              medicalAllowance: (emp as any).medicalAllowance || 0,
              isKuwaiti: Boolean(emp.isKuwaiti),
              bankName: emp.bankName || 'بيت التمويل الكويتي (KFH)',
              iban: emp.iban || '',
              contractStatus: 'running'
            }));
            setEmployees(mapped);
          } else {
            setEmployees([]);
          }
        }
      } catch (e) {
        console.error('Error syncing employees in OdooHierarchyProvider:', e);
      }
    }
    syncEmployeesFromDb();
    return () => { isMounted = false; };
  }, [currentCompanyId]);

  // حركات البصمة
  const [attendance, setAttendance] = useState<Record<string, AttendanceLog>>({});

  // السلف المالية
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);

  // أرصدة الإجازات
  const [leaveAccruals, setLeaveAccruals] = useState<Record<string, LeaveAccrual>>({});

  const [computedPayslips, setComputedPayslips] = useState<PayslipComputation[]>([]);

  // تفريغ وتصفير كافة البيانات الفرعية تلقائياً عند تغيير المنشأة النشطة لمنع تداخل البيانات
  useEffect(() => {
    setAttendance({});
    setLoans([]);
    setLeaveAccruals({});
    setComputedPayslips([]);
  }, [currentCompanyId]);

  // محرك الحساب الهرمي التلقائي (Compute Sheet)
  const computeAllPayslips = () => {
    const results: PayslipComputation[] = employees.map(emp => {
      const att = attendance[emp.id] || { employeeId: emp.id, delayMinutes: 0, unpaidAbsenceDays: 0, overtimeHours: 0 };
      const empLoan = loans.find(l => l.employeeId === emp.id);

      // 1. الراتب الشامل والدوام
      const isPartTime = emp.employmentType === 'part_time';
      const contractHourlyRate = emp.hourlyRate || 0;
      const allowances = (emp.housingAllowance || 0) + (emp.transportAllowance || 0) + (emp.medicalAllowance || 0);

      // حساب البصمة التلقائي المعتمد على ساعات وأوقات العقد
      let calculatedDelayMinutes = att.delayMinutes;
      let calculatedOvertimeHours = att.overtimeHours;
      let calculatedOtAmount = 0;
      let calculatedDelayDeduction = 0;
      let actualHours = att.actualHours || 0;

      const scheduleConfig = {
        dailyHours: emp.dailyHours,
        shiftStartTime: emp.shiftStartTime,
        shiftEndTime: emp.shiftEndTime,
        gracePeriodMinutes: emp.gracePeriodMinutes,
        employmentType: emp.employmentType,
        hourlyRate: emp.hourlyRate
      };

      if (att.checkIn && att.checkOut) {
        const result = computeAttendanceAndOvertime(
          att.checkIn, 
          att.checkOut, 
          isPartTime ? (contractHourlyRate * (emp.dailyHours || 4) * 26) : (emp.basicSalary + allowances), 
          att.isHoliday,
          scheduleConfig
        );
        calculatedDelayMinutes = result.delayMinutes;
        calculatedOvertimeHours = result.overtimeHours;
        calculatedOtAmount = result.overtimeAmount;
        calculatedDelayDeduction = result.delayDeduction;
        actualHours = result.actualHours;
      }

      // 2. معادلة احتساب الراتب الإجمالي:
      // لموظفي الدوام الجزئي: (إجمالي ساعات البصمة الفعلية × أجر الساعة التعاقدي) + البدلات
      let gross = 0;
      let basicDisplay = emp.basicSalary;

      if (isPartTime) {
        // حساب إجمالي ساعات البصمة (ساعات اليوم الحالي أو المسجلة)
        const effectiveHours = actualHours > 0 ? actualHours : (emp.dailyHours || 4);
        const hourlyComputedGross = effectiveHours * contractHourlyRate;
        gross = hourlyComputedGross + allowances;
        basicDisplay = hourlyComputedGross;
      } else {
        gross = emp.basicSalary + allowances;
      }

      // 3. معادلة اليوم والساعة وفق القطاع الخاص الكويتي (القسمة على 26 يوم)
      const dayHours = emp.dailyHours || 8;
      const dayRate = isPartTime ? (contractHourlyRate * dayHours) : KUWAIT_LABOR_CONFIG.helpers.getDayRate(gross);
      const hourRate = isPartTime ? contractHourlyRate : (dayRate / dayHours);
      const minRate = hourRate / 60;

      // 4. الاستقطاعات والإضافات
      const finalDelayMinutes = att.checkIn && att.checkOut ? calculatedDelayMinutes : att.delayMinutes;
      const finalOvertimeHours = att.checkIn && att.checkOut ? calculatedOvertimeHours : att.overtimeHours;

      const attDeduction = isPartTime 
        ? (finalDelayMinutes * minRate)
        : ((finalDelayMinutes * minRate) + (att.unpaidAbsenceDays * dayRate));

      const otAmount = att.checkIn && att.checkOut 
        ? calculatedOtAmount 
        : (finalOvertimeHours * hourRate * (isPartTime ? 1.0 : KUWAIT_LABOR_CONFIG.payroll.overtimeRateRegular));
        
      const loanDed = empLoan && empLoan.remainingAmount > 0 
        ? Math.min(empLoan.monthlyInstallment, empLoan.remainingAmount) 
        : 0;
      const pifssDed = 0.000;

      // 5. صافي الراتب المستحق
      const totalDeductions = attDeduction + loanDed + pifssDed;
      const net = Math.max(0, gross + otAmount - totalDeductions);

      return {
        employeeId: emp.id,
        name: emp.name,
        civilId: emp.civilId,
        iban: emp.iban,
        basic: Math.round(basicDisplay * 1000) / 1000,
        allowances,
        grossSalary: Math.round(gross * 1000) / 1000,
        attendanceDeduction: Math.round(attDeduction * 1000) / 1000,
        loanDeduction: loanDed,
        pifssDeduction: 0.000, // صفر تأمينات
        overtimeAmount: Math.round(otAmount * 1000) / 1000,
        prepaidDeduction: 0,
        netSalary: Math.round(net * 1000) / 1000
      };
    });

    setComputedPayslips(results);
  };

  useEffect(() => {
    computeAllPayslips();
  }, [employees, attendance, loans, leaveAccruals]);

  const updateContractSalary = (empId: string, newBasic: number, newHousing: number) => {
    setEmployees(employees.map(e => e.id === empId ? { ...e, basicSalary: newBasic, housingAllowance: newHousing } : e));
  };

  const updateContractDetails = (contractData: Partial<EmployeeContract> & { id: string }) => {
    setEmployees(prev => prev.map(e => e.id === contractData.id ? { ...e, ...contractData } : e));
  };

  const recordAttendanceShift = (empId: string, delayMin: number, overtimeHr: number) => {
    setAttendance(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] || { employeeId: empId, unpaidAbsenceDays: 0 }), delayMinutes: delayMin, overtimeHours: overtimeHr }
    }));
  };

  const recordAttendanceTimes = (
    empId: string, 
    checkIn: string, 
    checkOut?: string, 
    delayMinutes?: number, 
    overtimeHours?: number, 
    isHoliday?: boolean
  ) => {
    setAttendance(prev => {
      const current = prev[empId] || { employeeId: empId, unpaidAbsenceDays: 0, delayMinutes: 0, overtimeHours: 0 };
      return {
        ...prev,
        [empId]: { 
          ...current, 
          checkIn, 
          checkOut: checkOut || current.checkOut,
          delayMinutes: delayMinutes !== undefined ? delayMinutes : current.delayMinutes,
          overtimeHours: overtimeHours !== undefined ? overtimeHours : current.overtimeHours,
          isHoliday: isHoliday !== undefined ? !!isHoliday : !!current.isHoliday 
        }
      };
    });
  };

  const addLoan = (empId: string, amount: number, installment: number) => {
    setLoans([...loans, { id: `LN-0${loans.length + 1}`, employeeId: empId, totalAmount: amount, monthlyInstallment: installment, remainingAmount: amount }]);
  };

  const deleteLoan = (loanId: string) => {
    setLoans(loans.filter(l => l.id !== loanId));
  };

  const registerLoanPayment = (loanId: string, amountToPay: number) => {
    setLoans(loans.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          remainingAmount: Math.max(0, l.remainingAmount - amountToPay)
        };
      }
      return l;
    }));
  };

  const addEmployee = async (emp: EmployeeContract) => {
    const activeCompanyId = currentCompanyId;
    const civilId = ((emp as any).civil_id_number || emp.civilId || '').trim();

    // 1. منع التكرار برقم البطاقة المدنية (Unique Civil ID)
    if (civilId) {
      const isDuplicate = employees.some(
        e => (e.companyId === activeCompanyId || activeCompanyId === 'comp-super-admin') &&
        (((e as any).civil_id_number && (e as any).civil_id_number.trim() === civilId) ||
         (e.civilId && e.civilId.trim() === civilId))
      );
      if (isDuplicate) {
        alert('خطأ: الموظف مسجل بالفعل! الرقم المدني مكرر في هذه الشركة.');
        return false;
      }
    }

    // 2. إدراج companyId إجبارياً في الـ Payload
    const newEmployee: EmployeeContract = {
      ...emp,
      companyId: activeCompanyId, // الربط الصارم بالشركة النشطة
      civilId: civilId,
    };
    (newEmployee as any).civil_id_number = civilId;
    (newEmployee as any).createdAt = (emp as any).createdAt || new Date().toISOString();

    setEmployees(prev => [newEmployee, ...prev]);

    // Save to Firestore with explicit companyId
    await TenantDatabaseService.saveEmployee({
      id: newEmployee.id,
      fullNameAr: newEmployee.name,
      civilId: civilId,
      civil_id_number: civilId,
      jobTitle: newEmployee.jobTitle,
      department: newEmployee.department,
      bankName: newEmployee.bankName,
      iban: newEmployee.iban,
      contractSalary: newEmployee.basicSalary,
      basicSalary: newEmployee.basicSalary,
      companyId: activeCompanyId,
      createdAt: new Date().toISOString()
    } as any, activeCompanyId);

    // Create default attendance
    setAttendance(prev => ({
      ...prev,
      [newEmployee.id]: { employeeId: newEmployee.id, delayMinutes: 0, unpaidAbsenceDays: 0, overtimeHours: 0 }
    }));
    // Create default leave accrual
    setLeaveAccruals(prev => ({
      ...prev,
      [newEmployee.id]: { employeeId: newEmployee.id, carriedFrom2025: 0, earned2026: 0, consumedDays: 0, prepaidLeaveDays: 0 }
    }));
    return true;
  };

  const recordUnpaidAbsence = (empId: string, days: number) => {
    setAttendance(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] || { employeeId: empId, delayMinutes: 0, overtimeHours: 0 }), unpaidAbsenceDays: days }
    }));
  };

  const updateLeaveAccrual = (
    empId: string, 
    carried: number, 
    earned: number, 
    consumed: number, 
    excludedServiceDays?: number
  ) => {
    setLeaveAccruals(prev => {
      const existing = prev[empId];
      const totalAvailable = carried + earned;
      // إذا تجاوزت الإجازة المستهلكة الرصيد المتاح، تحسب الأيام الزائدة كأيام غير محسوبة بالخدمة
      const excessDays = Math.max(0, consumed - totalAvailable);
      const finalExcluded = excludedServiceDays !== undefined ? excludedServiceDays : excessDays;

      return {
        ...prev,
        [empId]: {
          employeeId: empId,
          carriedFrom2025: carried,
          earned2026: earned,
          consumedDays: consumed,
          prepaidLeaveDays: existing?.prepaidLeaveDays || 0,
          excludedServiceDays: finalExcluded,
          unpaidExcessDays: excessDays
        }
      };
    });
  };

  // استمرار إضافة 2.5 يوم تلقائياً في يوم 30 من كل شهر ميلادي لرصيد الإجازات السنوية لكل موظف نشط
  const processMonthlyAccruals = () => {
    setLeaveAccruals(prev => {
      const updated: Record<string, LeaveAccrual> = { ...prev };
      employees.forEach(emp => {
        if (emp.contractStatus === 'running') {
          const current = updated[emp.id] || {
            employeeId: emp.id,
            carriedFrom2025: 0,
            earned2026: 0,
            consumedDays: 0,
            prepaidLeaveDays: 0
          };
          const newEarned = Math.round((current.earned2026 + 2.5) * 100) / 100;
          const totalAvailable = current.carriedFrom2025 + newEarned;
          const excessDays = Math.max(0, current.consumedDays - totalAvailable);

          updated[emp.id] = {
            ...current,
            earned2026: newEarned,
            excludedServiceDays: excessDays,
            unpaidExcessDays: excessDays
          };
        }
      });
      return updated;
    });
  };

  // حساب مدة الخدمة الفعلية مع طرح أيام التجاوز الزائدة (Excluded Service Days)
  const calculateEmployeeServiceYearsWithExclusions = (
    empId: string, 
    joinDateStr: string, 
    endDateStr: string = new Date().toISOString().split('T')[0]
  ) => {
    const start = new Date(joinDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const grossTotalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const accrual = leaveAccruals[empId];
    const excludedDays = accrual?.excludedServiceDays || accrual?.unpaidExcessDays || 0;
    const actualServiceDays = Math.max(0, grossTotalDays - excludedDays);
    
    const grossYears = grossTotalDays / 365.25;
    const netServiceYears = actualServiceDays / 365.25;

    return {
      grossYears: Math.round(grossYears * 100) / 100,
      excludedDays,
      netServiceYears: Math.round(netServiceYears * 100) / 100,
      actualServiceDays
    };
  };

  const processMonthlyBatch = () => {
    computeAllPayslips();
  };

  return (
    <OdooHierarchyContext.Provider value={{
      employees,
      attendance,
      loans,
      leaveAccruals,
      computedPayslips,
      updateContractSalary,
      updateContractDetails,
      recordAttendanceShift,
      recordAttendanceTimes,
      addLoan,
      deleteLoan,
      registerLoanPayment,
      addEmployee,
      recordUnpaidAbsence,
      updateLeaveAccrual,
      processMonthlyAccruals,
      calculateEmployeeServiceYearsWithExclusions,
      processMonthlyBatch
    }}>
      {children}
    </OdooHierarchyContext.Provider>
  );
};

export const useOdooHierarchy = () => {
  const context = useContext(OdooHierarchyContext);
  if (!context) throw new Error('useOdooHierarchy must be used within OdooHierarchyProvider');
  return context;
};
