// src/services/holidayWorkService.ts
import { db } from '../lib/firebase';
import { collection, setDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from '../utils/persistentStorage';
import { HrLeaveAllocation } from '../types';

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

  if (companyId) {
    return all.filter(r => !r.companyId || r.companyId === companyId);
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

        const allocSnap = await getDocs(collection(db, 'allocations'));
        for (const d of allocSnap.docs) {
          const data = d.data() as any;
          const isTargetAlloc = data.id?.includes(recordId) || 
                                (targetRecord?.id && data.id?.includes(targetRecord.id)) ||
                                (targetEmpId && data.employeeId === targetEmpId && targetDate && data.dateFrom === targetDate);
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
        await setDoc(doc(db, 'allocations', allocId), createdAlloc as any);
      }
    } catch (fe) {
      console.warn('[HolidayWorkService] Firestore allocation sync notice:', fe);
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


