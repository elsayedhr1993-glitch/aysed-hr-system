import React, { useState, useRef, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy, computeAttendanceAndOvertime, AttendanceLog } from '../context/OdooHierarchyContext';
import { getDepartmentColorStyle } from '../utils/odooPalette';
import { toast } from 'react-hot-toast';

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
  method: 'دستور بيومتري (Device)' | 'تطبيق جوال (GPS)' | 'كشك الحضور (Kiosk)' | 'استيراد شيت (Excel)';
  status: 'present' | 'late' | 'single_punch' | 'absent' | 'overtime';
  sourceFile?: string;
}

export const Attendances: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees, attendance, recordAttendanceTimes } = useOdooHierarchy();

  // State Management
  const [activeView, setActiveView] = useState<'table' | 'kiosk' | 'analytics'>('table');
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

  // Manual Add Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualRecord, setManualRecord] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:00',
    checkOut: '16:00',
    method: 'دستور بيومتري (Device)' as const
  });

  // Kiosk Mode State
  const [kioskStep, setKioskStep] = useState<'grid' | 'pin' | 'success'>('grid');
  const [kioskSelectedEmp, setKioskSelectedEmp] = useState<any | null>(null);
  const [kioskPin, setKioskPin] = useState('');
  const [kioskAction, setKioskAction] = useState<'in' | 'out'>('in');
  const [kioskGreeting, setKioskGreeting] = useState<{ name: string; time: string; action: string } | null>(null);

  // Seed default table attendance from employees context or local records
  const [customAttendanceRecords, setCustomAttendanceRecords] = useState<AttendanceItem[]>([]);

  // Calculate live rows
  const liveTableData = useMemo(() => {
    // 1. First map from context employees
    const contextRecords: AttendanceItem[] = employees.map(emp => {
      const log = attendance[emp.id];
      // ONLY consider it a valid log if log exists and has a checkIn value
      const hasRealLog = log && log.checkIn;
      
      const empGross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance;
      const expectedIn = emp.shiftStartTime || '08:00';
      const expectedOut = emp.shiftEndTime || '16:00';

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
          shiftStartTime: emp.shiftStartTime,
          shiftEndTime: emp.shiftEndTime,
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
        status
      };
    });

    // Merge with custom or imported ones (avoiding duplicate employee ID for the selected date)
    const combined = [...customAttendanceRecords, ...contextRecords];
    const uniqueMap = new Map<string, AttendanceItem>();
    combined.forEach(item => {
      const key = `${item.employeeId}_${item.date}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    let list = Array.from(uniqueMap.values());

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
  }, [employees, attendance, selectedDate, customAttendanceRecords, searchQuery, selectedDept, selectedStatus]);

  // Departments List
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => set.add(e.department));
    return ['الكل', ...Array.from(set)];
  }, [employees]);

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

        // Parse & Aggregate Pings by Employee ID and Date
        // Supporting ZKTeco, Hikvision, Suprema, and generic CSV formats
        const employeeMap = new Map<string, any>();
        employees.forEach(emp => {
          employeeMap.set(emp.id.toLowerCase(), emp);
          employeeMap.set(emp.civilId, emp);
          // strip prefixes for matching e.g. EMP-001 -> 1
          const numericId = emp.id.replace(/\D/g, '');
          if (numericId) employeeMap.set(numericId, emp);
        });

        // Intermediate aggregation map: key = `${empId}_${date}` -> array of punch times
        const dailyPunches = new Map<string, { empId: string; date: string; punches: string[] }>();

        rawRows.forEach((row) => {
          // Identify Employee ID / Code
          let rawId = row['Employee ID'] || row['Emp No'] || row['رقم الموظف'] || row['الرقم المدني'] || 
                      row['Device ID'] || row['ID'] || row['AC-No.'] || row['User ID'] || row['No'] || 
                      row['كود الموظف'] || row['الكود'] || row['Code'] || row['PIN'] || row['Employee Code'];

          if (!rawId) {
            const key = Object.keys(row).find(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('code') || k.includes('كود') || k.includes('رقم'));
            if (key) rawId = row[key];
          }

          // Identify Date and Time
          let punchDate = selectedDate;
          let punchTime = '';

          const rawDateTime = row['DateTime'] || row['Date/Time'] || row['الوقت والتاريخ'] || row['التاريخ والوقت'] || row['Punch Time'];
          if (rawDateTime) {
            const dt = new Date(rawDateTime);
            if (!isNaN(dt.getTime())) {
              punchDate = dt.toISOString().split('T')[0];
              punchTime = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
          } else {
            const rawD = row['Date'] || row['التاريخ'] || row['يوم'];
            const rawT = row['Time'] || row['الوقت'] || row['الساعة'] || row['CheckTime'];
            if (rawD) {
              const parsedD = new Date(rawD);
              if (!isNaN(parsedD.getTime())) punchDate = parsedD.toISOString().split('T')[0];
            }
            if (rawT) {
              punchTime = String(rawT).trim();
            }
          }

          if (!rawId) return;
          const cleanId = String(rawId).trim();

          const key = `${cleanId}_${punchDate}`;
          if (!dailyPunches.has(key)) {
            dailyPunches.set(key, { empId: cleanId, date: punchDate, punches: [] });
          }
          if (punchTime) {
            dailyPunches.get(key)!.punches.push(punchTime);
          }
        });

        // Convert aggregated daily punches to standard AttendanceItem
        const processedItems: AttendanceItem[] = [];
        let matchedCount = 0;
        let unmatchedCount = 0;
        let totalCalculatedHours = 0;

        dailyPunches.forEach((daily) => {
          // Sort punches chronologically
          daily.punches.sort();

          const firstIn = daily.punches[0] || '08:00';
          const lastOut = daily.punches.length > 1 ? daily.punches[daily.punches.length - 1] : (daily.punches.length === 1 ? '' : '16:00');

          // Match with system employee
          const foundEmp = employeeMap.get(daily.empId.toLowerCase()) || 
                           employeeMap.get(daily.empId.replace(/\D/g, '')) || 
                           employees.find(e => e.name.includes(daily.empId));

          const empName = foundEmp ? foundEmp.name : `موظف كود: ${daily.empId}`;
          const empDept = foundEmp ? foundEmp.department : 'غير محدد';
          const empTitle = foundEmp ? foundEmp.jobTitle : 'كادر مسجل بالبصمة';
          const standardHours = foundEmp?.dailyHours || 8;

          if (foundEmp) matchedCount++;
          else unmatchedCount++;

          // Compute Hours & Lateness using unified logic
          let workHours = 0;
          let lateMinutes = 0;
          let overtimeHours = 0;
          let status: AttendanceItem['status'] = 'present';

          if (firstIn && lastOut && typeof firstIn === 'string' && typeof lastOut === 'string') {
            const empGross = foundEmp ? (foundEmp.basicSalary + foundEmp.housingAllowance + foundEmp.transportAllowance) : 350;
            const calc = computeAttendanceAndOvertime(firstIn, lastOut, empGross, false, foundEmp ? {
              dailyHours: foundEmp.dailyHours,
              shiftStartTime: foundEmp.shiftStartTime,
              shiftEndTime: foundEmp.shiftEndTime,
              gracePeriodMinutes: foundEmp.gracePeriodMinutes,
              employmentType: foundEmp.employmentType,
              hourlyRate: foundEmp.hourlyRate
            } : undefined);

            workHours = Math.round(calc.actualHours * 10) / 10;
            totalCalculatedHours += workHours;
            lateMinutes = calc.delayMinutes;
            overtimeHours = calc.overtimeHours;
            
            if (lateMinutes > 0) status = 'late';
            if (overtimeHours > 0 && lateMinutes === 0) status = 'overtime';
          } else if (firstIn && !lastOut) {
            status = 'single_punch';
            workHours = 4.0; // Half day penalty
            totalCalculatedHours += workHours;
          } else {
            status = 'absent';
          }

          processedItems.push({
            id: `IMP-${daily.empId}-${daily.date}`,
            employeeId: foundEmp ? foundEmp.id : daily.empId,
            employeeName: empName,
            department: empDept,
            jobTitle: empTitle,
            date: daily.date,
            checkIn: firstIn,
            checkOut: lastOut || 'لم يتم التبصيم',
            workHours,
            standardHours,
            lateMinutes,
            overtimeHours,
            method: 'استيراد شيت (Excel)',
            status,
            sourceFile: file.name
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

  // Commit Imported Records to Live Table
  const handleCommitImport = () => {
    if (importedLogs.length === 0) return;

    // Apply to local attendance records
    setCustomAttendanceRecords(prev => [...importedLogs, ...prev]);

    // Also update context if matched
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

  // Handle Kiosk PIN Submission
  const handleKioskPunch = () => {
    if (!kioskSelectedEmp) return;

    // Validate PIN
    if (kioskSelectedEmp.pinCode && kioskPin !== kioskSelectedEmp.pinCode) {
      toast.error('الرمز السري غير صحيح');
      setKioskPin('');
      return;
    }

    const timeNow = new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const actionLabel = kioskAction === 'in' ? 'تسجيل حضور (Check-In)' : 'تسجيل انصراف (Check-Out)';

    // Check previous attendance for today to avoid overwriting or hardcoding checkIn
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

    // Update state
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
      status: status
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
    }, 3000);
  };

  // Export Table to Excel
  const handleExportExcel = () => {
    const exportData = liveTableData.map(r => ({
      'كود الموظف': r.employeeId,
      'اسم الموظف': r.employeeName,
      'القسم': r.department,
      'المسمى الوظيفي': r.jobTitle || '',
      'التاريخ': r.date,
      'وقت الحضور': r.checkIn,
      'وقت الانصراف': r.checkOut,
      'الساعات الفعلية': r.workHours,
      'دقائق التأخير': r.lateMinutes,
      'ساعات إضافية': r.overtimeHours,
      'طريقة التبصيم': r.method,
      'الحالة': r.status === 'present' ? 'حاضر' : r.status === 'late' ? 'متأخر' : r.status === 'overtime' ? 'إضافي' : 'بصمة واحدة'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجلات_الحضور');
    XLSX.writeFile(wb, `Attendance_Sheet_${selectedDate}.xlsx`);
    toast.success('تم تصدير كشف الحضور بنجاح');
  };

  return (
    <div className="space-y-4 font-sans dir-rtl text-right text-slate-800 animate-fadeIn" dir="rtl">
      
      {/* 1. Header Toolbar & Odoo App Control */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title & Stats */}
        <div className="flex items-center gap-3 w-full md:w-auto">
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

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-end">
          
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
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Upload size={14} />
            <span>{isProcessingFile ? 'جاري القراءة...' : '📂 استيراد شيت البصمة'}</span>
          </button>

          {/* Kiosk Mode Toggle */}
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'kiosk' ? 'table' : 'kiosk')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeView === 'kiosk' 
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ScanLine size={14} />
            <span>{activeView === 'kiosk' ? 'الرجوع للجدول' : 'وضع الكشك (Kiosk)'}</span>
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="تصدير إلى Excel"
          >
            <Download size={14} />
            <span className="hidden sm:inline">تصدير</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={() => safePrintAction('تقرير الحضور والانصراف')}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="طباعة التقرير"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">طباعة</span>
          </button>
        </div>
      </div>

      {/* 2. Top Smart Stat Widgets */}
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
            <div className="text-[11px] text-slate-400 font-bold">نسبة الالتزام بالبصمة</div>
            <div className="text-lg font-mono font-black text-[#714B67] mt-0.5">
              {employees.length > 0 ? Math.round((liveTableData.filter(r => r.status !== 'absent').length / employees.length) * 100) : 100}%
            </div>
          </div>
          <div className="p-2.5 bg-purple-50 text-[#714B67] rounded-xl">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* 3. Main View Switcher: Full Table OR Kiosk Mode */}
      {activeView === 'kiosk' ? (
        /* KIOSK MODE VIEW (FULL SCREEN KIOSK) */
        <div className="bg-gradient-to-br from-slate-900 via-[#3a2233] to-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl min-h-[520px] flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Header of Kiosk */}
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

          {/* Step 2: PIN Pad / Action Confirmation */}
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

              {/* Action Switcher: In / Out */}
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

              {/* PIN Code Circles */}
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

              {/* Numeric Keypad */}
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
      ) : (
        /* FULL-WIDTH ATTENDANCE TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden w-full">
          
          {/* Table Filters Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
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

            {/* Department, Status & Date Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              
              {/* Date Selector */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <Calendar size={13} className="text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="outline-none text-slate-700 font-mono font-bold text-xs bg-transparent"
                />
              </div>

              {/* Department Selector */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#714B67]"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Status Selector */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#714B67]"
              >
                <option value="all">كافة الحالات</option>
                <option value="present">حاضر ملتزم</option>
                <option value="late">تأخير صباحي</option>
                <option value="overtime">عمل إضافي</option>
                <option value="single_punch">بصمة واحدة</option>
                <option value="absent">لم يسجل حضور / غياب</option>
              </select>
            </div>
          </div>

          {/* Full Width Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3.5 pr-4 whitespace-nowrap">الموظف والكود</th>
                  <th className="p-3.5 whitespace-nowrap">القسم والإدارة</th>
                  <th className="p-3.5 whitespace-nowrap text-center">وقت الحضور</th>
                  <th className="p-3.5 whitespace-nowrap text-center">وقت الانصراف</th>
                  <th className="p-3.5 whitespace-nowrap text-center">الساعات الفعلية</th>
                  <th className="p-3.5 whitespace-nowrap text-center">ساعات إضافية (OT)</th>
                  <th className="p-3.5 whitespace-nowrap text-center">التأخير الصباحي</th>
                  <th className="p-3.5 whitespace-nowrap">طريقة التبصيم</th>
                  <th className="p-3.5 pl-4 whitespace-nowrap text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveTableData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      <Fingerprint className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                      <div>لا توجد سجلات حضور مطابقة لمعايير البحث</div>
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

                        {/* Department Badge */}
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-md font-bold border ${deptStyle.badgeBg}`}>
                            <span>{deptStyle.icon}</span>
                            <span>{row.department}</span>
                          </span>
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
                          {row.lateMinutes > 0 ? (
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
                        <td className="p-3.5 pl-4 text-center">
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
                              <span>لم يسجل حضور / غياب</span>
                            </span>
                          )}
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

      {/* 4. EXCEL IMPORT PREVIEW MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
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

            {/* Summary Strip */}
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

            {/* Preview Table */}
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

            {/* Modal Actions */}
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

    </div>
  );
};

export default Attendances;
