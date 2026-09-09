import React, { useState, useRef, useMemo, useEffect } from 'react';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { 
  Fingerprint, 
  Clock, 
  UserCheck, 
  UserX, 
  Search, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  AlertTriangle, 
  ScanLine, 
  Printer, 
  Upload, 
  FileSpreadsheet, 
  PlusCircle, 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  X, 
  Calendar, 
  KeyRound, 
  Download, 
  Trash2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Edit3,
  CheckSquare,
  FileCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy, computeAttendanceAndOvertime, AttendanceLog } from '../context/OdooHierarchyContext';
import { getDepartmentColorStyle } from '../utils/odooPalette';
import { toast } from 'react-hot-toast';
import { ManualAttendanceModal, ManualPunchPayload } from './attendance/ManualAttendanceModal';
import { SinglePunchResolutionModal } from './attendance/SinglePunchResolutionModal';
import { MonthlyAttendanceSummary } from './attendance/MonthlyAttendanceSummary';
import { OfficialAttendancePrintModal } from './attendance/OfficialAttendancePrintModal';
import { DynamicQrKioskModal } from './DynamicQrKioskModal';
import { BiometricDevicesModal } from './attendance/BiometricDevicesModal';
import { AttendanceSetupWizardModal, getAttendanceMasterPolicy, AttendancePolicyData } from './attendance/AttendanceSetupWizardModal';

export interface AttendanceItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle?: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: number;
  standardHours: number;
  lateMinutes: number;
  overtimeHours: number;
  method: 'دستور بيومتري (Device)' | 'تطبيق جوال (GPS)' | 'كشك الحضور (Kiosk)' | 'استيراد شيت (Excel)' | 'تسجيل يدوي (Manual)' | 'رمز QR ديناميكي';
  status: 'present' | 'late' | 'single_punch' | 'absent' | 'overtime';
  sourceFile?: string;
  isExcused?: boolean;
  excuseReason?: string;
  notes?: string;
  shiftInfo?: {
    name: string;
    startTime: string;
    endTime: string;
    isOff?: boolean;
    color: string;
  };
}

export const Attendances: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees, attendance, recordAttendanceTimes } = useOdooHierarchy();
  const activeCompId = activeCompany?.id || 'default_comp';

  // Navigation View State
  const [activeView, setActiveView] = useState<'table' | 'monthly' | 'kiosk'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Excel / CSV Importer State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedLogs, setImportedLogs] = useState<AttendanceItem[]>([]);
  const [importSummary, setImportSummary] = useState<{ total: number; matched: number; unmatched: number; totalHours: number } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Punch Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingManualRecord, setEditingManualRecord] = useState<Partial<ManualPunchPayload> | null>(null);

  // Single Punch Resolution Modal State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingRecord, setResolvingRecord] = useState<AttendanceItem | null>(null);

  // Dynamic QR Kiosk Modal State
  const [isQrKioskOpen, setIsQrKioskOpen] = useState(false);

  // Biometric Devices Integration Hub State
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  // Attendance Setup Policy Wizard State
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [attendancePolicy, setAttendancePolicy] = useState<AttendancePolicyData>(() => getAttendanceMasterPolicy());

  useEffect(() => {
    const handlePolicyUpdated = () => {
      setAttendancePolicy(getAttendanceMasterPolicy());
    };
    window.addEventListener('attendance_policy_updated', handlePolicyUpdated);
    return () => window.removeEventListener('attendance_policy_updated', handlePolicyUpdated);
  }, []);

  // Official Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalData, setPrintModalData] = useState<any>(null);

  // Kiosk Mode State
  const [kioskStep, setKioskStep] = useState<'grid' | 'pin' | 'success'>('grid');
  const [kioskSelectedEmp, setKioskSelectedEmp] = useState<any | null>(null);
  const [kioskPin, setKioskPin] = useState('');
  const [kioskAction, setKioskAction] = useState<'in' | 'out'>('in');
  const [kioskGreeting, setKioskGreeting] = useState<{ name: string; time: string; action: string } | null>(null);

  // Persistent Custom / Manual / Imported Records
  const storageKey = `odoo_attendances_records_v3_${activeCompId}`;
  const [customAttendanceRecords, setCustomAttendanceRecords] = useState<AttendanceItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Save custom records on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(customAttendanceRecords));
    } catch (e) {
      console.error(e);
    }
  }, [customAttendanceRecords, storageKey]);

  // Monthly Posted to Payroll records tracker
  const monthlyPostedKey = `odoo_attendance_posted_months_${activeCompId}`;
  const [postedMonths, setPostedMonths] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(monthlyPostedKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Helper: Read Assigned Shift for an employee on selectedDate from Odoo Planning
  const getEmployeeShiftForDate = (empId: string, dateStr: string) => {
    try {
      const assignedKey = `odoo_assigned_shifts_v2_${activeCompId}`;
      const raw = localStorage.getItem(assignedKey);
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((s: any) => s.employeeId === empId && s.dateStr === dateStr);
        if (found) {
          if (found.templateId === 'off') {
            return { name: 'راحة أسبوعية (OFF)', startTime: '', endTime: '', isOff: true, color: 'bg-slate-100 text-slate-700 border-slate-300' };
          }
          if (found.templateId === 'morning') {
            return { name: 'نوبة صباحية (07:00 - 15:00)', startTime: '07:00', endTime: '15:00', isOff: false, color: 'bg-amber-100 text-amber-800 border-amber-200' };
          }
          if (found.templateId === 'evening') {
            return { name: 'نوبة مسائية (15:00 - 23:00)', startTime: '15:00', endTime: '23:00', isOff: false, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
          }
          if (found.templateId === 'night') {
            return { name: 'نوبة ليلية (23:00 - 07:00)', startTime: '23:00', endTime: '07:00', isOff: false, color: 'bg-purple-100 text-purple-800 border-purple-200' };
          }
        }
      }
    } catch (e) {}
    return null;
  };

  // Calculate live rows
  const liveTableData = useMemo(() => {
    // 1. First map from context employees
    const contextRecords: AttendanceItem[] = employees.map(emp => {
      const log = attendance[emp.id];
      const hasRealLog = log && log.checkIn;
      
      const empGross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance;
      const assignedShift = getEmployeeShiftForDate(emp.id, selectedDate);

      const expectedIn = assignedShift?.startTime || emp.shiftStartTime || '08:00';
      const expectedOut = assignedShift?.endTime || emp.shiftEndTime || '16:00';

      const checkIn = hasRealLog ? (log.checkIn || '') : '';
      const checkOut = hasRealLog ? (log.checkOut || '') : '';
      const isHoliday = log?.isHoliday || false;

      let calc = {
        actualHours: 0,
        overtimeHours: 0,
        delayMinutes: 0
      };

      let status: AttendanceItem['status'] = 'absent';

      if (hasRealLog) {
        const calculated = computeAttendanceAndOvertime(checkIn, checkOut, empGross, isHoliday, {
          dailyHours: emp.dailyHours,
          shiftStartTime: expectedIn,
          shiftEndTime: expectedOut,
          gracePeriodMinutes: emp.gracePeriodMinutes,
          employmentType: emp.employmentType,
          hourlyRate: emp.hourlyRate
        });
        calc = {
          actualHours: calculated.actualHours,
          overtimeHours: calculated.overtimeHours,
          delayMinutes: calculated.delayMinutes
        };

        status = 'present';
        if (calc.delayMinutes > 0) status = 'late';
        if (calc.overtimeHours > 0 && calc.delayMinutes === 0) status = 'overtime';
        if (!checkOut && checkIn) status = 'single_punch';
      }

      return {
        id: `ATT-${emp.id}-${selectedDate}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        jobTitle: emp.jobTitle,
        date: selectedDate,
        checkIn,
        checkOut,
        workHours: Math.round(calc.actualHours * 10) / 10,
        standardHours: emp.dailyHours || 8,
        lateMinutes: calc.delayMinutes,
        overtimeHours: calc.overtimeHours,
        method: 'دستور بيومتري (Device)',
        status,
        shiftInfo: assignedShift || {
          name: `دوام اعتيادي (${expectedIn} - ${expectedOut})`,
          startTime: expectedIn,
          endTime: expectedOut,
          isOff: false,
          color: 'bg-slate-100 text-slate-700 border-slate-200'
        }
      };
    });

    // Merge with custom or imported ones (custom takes precedence for the specific date)
    const combined = [...customAttendanceRecords, ...contextRecords];
    const uniqueMap = new Map<string, AttendanceItem>();
    combined.forEach(item => {
      const key = `${item.employeeId}_${item.date}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    let list = Array.from(uniqueMap.values()).filter(r => r.date === selectedDate);

    // Filters
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }

    if (selectedDept !== 'الكل') {
      list = list.filter(r => r.department === selectedDept);
    }

    if (selectedStatus !== 'all') {
      list = list.filter(r => r.status === selectedStatus);
    }

    return list;
  }, [employees, attendance, selectedDate, customAttendanceRecords, searchQuery, selectedDept, selectedStatus, activeCompId]);

  // Departments List
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => set.add(e.department));
    return ['الكل', ...Array.from(set)];
  }, [employees]);

  // Handle Manual Punch Save
  const handleSaveManualPunch = (payload: ManualPunchPayload) => {
    const emp = employees.find(e => e.id === payload.employeeId);
    if (!emp) return;

    const empGross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance;
    const assignedShift = getEmployeeShiftForDate(emp.id, payload.date);
    const expectedIn = assignedShift?.startTime || emp.shiftStartTime || '08:00';
    const expectedOut = assignedShift?.endTime || emp.shiftEndTime || '16:00';

    const calculated = computeAttendanceAndOvertime(payload.checkIn, payload.checkOut, empGross, false, {
      dailyHours: emp.dailyHours,
      shiftStartTime: expectedIn,
      shiftEndTime: expectedOut,
      gracePeriodMinutes: emp.gracePeriodMinutes,
      employmentType: emp.employmentType,
      hourlyRate: emp.hourlyRate
    });

    // If officially excused, zero out delay minutes
    const effectiveLateMinutes = payload.isExcused ? 0 : calculated.delayMinutes;

    let status: AttendanceItem['status'] = 'present';
    if (effectiveLateMinutes > 0) status = 'late';
    if (calculated.overtimeHours > 0 && effectiveLateMinutes === 0) status = 'overtime';
    if (!payload.checkOut && payload.checkIn) status = 'single_punch';

    const newRecord: AttendanceItem = {
      id: `MANUAL-${payload.employeeId}-${payload.date}-${Date.now()}`,
      employeeId: payload.employeeId,
      employeeName: emp.name,
      department: emp.department,
      jobTitle: emp.jobTitle,
      date: payload.date,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      workHours: Math.round(calculated.actualHours * 10) / 10,
      standardHours: emp.dailyHours || 8,
      lateMinutes: effectiveLateMinutes,
      overtimeHours: calculated.overtimeHours,
      method: payload.method,
      status,
      isExcused: payload.isExcused,
      excuseReason: payload.reason,
      notes: payload.notes,
      shiftInfo: assignedShift || undefined
    };

    setCustomAttendanceRecords(prev => {
      const filtered = prev.filter(r => !(r.employeeId === payload.employeeId && r.date === payload.date));
      return [newRecord, ...filtered];
    });

    // If recording for today, update context
    if (payload.date === selectedDate) {
      recordAttendanceTimes(
        emp.id,
        payload.checkIn,
        payload.checkOut || undefined,
        effectiveLateMinutes,
        calculated.overtimeHours
      );
    }

    toast.success(`تم حفظ واعتماد حركة الحضور اليدوية للموظف ${emp.name}`);
    setIsManualModalOpen(false);
    setEditingManualRecord(null);
  };

  // Handle Single Punch Resolution
  const handleResolveSinglePunch = (recordId: string, resolvedCheckOut: string, reason: string) => {
    const target = liveTableData.find(r => r.id === recordId) || customAttendanceRecords.find(r => r.id === recordId);
    if (!target) return;

    const emp = employees.find(e => e.id === target.employeeId);
    if (!emp) return;

    const empGross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance;
    const calculated = computeAttendanceAndOvertime(target.checkIn, resolvedCheckOut, empGross, false, {
      dailyHours: emp.dailyHours,
      shiftStartTime: emp.shiftStartTime,
      shiftEndTime: emp.shiftEndTime,
      gracePeriodMinutes: emp.gracePeriodMinutes,
      employmentType: emp.employmentType,
      hourlyRate: emp.hourlyRate
    });

    const updatedRecord: AttendanceItem = {
      ...target,
      checkOut: resolvedCheckOut,
      workHours: Math.round(calculated.actualHours * 10) / 10,
      overtimeHours: calculated.overtimeHours,
      status: calculated.overtimeHours > 0 ? 'overtime' : 'present',
      notes: `تم إغلاق البصمة: ${reason}`
    };

    setCustomAttendanceRecords(prev => {
      const filtered = prev.filter(r => !(r.employeeId === target.employeeId && r.date === target.date));
      return [updatedRecord, ...filtered];
    });

    recordAttendanceTimes(
      emp.id,
      target.checkIn,
      resolvedCheckOut,
      target.lateMinutes,
      calculated.overtimeHours
    );

    toast.success(`تم إغلاق وتصحيح بصمة الانصراف للموظف ${target.employeeName} بنجاح`);
    setIsResolveModalOpen(false);
    setResolvingRecord(null);
  };

  // Quick Official Excuse Toggle
  const handleToggleExcuse = (record: AttendanceItem) => {
    const isNowExcused = !record.isExcused;
    const updated: AttendanceItem = {
      ...record,
      isExcused: isNowExcused,
      excuseReason: isNowExcused ? 'إذن رسمي معتمد من الإدارة' : undefined,
      lateMinutes: isNowExcused ? 0 : (record.lateMinutes || 15)
    };

    setCustomAttendanceRecords(prev => {
      const filtered = prev.filter(r => !(r.employeeId === record.employeeId && r.date === record.date));
      return [updated, ...filtered];
    });

    recordAttendanceTimes(
      record.employeeId,
      record.checkIn,
      record.checkOut,
      isNowExcused ? 0 : record.lateMinutes,
      record.overtimeHours
    );

    if (isNowExcused) {
      toast.success(`تم إسقاط التأخير ومنح إذن رسمي للموظف ${record.employeeName}`);
    } else {
      toast('تم إلغاء الإذن الرسمي وإعادة احتساب التأخير');
    }
  };

  // Handle Monthly Post to Payroll (WPS)
  const handlePostToPayroll = (monthKey: string, summaryList: any[]) => {
    try {
      const updatedPosted = { ...postedMonths, [monthKey]: true };
      setPostedMonths(updatedPosted);
      localStorage.setItem(monthlyPostedKey, JSON.stringify(updatedPosted));

      // Push latest figures to Odoo Hierarchy Context for payslip computations
      summaryList.forEach(item => {
        recordAttendanceTimes(
          item.employeeId,
          '08:00',
          '16:00',
          item.lateMinutes,
          item.overtimeHours
        );
      });

      toast.success(`تم بنجاح ترحيل واعتماد كشف الحضور والخصومات والإضافي لشهر (${monthKey}) إلى مسير الرواتب ونظام WPS!`);
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء ترحيل الكشف للرواتب');
    }
  };

  // Handle Excel/CSV File Upload & Aggregation Engine
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          toast.error('الملف فارغ أو لا يحتوي على صفوف بيانات صالحة');
          setIsProcessingFile(false);
          return;
        }

        const employeeMap = new Map<string, any>();
        employees.forEach(emp => {
          employeeMap.set(emp.id.toLowerCase(), emp);
          employeeMap.set(emp.civilId, emp);
          const numericId = emp.id.replace(/\D/g, '');
          if (numericId) employeeMap.set(numericId, emp);
        });

        const dailyPunches = new Map<string, { empId: string; date: string; punches: string[] }>();

        rawRows.forEach((row) => {
          let rawId = row['Employee ID'] || row['Emp No'] || row['رقم الموظف'] || row['الرقم المدني'] || 
                      row['Device ID'] || row['ID'] || row['AC-No.'] || row['User ID'] || row['No'] || 
                      row['كود الموظف'] || row['الكود'] || row['Code'] || row['PIN'] || row['Employee Code'];

          if (!rawId) {
            const key = Object.keys(row).find(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('code') || k.includes('كود') || k.includes('رقم'));
            if (key) rawId = row[key];
          }

          let punchDate = selectedDate;
          let punchTime = '';

          const rawDateTime = row['DateTime'] || row['Date/Time'] || row['الوقت والتاريخ'] || row['التاريخ والوقت'] || row['Punch Time'];
          if (rawDateTime) {
            const dt = new Date(rawDateTime);
            if (!isNaN(dt.getTime())) {
              punchDate = dt.toISOString().split('T')[0];
              punchTime = dt.toTimeString().slice(0, 5);
            } else {
              const parts = String(rawDateTime).trim().split(/\s+/);
              if (parts.length >= 2) {
                punchDate = parts[0];
                punchTime = parts[1].slice(0, 5);
              }
            }
          } else {
            const rawTime = row['Time'] || row['الوقت'] || row['ساعة البصمة'] || row['Clock'];
            const rawD = row['Date'] || row['التاريخ'] || row['اليوم'];
            if (rawD) punchDate = String(rawD).slice(0, 10);
            if (rawTime) punchTime = String(rawTime).slice(0, 5);
          }

          if (rawId && punchTime) {
            const cleanId = String(rawId).trim();
            const groupKey = `${cleanId}_${punchDate}`;
            if (!dailyPunches.has(groupKey)) {
              dailyPunches.set(groupKey, { empId: cleanId, date: punchDate, punches: [] });
            }
            dailyPunches.get(groupKey)!.punches.push(punchTime);
          }
        });

        const processedItems: AttendanceItem[] = [];
        let matchedCount = 0;
        let unmatchedCount = 0;
        let totalCalculatedHours = 0;

        dailyPunches.forEach(({ empId, date: pDate, punches }, key) => {
          punches.sort();
          const firstPunch = punches[0];
          const lastPunch = punches.length > 1 ? punches[punches.length - 1] : '';

          const emp = employeeMap.get(empId.toLowerCase()) || employeeMap.get(empId);

          if (emp) matchedCount++;
          else unmatchedCount++;

          const empName = emp ? emp.name : `موظف كود (${empId})`;
          const dept = emp ? emp.department : 'غير محدد';
          const grossSalary = emp ? (emp.basicSalary + emp.housingAllowance + emp.transportAllowance) : 1000;
          const standardDailyHours = emp?.dailyHours || 8;

          const assignedShift = emp ? getEmployeeShiftForDate(emp.id, pDate) : null;
          const expectedIn = assignedShift?.startTime || emp?.shiftStartTime || '08:00';
          const expectedOut = assignedShift?.endTime || emp?.shiftEndTime || '16:00';

          const calc = computeAttendanceAndOvertime(firstPunch, lastPunch || firstPunch, grossSalary, false, {
            dailyHours: standardDailyHours,
            shiftStartTime: expectedIn,
            shiftEndTime: expectedOut,
            gracePeriodMinutes: emp?.gracePeriodMinutes || 15,
            employmentType: emp?.employmentType || 'full_time',
            hourlyRate: emp?.hourlyRate
          });

          const actualHrs = lastPunch ? Math.round(calc.actualHours * 10) / 10 : 0;
          totalCalculatedHours += actualHrs;

          let status: AttendanceItem['status'] = 'present';
          if (!lastPunch) status = 'single_punch';
          else if (calc.delayMinutes > 0) status = 'late';
          else if (calc.overtimeHours > 0) status = 'overtime';

          processedItems.push({
            id: `IMP-${empId}-${pDate}-${Date.now()}`,
            employeeId: emp ? emp.id : empId,
            employeeName: empName,
            department: dept,
            jobTitle: emp?.jobTitle || '',
            date: pDate,
            checkIn: firstPunch,
            checkOut: lastPunch || 'لم يتم التبصيم',
            workHours: actualHrs,
            standardHours: standardDailyHours,
            lateMinutes: calc.delayMinutes,
            overtimeHours: calc.overtimeHours,
            method: 'استيراد شيت (Excel)',
            status,
            sourceFile: file.name,
            shiftInfo: assignedShift || undefined
          });
        });

        setImportedLogs(processedItems);
        setImportSummary({
          total: processedItems.length,
          matched: matchedCount,
          unmatched: unmatchedCount,
          totalHours: Math.round(totalCalculatedHours)
        });
        setIsImportModalOpen(true);
        toast.success(`تمت معالجة شيت البصمة (${processedItems.length} حركة مجمعة)`);
      } catch (err: any) {
        console.error(err);
        toast.error('حدث خطأ أثناء قراءة ملف البصمة. تأكد من صحة تنسيق الملف.');
      } finally {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Commit Imported Records
  const handleCommitImport = () => {
    if (importedLogs.length === 0) return;

    setCustomAttendanceRecords(prev => [...importedLogs, ...prev]);

    importedLogs.forEach(log => {
      const emp = employees.find(e => e.id === log.employeeId);
      if (emp) {
        recordAttendanceTimes(
          emp.id,
          log.checkIn,
          log.checkOut === 'لم يتم التبصيم' ? undefined : log.checkOut,
          log.lateMinutes,
          log.overtimeHours
        );
      }
    });

    toast.success(`تم اعتماد ${importedLogs.length} سجل حضور بنجاح`);
    setIsImportModalOpen(false);
    setImportedLogs([]);
  };

  // Handle Imported Logs from Biometric Devices Hub
  const handleImportFromBiometricHub = (punches: AttendanceItem[]) => {
    if (punches.length === 0) return;
    setCustomAttendanceRecords(prev => [...punches, ...prev]);

    punches.forEach(log => {
      const emp = employees.find(e => e.id === log.employeeId);
      if (emp) {
        recordAttendanceTimes(
          emp.id,
          log.checkIn,
          log.checkOut === 'لم يتم التبصيم' ? undefined : log.checkOut,
          log.lateMinutes,
          log.overtimeHours
        );
      }
    });

    toast.success(`تم استيراد ${punches.length} سجل من مركز أجهزة البصمة بنجاح`);
  };

  // Handle Kiosk PIN Submission
  const handleKioskPunch = () => {
    if (!kioskSelectedEmp) return;

    if (kioskSelectedEmp.pinCode && kioskPin !== kioskSelectedEmp.pinCode) {
      toast.error('الرمز السري غير صحيح');
      setKioskPin('');
      return;
    }

    const timeNow = new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const actionLabel = kioskAction === 'in' ? 'تسجيل حضور (Check-In)' : 'تسجيل انصراف (Check-Out)';

    const empGross = kioskSelectedEmp.basicSalary + kioskSelectedEmp.housingAllowance + kioskSelectedEmp.transportAllowance;
    const log: Partial<AttendanceLog> = attendance[kioskSelectedEmp.id] || {};
    
    let finalCheckIn = kioskAction === 'in' ? timeNow : (log.checkIn || kioskSelectedEmp.shiftStartTime || '08:00');
    let finalCheckOut = kioskAction === 'out' ? timeNow : (log.checkOut || '');

    const calc = computeAttendanceAndOvertime(finalCheckIn, finalCheckOut || timeNow, empGross, false, {
      dailyHours: kioskSelectedEmp.dailyHours,
      shiftStartTime: kioskSelectedEmp.shiftStartTime,
      shiftEndTime: kioskSelectedEmp.shiftEndTime,
      gracePeriodMinutes: kioskSelectedEmp.gracePeriodMinutes,
      employmentType: kioskSelectedEmp.employmentType,
      hourlyRate: kioskSelectedEmp.hourlyRate
    });

    let status: AttendanceItem['status'] = 'present';
    if (calc.delayMinutes > 0) status = 'late';
    if (calc.overtimeHours > 0 && calc.delayMinutes === 0) status = 'overtime';
    if (!finalCheckOut && finalCheckIn) status = 'single_punch';

    const newRecord: AttendanceItem = {
      id: `KIOSK-${kioskSelectedEmp.id}-${Date.now()}`,
      employeeId: kioskSelectedEmp.id,
      employeeName: kioskSelectedEmp.name,
      department: kioskSelectedEmp.department,
      jobTitle: kioskSelectedEmp.jobTitle,
      date: new Date().toISOString().split('T')[0],
      checkIn: finalCheckIn,
      checkOut: finalCheckOut,
      workHours: Math.round(calc.actualHours * 10) / 10,
      standardHours: kioskSelectedEmp.dailyHours || 8,
      lateMinutes: calc.delayMinutes,
      overtimeHours: calc.overtimeHours,
      method: 'كشك الحضور (Kiosk)',
      status
    };

    setCustomAttendanceRecords(prev => {
      const filtered = prev.filter(r => !(r.employeeId === kioskSelectedEmp.id && r.date === newRecord.date));
      return [newRecord, ...filtered];
    });
    
    recordAttendanceTimes(kioskSelectedEmp.id, finalCheckIn, finalCheckOut, calc.delayMinutes, calc.overtimeHours);

    setKioskGreeting({
      name: kioskSelectedEmp.name,
      time: timeNow,
      action: actionLabel
    });
    setKioskStep('success');

    setTimeout(() => {
      setKioskGreeting(null);
      setKioskStep('grid');
      setKioskSelectedEmp(null);
      setKioskPin('');
    }, 2500);
  };

  // Export Daily Table to Excel
  const handleExportDailyExcel = () => {
    const exportData = liveTableData.map(r => ({
      'كود الموظف': r.employeeId,
      'اسم الموظف': r.employeeName,
      'القسم': r.department,
      'المسمى الوظيفي': r.jobTitle || '',
      'نوبة العمل المعتمدة': r.shiftInfo?.name || 'اعتيادي',
      'التاريخ': r.date,
      'وقت الحضور': r.checkIn,
      'وقت الانصراف': r.checkOut,
      'الساعات الفعلية': r.workHours,
      'دقائق التأخير': r.lateMinutes,
      'إذن رسمي معتمد': r.isExcused ? 'نعم (معفي)' : 'لا',
      'ساعات إضافية': r.overtimeHours,
      'طريقة التبصيم': r.method,
      'الحالة': r.status === 'present' ? 'حاضر' : r.status === 'late' ? 'متأخر' : r.status === 'overtime' ? 'إضافي' : 'بصمة واحدة'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجلات_اليوم');
    XLSX.writeFile(wb, `Daily_Attendance_${selectedDate}.xlsx`);
    toast.success('تم تصدير كشف الحضور بنجاح');
  };

  // Open Official Daily Print Modal
  const handleOpenDailyPrintModal = () => {
    setPrintModalData({
      mode: 'daily',
      title: 'كشف بيان الحضور والانصراف اليومي للموظفين',
      dateOrMonth: selectedDate,
      rows: liveTableData
    });
    setIsPrintModalOpen(true);
  };

  // Open Official Monthly Print Modal
  const handleOpenMonthlyPrintModal = (data: any) => {
    setPrintModalData({
      mode: 'monthly',
      title: 'كشف بيان الدوام الشهري ومطابقة مسير الرواتب WPS',
      dateOrMonth: data.month,
      rows: data.data,
      totals: data.totals
    });
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-4 font-sans dir-rtl text-right text-slate-800 animate-fadeIn" dir="rtl">
      
      {/* 1. Header Toolbar & Odoo App Control */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3.5">
        
        {/* Upper Tier: Title & View Switcher Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Title & Organization Info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl flex-shrink-0">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>الحضور والانصراف وتجميع البصمة (Attendances)</span>
                <span className="text-xs bg-[#714B67]/10 text-[#714B67] px-2 py-0.5 rounded-full font-bold">
                  {liveTableData.length} سجل
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | معيار 26 يوم عمل واحتساب التأخير والإضافي
              </p>
            </div>
          </div>

          {/* View Switcher Tabs (Daily / Monthly / Kiosk) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveView('table')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'table' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar size={14} />
              <span>اليومي (Daily)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('monthly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'monthly' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign size={14} />
              <span>الكشف الشهري (WPS)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('kiosk')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'kiosk' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ScanLine size={14} />
              <span>الكشك (Kiosk)</span>
            </button>
          </div>
        </div>

        {/* Lower Tier: Action Buttons with clean spacing and wrapping */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Attendance Policy Setup Wizard Button */}
            <button
              type="button"
              onClick={() => setIsSetupWizardOpen(true)}
              className="bg-blue-900 hover:bg-blue-950 text-white border border-blue-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="تثبيت وتهيئة لائحة وساعات الدوام والانضباط (Attendance Setup Wizard)"
            >
              <Clock size={15} className="text-amber-300" />
              <span>لائحة وساعات الدوام</span>
            </button>

            {/* 📡 Biometric Devices & Cloud Sync Hub */}
            <button
              type="button"
              onClick={() => setIsBiometricModalOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs group active:scale-95 shrink-0"
              title="إدارة وربط أجهزة البصمة ZKTeco و Hikvision والمزامنة السحابية"
            >
              <Fingerprint size={15} className="text-indigo-600 group-hover:scale-110 transition" />
              <span>📡 أجهزة البصمة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {/* Dynamic QR Kiosk Button */}
            <button
              type="button"
              onClick={() => setIsQrKioskOpen(true)}
              className="bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="توليد باركود QR ديناميكي مع النطاق الجغرافي للتبصيم بالهاتف"
            >
              <QrCode size={14} />
              <span>📱 QR الذكي</span>
            </button>

            {/* Manual Attendance Button */}
            <button
              type="button"
              onClick={() => {
                setEditingManualRecord(null);
                setIsManualModalOpen(true);
              }}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <PlusCircle size={14} />
              <span>+ تسجيل يدوي</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* File Importer Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Upload size={14} />
              <span>{isProcessingFile ? 'جاري...' : 'استيراد شيت'}</span>
            </button>

            {/* Export to Excel (Daily) */}
            {activeView === 'table' && (
              <button
                type="button"
                onClick={handleExportDailyExcel}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                title="تصدير إلى Excel"
              >
                <Download size={14} />
                <span>Excel</span>
              </button>
            )}

            {/* Print Daily */}
            {activeView === 'table' && (
              <button
                type="button"
                onClick={handleOpenDailyPrintModal}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                title="طباعة التقرير A4"
              >
                <Printer size={14} />
                <span>طباعة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Smart Stat Widgets (for Daily Table View) */}
      {activeView === 'table' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-bold">إجمالي الحضور اليوم</div>
              <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
                {liveTableData.filter(r => r.status !== 'absent').length} / {employees.length}
              </div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck size={18} />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-bold">التأخير الصباحي</div>
              <div className="text-lg font-mono font-black text-amber-600 mt-0.5">
                {liveTableData.filter(r => r.lateMinutes > 0).length} موظف
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-bold">ساعات العمل الإضافي</div>
              <div className="text-lg font-mono font-black text-blue-600 mt-0.5">
                {liveTableData.reduce((acc, curr) => acc + curr.overtimeHours, 0).toFixed(1)} س
              </div>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-bold">بصمة واحدة ناقصة</div>
              <div className="text-lg font-mono font-black text-rose-600 mt-0.5">
                {liveTableData.filter(r => r.status === 'single_punch').length} موظف
              </div>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle size={18} />
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Views Handling */}

      {/* VIEW A: MONTHLY ACCUMULATIVE SUMMARY */}
      {activeView === 'monthly' && (
        <MonthlyAttendanceSummary
          employees={employees as any}
          attendanceLogs={customAttendanceRecords}
          companyName={activeCompany?.nameAr || 'الشركة'}
          onPostToPayroll={handlePostToPayroll}
          isMonthPosted={Boolean(postedMonths[selectedDate.slice(0, 7)])}
          onOpenPrintModal={handleOpenMonthlyPrintModal}
        />
      )}

      {/* VIEW B: KIOSK MODE */}
      {activeView === 'kiosk' && (
        <div className="bg-gradient-to-br from-slate-900 via-[#3a2233] to-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl min-h-[520px] flex flex-col items-center justify-center relative overflow-hidden">
          
          <div className="text-center mb-8 space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 flex items-center justify-center mx-auto mb-2 border border-white/20">
              <ScanLine className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black">كشك الحضور والانصراف السريع (Odoo Kiosk)</h2>
            <p className="text-xs text-slate-300">
              اختر اسمك أو امسح الباركود، ثم أكد برمز الـ PIN أو بصمة الإصبع
            </p>
          </div>

          {/* Success Notification Greeting Overlay */}
          {kioskGreeting && (
            <div className="bg-emerald-600/95 backdrop-blur-md border border-emerald-400 text-white p-8 rounded-3xl text-center space-y-3 shadow-2xl animate-bounce">
              <CheckCircle2 className="w-14 h-14 mx-auto text-white" />
              <h3 className="text-2xl font-black">أهلاً بك، {kioskGreeting.name}</h3>
              <p className="text-sm font-bold text-emerald-100">{kioskGreeting.action}</p>
              <div className="text-3xl font-mono font-black tracking-widest bg-emerald-700/60 py-2 px-6 rounded-2xl inline-block">
                {kioskGreeting.time}
              </div>
            </div>
          )}

          {/* Step 1: Employee Grid */}
          {!kioskGreeting && kioskStep === 'grid' && (
            <div className="w-full max-w-4xl space-y-4">
              <div className="flex gap-2 max-w-md mx-auto mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن اسمك أو كود الموظف..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 outline-none text-xs focus:bg-white/20 transition"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                {employees
                  .filter(e => e.name.includes(searchQuery) || e.id.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        setKioskSelectedEmp(emp);
                        setKioskStep('pin');
                      }}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-amber-400/50 p-4 rounded-2xl text-right transition cursor-pointer flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#714B67] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 group-hover:scale-105 transition">
                        {emp.name.slice(0, 2)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs truncate group-hover:text-amber-300">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.id}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Step 2: PIN Pad */}
          {!kioskGreeting && kioskStep === 'pin' && kioskSelectedEmp && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl max-w-sm w-full text-center space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <button
                  type="button"
                  onClick={() => { setKioskStep('grid'); setKioskSelectedEmp(null); }}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight size={14} /> رجوع
                </button>
                <div className="font-bold text-sm text-amber-300">{kioskSelectedEmp.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-black/30 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setKioskAction('in')}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    kioskAction === 'in' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تسجيل دخول (In)
                </button>
                <button
                  type="button"
                  onClick={() => setKioskAction('out')}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    kioskAction === 'out' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تسجيل خروج (Out)
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-300">أدخل رمز الـ PIN المكون من 4 أرقام:</div>
                <div className="flex justify-center gap-3 py-2" dir="ltr">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition ${
                        kioskPin.length > i ? 'bg-amber-400 border-amber-400' : 'border-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto" dir="ltr">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === 'C') {
                        setKioskPin('');
                      } else if (key === '✓') {
                        handleKioskPunch();
                      } else if (kioskPin.length < 4) {
                        const newP = kioskPin + key;
                        setKioskPin(newP);
                        if (newP.length === 4) {
                          setTimeout(handleKioskPunch, 200);
                        }
                      }
                    }}
                    className="h-12 rounded-xl bg-white/10 hover:bg-white/20 active:bg-amber-500 font-mono font-bold text-base transition flex items-center justify-center cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW C: FULL-WIDTH ATTENDANCE TABLE VIEW */}
      {activeView === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden w-full">
          
          {/* Table Filters Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الموظف، الكود، أو القسم..."
                className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#714B67]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <Calendar size={13} className="text-[#714B67]" />
                <span className="font-bold text-slate-600">التاريخ:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="outline-none text-slate-700 font-mono font-bold text-xs bg-transparent cursor-pointer"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#714B67]"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#714B67]"
              >
                <option value="all">كافة الحالات</option>
                <option value="present">حاضر ملتزم</option>
                <option value="late">تأخير صباحي</option>
                <option value="overtime">عمل إضافي</option>
                <option value="single_punch">بصمة واحدة ناقصة</option>
                <option value="absent">لم يسجل حضور / غياب</option>
              </select>
            </div>
          </div>

          {/* Full Width Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3.5 pr-4 whitespace-nowrap">الموظف والكود</th>
                  <th className="p-3.5 whitespace-nowrap">القسم والنوبة</th>
                  <th className="p-3.5 whitespace-nowrap text-center">وقت الحضور</th>
                  <th className="p-3.5 whitespace-nowrap text-center">وقت الانصراف</th>
                  <th className="p-3.5 whitespace-nowrap text-center">الساعات الفعلية</th>
                  <th className="p-3.5 whitespace-nowrap text-center">ساعات إضافية (OT)</th>
                  <th className="p-3.5 whitespace-nowrap text-center">التأخير الصباحي</th>
                  <th className="p-3.5 whitespace-nowrap">طريقة التبصيم</th>
                  <th className="p-3.5 whitespace-nowrap text-center">الحالة</th>
                  <th className="p-3.5 pl-4 whitespace-nowrap text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveTableData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      <Fingerprint className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                      <div>لا توجد سجلات حضور مطابقة لمعايير البحث لتاريخ {selectedDate}</div>
                    </td>
                  </tr>
                ) : (
                  liveTableData.map((row, idx) => {
                    const deptStyle = getDepartmentColorStyle(row.department, row.jobTitle);
                    const isZebra = idx % 2 === 1;

                    return (
                      <tr key={row.id} className={`hover:bg-purple-50/40 transition ${isZebra ? 'bg-slate-50/50' : 'bg-white'}`}>
                        
                        {/* Employee & Code */}
                        <td className="p-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#714B67]/10 text-[#714B67] font-black flex items-center justify-center text-xs flex-shrink-0">
                              {row.employeeName.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{row.employeeName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{row.employeeId}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department & Shift Badge */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-md font-bold border ${deptStyle.badgeBg}`}>
                              <span>{deptStyle.icon}</span>
                              <span>{row.department}</span>
                            </span>
                            {row.shiftInfo && (
                              <div className="text-[10px] text-slate-500 font-medium">
                                <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${row.shiftInfo.color}`}>
                                  {row.shiftInfo.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Check-In */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                          {row.checkIn ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                              {row.checkIn}
                            </span>
                          ) : (
                            <span className="text-slate-400">--:--</span>
                          )}
                        </td>

                        {/* Check-Out */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                          {!row.checkIn ? (
                            <span className="text-slate-400">--:--</span>
                          ) : row.checkOut && row.checkOut !== 'لم يتم التبصيم' ? (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                              {row.checkOut}
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-200 text-[10px]">
                              لم يبصم
                            </span>
                          )}
                        </td>

                        {/* Actual Work Hours */}
                        <td className="p-3.5 text-center font-mono font-black text-slate-900">
                          {row.checkIn ? `${row.workHours} س` : <span className="text-slate-400">--:--</span>}
                        </td>

                        {/* Overtime */}
                        <td className="p-3.5 text-center font-mono">
                          {row.overtimeHours > 0 ? (
                            <span className="bg-purple-100 text-[#714B67] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                              +{row.overtimeHours} س
                            </span>
                          ) : (
                            <span className="text-slate-300">0.0</span>
                          )}
                        </td>

                        {/* Morning Delay */}
                        <td className="p-3.5 text-center font-mono">
                          {row.isExcused ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] inline-flex items-center gap-1">
                              <ShieldCheck size={11} />
                              <span>إذن معتمد</span>
                            </span>
                          ) : row.lateMinutes > 0 ? (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                              {row.lateMinutes} دقيقة
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold">0 دقيقة</span>
                          )}
                        </td>

                        {/* Punch Method */}
                        <td className="p-3.5 text-slate-600 text-[11px] font-medium">
                          {row.method}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5 text-center">
                          {row.status === 'present' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>حاضر ملتزم</span>
                            </span>
                          )}
                          {row.status === 'late' && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              <span>متأخر</span>
                            </span>
                          )}
                          {row.status === 'overtime' && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>عمل إضافي</span>
                            </span>
                          )}
                          {row.status === 'single_punch' && (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              <span>بصمة واحدة</span>
                            </span>
                          )}
                          {row.status === 'absent' && (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>لم يسجل حضور</span>
                            </span>
                          )}
                        </td>

                        {/* Row Actions */}
                        <td className="p-3.5 pl-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            
                            {/* Single Punch Quick Resolve Button */}
                            {row.status === 'single_punch' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setResolvingRecord(row);
                                  setIsResolveModalOpen(true);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                                title="إدخال وقت الانصراف لمن نسي التبصيم"
                              >
                                <Edit3 size={11} />
                                <span>إغلاق البصمة</span>
                              </button>
                            )}

                            {/* Official Excuse Button for Late Arrival */}
                            {row.lateMinutes > 0 && (
                              <button
                                type="button"
                                onClick={() => handleToggleExcuse(row)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border flex items-center gap-1 ${
                                  row.isExcused 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                                title={row.isExcused ? 'إلغاء الإذن الرسمي' : 'منح إذن تأخير معتمد يعفي من الخصم'}
                              >
                                <ShieldCheck size={11} className={row.isExcused ? 'text-emerald-600' : 'text-slate-400'} />
                                <span>{row.isExcused ? 'معفي' : 'إذن رسمي'}</span>
                              </button>
                            )}

                            {/* Edit / Manual Add Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingManualRecord({
                                  employeeId: row.employeeId,
                                  date: row.date,
                                  checkIn: row.checkIn || '08:00',
                                  checkOut: row.checkOut && row.checkOut !== 'لم يتم التبصيم' ? row.checkOut : '16:00',
                                  isExcused: row.isExcused
                                });
                                setIsManualModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-[#714B67] hover:bg-purple-50 rounded-md transition cursor-pointer"
                              title="تعديل السجل يدوياً"
                            >
                              <Edit3 size={13} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div>
              عرض <strong>{liveTableData.length}</strong> حركة حضور يومية ليوم <strong>{selectedDate}</strong>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span>إجمالي الساعات: <strong>{liveTableData.reduce((acc, c) => acc + c.workHours, 0).toFixed(1)} س</strong></span>
              <span>إجمالي الإضافي: <strong>{liveTableData.reduce((acc, c) => acc + c.overtimeHours, 0).toFixed(1)} س</strong></span>
            </div>
          </div>

        </div>
      )}

      {/* 4. MANUAL ATTENDANCE MODAL */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditingManualRecord(null);
        }}
        employees={employees as any}
        selectedDate={selectedDate}
        onSave={handleSaveManualPunch}
        initialData={editingManualRecord}
      />

      {/* 5. SINGLE PUNCH RESOLUTION MODAL */}
      <SinglePunchResolutionModal
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setResolvingRecord(null);
        }}
        record={resolvingRecord}
        onResolve={handleResolveSinglePunch}
      />

      {/* 6. DYNAMIC QR KIOSK MODAL */}
      {isQrKioskOpen && (
        <DynamicQrKioskModal
          isOpen={isQrKioskOpen}
          onClose={() => setIsQrKioskOpen(false)}
          activeCompany={activeCompany as any}
          employees={employees as any}
          attendance={liveTableData as any}
          onAddAttendance={(rec) => {
            const newAtt: AttendanceItem = {
              id: `QR-${rec.employeeId}-${Date.now()}`,
              employeeId: rec.employeeId,
              employeeName: employees.find(e => e.id === rec.employeeId)?.name || rec.employeeId,
              department: employees.find(e => e.id === rec.employeeId)?.department || 'العموم',
              date: rec.date || new Date().toISOString().split('T')[0],
              checkIn: rec.checkIn || '08:00',
              checkOut: rec.checkOut || '',
              workHours: rec.workHours || 8,
              standardHours: 8,
              lateMinutes: rec.latenessMinutes || 0,
              overtimeHours: rec.overtimeHours || 0,
              method: 'رمز QR ديناميكي',
              status: rec.status === 'PRESENT' ? 'present' : 'late'
            };
            setCustomAttendanceRecords(prev => [newAtt, ...prev]);
            recordAttendanceTimes(rec.employeeId, newAtt.checkIn, newAtt.checkOut, newAtt.lateMinutes, newAtt.overtimeHours);
            toast.success(`تم تسجيل بصمة QR للموظف بنجاح`);
          }}
        />
      )}

      {/* 7. OFFICIAL PRINT REPORT MODAL */}
      <OfficialAttendancePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        company={activeCompany as any}
        reportData={printModalData}
      />

      {/* 8. EXCEL IMPORT PREVIEW MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
            
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-[#714B67] rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">معاينة شيت البصمة المرفوع وتجميع الحركات</h3>
                  <p className="text-xs text-slate-500">
                    تم تجميع حركات الدخول والخروج لنفس اليوم وحساب الساعات والتأخير تلقائياً
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {importSummary && (
              <div className="grid grid-cols-4 gap-2 p-4 bg-purple-50/50 border-b border-purple-100 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-purple-100 shadow-2xs">
                  <div className="text-slate-400">إجمالي الحركات</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{importSummary.total}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="text-emerald-600">موظفون مسجلون</div>
                  <div className="font-mono font-bold text-emerald-700 text-sm">{importSummary.matched}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-amber-100 shadow-2xs">
                  <div className="text-amber-600">أكواد غير مسجلة</div>
                  <div className="font-mono font-bold text-amber-700 text-sm">{importSummary.unmatched}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-2xs">
                  <div className="text-blue-600">إجمالي الساعات</div>
                  <div className="font-mono font-bold text-blue-700 text-sm">{importSummary.totalHours} س</div>
                </div>
              </div>
            )}

            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b">
                    <th className="p-2.5">الموظف / الكود</th>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5 text-center">أول حضور (In)</th>
                    <th className="p-2.5 text-center">آخر انصراف (Out)</th>
                    <th className="p-2.5 text-center">الساعات</th>
                    <th className="p-2.5 text-center">التأخير</th>
                    <th className="p-2.5 text-center">الإضافي</th>
                    <th className="p-2.5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-800">
                        <div>{log.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.employeeId}</div>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{log.date}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{log.checkIn}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-700">{log.checkOut}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900">{log.workHours} س</td>
                      <td className="p-2.5 text-center font-mono text-amber-700">
                        {log.lateMinutes > 0 ? `${log.lateMinutes} د` : '-'}
                      </td>
                      <td className="p-2.5 text-center font-mono text-purple-700">
                        {log.overtimeHours > 0 ? `+${log.overtimeHours} س` : '-'}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'late' ? 'bg-amber-100 text-amber-800' :
                          log.status === 'overtime' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status === 'present' ? 'حاضر' : log.status === 'late' ? 'تأخير' : log.status === 'overtime' ? 'إضافي' : 'بصمة واحدة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleCommitImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check size={15} />
                <span>اعتماد وحفظ السجلات في النظام ({importedLogs.length})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📡 Biometric Devices & Cloud Sync Modal */}
      <BiometricDevicesModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onImportPunches={handleImportFromBiometricHub}
      />

      {/* ⚙️ Attendance Setup Policy Wizard Modal */}
      <AttendanceSetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
      />

    </div>
  );
};

export default Attendances;
