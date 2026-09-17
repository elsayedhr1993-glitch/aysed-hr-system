// src/services/holidayWorkService.ts
import { db, cleanFirestoreData } from '../lib/firebase';
import { collection, setDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy, where } from 'firebase/firestore';
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from '../utils/persistentStorage';
import { HrLeaveAllocation } from '../types';
import { cancelLeaveBalanceTransaction, upsertLeaveBalanceTransaction } from './leaveBalanceLedgerService';

const round3 = (value: number) => Math.round((Number(value) || 0) * 1000) / 1000;

/** Canonical Firestore collection for leave balance buckets (all apps read this). */
const LEAVE_ALLOCATIONS_COLLECTION = 'leave_allocations';

export interface HolidayDutyPayrollInput {
  id: string;
  employeeId: string;
  employeeName: string;
  civilId?: string;
  jobTitle?: string;
  department?: string;
  holidayName: string;
  dutyDate: string;
  basicSalary?: number;
  totalSalary?: number;
  compensationType: 'double_pay' | 'comp_day_off' | 'add_to_annual_leave';
  calculatedAmount: number;
  status?: 'approved' | 'settled';
  settledAt?: string;
}

export async function persistHolidayDutyRecord(
  duty: HolidayDutyPayrollInput,
  companyId: string
): Promise<void> {
  if (!db || !duty.id) return;
  const payload = cleanFirestoreData({
    ...duty,
    companyId,
    date: duty.dutyDate,
    recordType: 'holiday_duty',
    updatedAt: new Date().toISOString(),
  });
  await setDoc(doc(db, 'work_on_holidays', duty.id), payload, { merge: true });
}

export interface LeaveType {
  id?: string;
  name: string;
  code: string;
  requiresAllocation: boolean;
  isUnpaid: boolean;
}

export type CompensationOption = 'ANNUAL_ACCRUAL' | 'COMP_OFF' | 'day';

export interface WorkOnHolidayRecord {
  id?: string;
  employeeId: string;
  companyId?: string;
  date: string; // YYYY-MM-DD
  holidayName: string;
  hoursWorked: number;
  compensationType: CompensationOption; // إضافة للرصيد السنوي (+1 يوم لرصيد إجازات الموظف)
  state: 'draft' | 'approved' | 'done';
  createdAt?: string;
}

export interface HolidayCompensationCalculation {
  dailyWage: number;
  hourlyRate: number;
  overtimeMultiplier: number;
  cashPayableAmount: number;
  compensatoryDaysAdded: number;
}

export function normalizeCompensationType(type: CompensationOption): 'COMP_OFF' | 'ANNUAL_ACCRUAL' {
  if (type === 'ANNUAL_ACCRUAL') return 'ANNUAL_ACCRUAL';
  return 'COMP_OFF'; // default: إضافة لرصيد الإجازات التعويضية / الراحات البديلة (Comp-Off)
}

/**
 * احتساب رصيد العمل في العطلات والراحات الأسبوعية:
 * إضافة (+1 يوم) لرصيد الإجازات التعويضية (Comp-Off) أو الرصيد السنوي.
 */
export function calculateHolidayCompensation(
  basicWage: number,
  hoursWorked: number = 8,
  compensationType: CompensationOption = 'COMP_OFF'
): HolidayCompensationCalculation {
  // قاعدة 26 يوم عمل
  const dailyWage = Number((basicWage / 26).toFixed(3));
  const hourlyRate = Number((dailyWage / 8).toFixed(3));
  
  // العمل أثناء العطلة يمنح الموظف يوماً كاملاً (+1 يوم)
  const calculatedDays = hoursWorked >= 4 ? 1 : Number((hoursWorked / 8).toFixed(2));
  const finalDays = Math.max(1, calculatedDays);

  return {
    dailyWage,
    hourlyRate,
    overtimeMultiplier: 1.0,
    cashPayableAmount: 0,
    compensatoryDaysAdded: finalDays
  };
}

/**
 * حفظ سجل جديد في التخزين المحلي وقاعدة البيانات
 */
export async function saveHolidayWorkRecord(record: WorkOnHolidayRecord): Promise<WorkOnHolidayRecord> {
  const recordId = record.id || `hwr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newRec: WorkOnHolidayRecord = {
    ...record,
    id: recordId,
    createdAt: record.createdAt || new Date().toISOString()
  };

  // 1. Save to local storage (deduplicated by id or employeeId + date)
  const localRecords = getPersistentData<WorkOnHolidayRecord[]>(MANARA_STORAGE_KEYS.HOLIDAY_WORK_RECORDS, []);
  const filtered = localRecords.filter(r => r.id !== recordId && !(r.employeeId === newRec.employeeId && r.date === newRec.date && r.holidayName === newRec.holidayName));
  const updatedList = [newRec, ...filtered];
  setPersistentData(MANARA_STORAGE_KEYS.HOLIDAY_WORK_RECORDS, updatedList);

  // 2. Save to Firestore using setDoc with document ID = recordId
  try {
    if (db) {
      await setDoc(doc(db, 'work_on_holidays', recordId), newRec as any);
    }
  } catch (e) {
    console.warn('[HolidayWorkService] Firestore save warning:', e);
  }

  return newRec;
}

/**
 * جلب جميع سجلات العمل في العطلات (مع الدمج بين محلي وفايربيس ومنع التكرار)
 */
export async function getHolidayWorkRecords(companyId?: string): Promise<WorkOnHolidayRecord[]> {
  const localRecords = getPersistentData<WorkOnHolidayRecord[]>(MANARA_STORAGE_KEYS.HOLIDAY_WORK_RECORDS, []);
  let cloudRecords: WorkOnHolidayRecord[] = [];

  try {
    if (db) {
      const q = query(collection(db, 'work_on_holidays'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      cloudRecords = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          ...data,
          id: data.id || d.id
        };
      }) as WorkOnHolidayRecord[];
    }
  } catch (e) {
    console.warn('[HolidayWorkService] Firestore fetch error:', e);
  }

  // Merge records uniquely with semantic deduplication (employee + date + holiday)
  const map = new Map<string, WorkOnHolidayRecord>();
  const combined = [...cloudRecords, ...localRecords];

  combined.forEach(r => {
    if (!r.employeeId || !r.date) return;
    const semKey = `${r.employeeId}_${r.date}_${r.holidayName || ''}`;
    
    if (map.has(semKey)) {
      const existing = map.get(semKey)!;
      // Prefer approved state over draft
      if (r.state === 'approved' && existing.state !== 'approved') {
        map.set(semKey, r);
      }
    } else {
      map.set(semKey, r);
    }
  });

  const all = Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  
  // Persist clean deduplicated list to local storage
  setPersistentData(MANARA_STORAGE_KEYS.HOLIDAY_WORK_RECORDS, all);

  if (companyId && companyId !== 'comp-super-admin') {
    return all.filter(r => r.companyId === companyId);
  }
  return all;
}

/**
 * حذف سجل العمل في العطلة وإلغاء الاستحقاق أو اليوم التعويضي المقترن به
 */
export async function deleteHolidayWorkRecord(recordId: string, employeeId?: string): Promise<{ success: boolean; message: string }> {
  try {
    const localRecords = getPersistentData<WorkOnHolidayRecord[]>(MANARA_STORAGE_KEYS.HOLIDAY_WORK_RECORDS, []);
    const targetRecord = localRecords.find(r => r.id === recordId || (employeeId && r.employeeId === employeeId && r.id === recordId));
    
    const targetEmpId = employeeId || targetRecord?.employeeId;
    const targetDate = targetRecord?.date;
    const targetHoliday = targetRecord?.holidayName;

    // 1. إزالة السجل من مصفوفة سجلات العطلات المحلية
    const filteredRecords = localRecords.filter(r => {
      if (r.id === recordId) return false;
      if (targetRecord && r.id === targetRecord.id) return false;
      if (targetEmpId && targetDate && r.employeeId === targetEmpId && r.date === targetDate) return false;
      return true;
    });
    setPersistentData(MANARA_STORAGE_KEYS.HOLIDAY_WORK_RECORDS, filteredRecords);

    // 2. إذا كان السجل قد تم اعتماده وأضاف رصيداً (سنوي أو تعويضي)، نقوم بإلغاء التخصيص المرتبط به
    const existingAllocs = getPersistentData<HrLeaveAllocation[]>(MANARA_STORAGE_KEYS.LEAVE_ALLOCATIONS, []);
    const allocIdComp = `alloc-comp-${recordId}`;
    const allocIdAnnual = `alloc-annual-${recordId}`;
    
    const filteredAllocs = existingAllocs.filter(a => {
      if (a.id === allocIdComp || a.id === allocIdAnnual || a.id === `alloc-comp-${targetRecord?.id}` || a.id === `alloc-annual-${targetRecord?.id}` || a.id === recordId) return false;
      if (targetEmpId && (a.employeeId === targetEmpId || (a as any).employeeCode === targetEmpId)) {
        const isTargetMatch = a.id?.includes(recordId) || (targetRecord?.id && a.id?.includes(targetRecord.id)) || (targetDate && a.dateFrom === targetDate);
        if (isTargetMatch) return false;
      }
      return true;
    });

    setPersistentData(MANARA_STORAGE_KEYS.LEAVE_ALLOCATIONS, filteredAllocs);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('manara_leave_allocations_data', JSON.stringify(filteredAllocs));
    }

    await cancelLeaveBalanceTransaction(`holiday-work-${recordId}`);

    // 3. حذف السجل ومخصصاته من Firestore
    try {
      if (db) {
        if (recordId) {
          try { await deleteDoc(doc(db, 'work_on_holidays', recordId)); } catch (_) {}
        }
        if (targetRecord?.id && targetRecord.id !== recordId) {
          try { await deleteDoc(doc(db, 'work_on_holidays', targetRecord.id)); } catch (_) {}
        }

        const snap = await getDocs(collection(db, 'work_on_holidays'));
        for (const d of snap.docs) {
          const data = d.data() as any;
          const matches = d.id === recordId || 
                          data.id === recordId || 
                          (targetRecord?.id && (d.id === targetRecord.id || data.id === targetRecord.id)) ||
                          (targetEmpId && targetDate && data.employeeId === targetEmpId && data.date === targetDate);
          if (matches) {
            try { await deleteDoc(doc(db, 'work_on_holidays', d.id)); } catch (_) {}
          }
        }

        const allocIds = [
          `alloc-holiday-${recordId}`,
          `alloc-holiday-${targetRecord?.id}`,
          `alloc-comp-${recordId}`,
          `alloc-annual-${recordId}`,
        ].filter(Boolean);
        for (const allocId of allocIds) {
          try { await deleteDoc(doc(db, LEAVE_ALLOCATIONS_COLLECTION, allocId)); } catch (_) {}
        }
        const allocSnap = await getDocs(
          query(collection(db, LEAVE_ALLOCATIONS_COLLECTION), where('employeeId', '==', targetEmpId || '__none__'))
        );
        for (const d of allocSnap.docs) {
          const data = d.data() as any;
          const isTargetAlloc =
            data.id?.includes(recordId) ||
            (targetRecord?.id && data.id?.includes(targetRecord.id)) ||
            (targetEmpId && targetDate && data.dateFrom === targetDate);
          if (isTargetAlloc) {
            try { await deleteDoc(doc(db, LEAVE_ALLOCATIONS_COLLECTION, d.id)); } catch (_) {}
          }
        }
        // Legacy collection cleanup
        const legacySnap = await getDocs(collection(db, 'allocations'));
        for (const d of legacySnap.docs) {
          const data = d.data() as any;
          const isTargetAlloc =
            data.id?.includes(recordId) ||
            (targetRecord?.id && data.id?.includes(targetRecord.id));
          if (isTargetAlloc) {
            try { await deleteDoc(doc(db, 'allocations', d.id)); } catch (_) {}
          }
        }
      }
    } catch (fe) {
      console.warn('[HolidayWorkService] Firestore record delete warning:', fe);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('manara_allocations_updated'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true, message: 'تم حذف السجل وإلغاء الأيام والاستحقاقات المحتسبة بنجاح' };
  } catch (error: any) {
    return { success: false, message: error.message || 'فشل حذف السجل' };
  }
}

/**
 * اعتماد السجل وترحيله مباشرة إلى رصيد الإجازات السنوية للموظف (+1 يوم لرصيد الإجازات)
 */
export async function approveHolidayWork(
  record: WorkOnHolidayRecord,
  basicWage: number
): Promise<{ success: boolean; message: string; allocation?: HrLeaveAllocation }> {
  try {
    const calc = calculateHolidayCompensation(basicWage, record.hoursWorked, record.compensationType);
    const addedDays = calc.compensatoryDaysAdded || 1;

    // 1. تحديث حالة السجل إلى approved
    const updatedRecord: WorkOnHolidayRecord = {
      ...record,
      state: 'approved'
    };
    await saveHolidayWorkRecord(updatedRecord);

    // 2. إنشاء مخصص رصيد إجازة (إجازة تعويضية منفصلة أو رصيد سنوي) بمقدار (+1 يوم)
    const norm = normalizeCompensationType(record.compensationType);
    const allocId = `alloc-holiday-${updatedRecord.id || Date.now()}`;
    const isCompOff = norm === 'COMP_OFF';

    const createdAlloc: HrLeaveAllocation = {
      id: allocId,
      name: isCompOff
        ? `إجازة تعويضية / راحة بديلة (Comp-Off) عن عمل في (${record.holidayName || 'عطلة رسمية / راحة أسبوعية'})`
        : `إضافة للرصيد السنوي عن عمل في (${record.holidayName || 'عطلة رسمية / راحة أسبوعية'})`,
      employeeId: record.employeeId,
      companyId: record.companyId || '',
      leaveType: 'ANNUAL',
      allocationType: isCompOff ? 'compensatory_off' : 'accrual',
      numberOfDays: addedDays,
      remainingDays: addedDays,
      consumedDays: 0,
      state: 'validate',
      dateFrom: record.date || new Date().toISOString().split('T')[0],
      notes: isCompOff
        ? `رصيد إجازة تعويضية منفصل (Comp-Off) عن العمل في (${record.holidayName || 'عطلة رسمية'}) بتاريخ ${record.date} (+${addedDays} يوم)`
        : `إضافة لرصيد الإجازات السنوية عن العمل في (${record.holidayName || 'عطلة رسمية'}) بتاريخ ${record.date} (+${addedDays} يوم)`,
      createdAt: new Date().toISOString()
    };

    await upsertLeaveBalanceTransaction({
      id: `holiday-work-${updatedRecord.id}`,
      companyId: record.companyId || '',
      employeeId: record.employeeId,
      type: isCompOff ? 'COMP_OFF' : 'ANNUAL_ACCRUAL',
      source: 'HOLIDAY_WORK',
      sourceId: updatedRecord.id || allocId,
      days: addedDays,
      status: 'APPROVED',
      effectiveDate: record.date || new Date().toISOString().split('T')[0],
      notes: createdAlloc.notes
    });

    const existingAllocs = getPersistentData<HrLeaveAllocation[]>(MANARA_STORAGE_KEYS.LEAVE_ALLOCATIONS, []);
    const filteredExisting = existingAllocs.filter(
      a => a.id !== allocId && !(a.employeeId === record.employeeId && a.dateFrom === record.date && (a.name?.includes(record.holidayName) || a.notes?.includes(record.holidayName)))
    );
    const newAllocList = [createdAlloc, ...filteredExisting];
    
    setPersistentData(MANARA_STORAGE_KEYS.LEAVE_ALLOCATIONS, newAllocList);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('manara_leave_allocations_data', JSON.stringify(newAllocList));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('manara_allocations_updated'));
      window.dispatchEvent(new Event('storage'));
    }

    try {
      if (db) {
        await setDoc(
          doc(db, LEAVE_ALLOCATIONS_COLLECTION, allocId),
          cleanFirestoreData({ ...createdAlloc, companyId: record.companyId || '' }),
          { merge: true }
        );
      }
    } catch (fe) {
      console.warn('[HolidayWorkService] Firestore leave_allocations sync notice:', fe);
    }

    const msg = isCompOff
      ? `تم اعتماد السجل وإضافة (${addedDays} يوم) إلى رصيد الإجازات التعويضية / الراحات البديلة (Comp-Off) للموظف بنجاح`
      : `تم اعتماد السجل وإضافة (${addedDays} يوم) مباشرة إلى رصيد الإجازات السنوية للموظف بنجاح`;

    return { 
      success: true, 
      message: msg,
      allocation: createdAlloc
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'حدث خطأ أثناء الاعتماد' };
  }
}

/**
 * ترحيل بدل العمل أثناء العطلة (دفع مضاعف) إلى مسير الرواتب في Firestore.
 */
export async function settleHolidayDutyToPayroll(
  duty: HolidayDutyPayrollInput,
  companyId: string
): Promise<{ success: boolean; message: string; payslipId?: string }> {
  if (!db) {
    return { success: false, message: 'قاعدة البيانات غير متاحة' };
  }
  if (duty.compensationType !== 'double_pay') {
    return { success: false, message: 'الترحيل للرواتب متاح فقط لبدل الدفع المضاعف (مادة 68)' };
  }
  if (duty.status === 'settled') {
    return { success: false, message: 'تم ترحيل هذا التكليف مسبقاً' };
  }
  if (!duty.employeeId || !duty.dutyDate) {
    return { success: false, message: 'بيانات التكليف غير مكتملة (موظف/تاريخ)' };
  }

  const period = duty.dutyDate.slice(0, 7);
  const slipId = `SLIP-${period}-${duty.employeeId}`;
  const bonusAdd = round3(duty.calculatedAmount || 0);
  const settledAt = new Date().toISOString().split('T')[0];

  try {
    const snap = await getDoc(doc(db, 'payslips', slipId));
    let payslip: Record<string, unknown>;

    if (snap.exists()) {
      const existing = snap.data() as Record<string, unknown>;
      const bonusAmount = round3(Number(existing.bonusAmount || 0) + bonusAdd);
      const grossSalary = round3(Number(existing.grossSalary || 0));
      const overtimeAmount = round3(Number(existing.overtimeAmount || 0));
      const totalDeductions = round3(Number(existing.totalDeductions || 0));
      const netSalary = Math.max(0, round3(grossSalary + overtimeAmount + bonusAmount - totalDeductions));
      const noteLine = `بدل عطلة: ${duty.holidayName} (${duty.dutyDate}) +${bonusAdd.toFixed(3)} د.ك`;
      payslip = {
        ...existing,
        id: slipId,
        companyId,
        bonusAmount,
        netSalary,
        notes: [existing.notes, noteLine].filter(Boolean).join(' | '),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const basicSalary = round3(duty.basicSalary || (duty.totalSalary || 0) * 0.7);
      const housingAllowance = round3((duty.totalSalary || 0) * 0.15);
      const transportAllowance = round3((duty.totalSalary || 0) * 0.1);
      const medicalAllowance = round3((duty.totalSalary || 0) * 0.05);
      const grossSalary = round3(basicSalary + housingAllowance + transportAllowance + medicalAllowance);
      payslip = {
        id: slipId,
        payslipNumber: `PAY/${period.replace('-', '/')}/HOL`,
        employeeId: duty.employeeId,
        employeeName: duty.employeeName,
        civilId: duty.civilId || '',
        jobTitle: duty.jobTitle || 'موظف',
        department: duty.department || 'الإدارة العامة',
        bankName: 'بنك الكويت الوطني (NBK)',
        iban: '',
        period,
        basicSalary,
        housingAllowance,
        transportAllowance,
        medicalAllowance,
        overtimeHours: 0,
        overtimeAmount: 0,
        bonusAmount: bonusAdd,
        absenceDays: 0,
        absenceDeduction: 0,
        delayMinutes: 0,
        delayDeduction: 0,
        loanDeduction: 0,
        pifssDeduction: 0,
        grossSalary,
        totalDeductions: 0,
        netSalary: round3(grossSalary + bonusAdd),
        status: 'draft',
        notes: `بدل عطلة رسمية: ${duty.holidayName} (${duty.dutyDate}) — مادة 68`,
        companyId,
        createdAt: new Date().toISOString(),
      };
    }

    await setDoc(doc(db, 'payslips', slipId), cleanFirestoreData(payslip), { merge: true });

    await persistHolidayDutyRecord(
      { ...duty, status: 'settled', settledAt },
      companyId
    );

    return {
      success: true,
      message: `تم ترحيل بدل العطلة (+${bonusAdd.toFixed(3)} د.ك) إلى مسير ${period} بنجاح`,
      payslipId: slipId,
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'فشل ترحيل بدل العطلة للرواتب' };
  }
}

