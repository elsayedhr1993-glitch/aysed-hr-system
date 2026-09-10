import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  ShieldAlert, 
  BadgePercent, 
  Landmark, 
  Calculator,
  Calendar,
  DollarSign,
  Briefcase,
  Building2,
  Printer,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Save,
  Trash2,
  Sliders,
  Sparkles,
  Zap,
  Timer,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { useOdooHierarchy, EmployeeContract } from '../context/OdooHierarchyContext';
import { useCompany } from '../context/CompanyContext';
import { TenantDatabaseService } from '../services/tenantDataService';
import { OdooChatter, ChatterMessage } from './OdooChatter';
import { toast } from 'react-hot-toast';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel } from '../utils/exportUtils';
import { exportElementToPdf } from '../utils/printUtils';
import { tafqeet } from '../utils/tafqeet';
import { triggerContractRunningLeaveAllocation } from '../utils/contractLeaveTrigger';
import { FileSpreadsheet } from 'lucide-react';

export interface DetailedContract extends EmployeeContract {
  contractRef: string;
  medicalAllowance: number;
  startDate: string;
  endDate?: string;
  contractType: 'fixed' | 'unlimited';
  probationDays: number;
  noticePeriodMonths: number;
  workingHoursWeekly: number;
  notes?: string;
}

export const OdooContractsApp: React.FC = () => {
  const { employees, updateContractSalary, updateContractDetails } = useOdooHierarchy();
  const { activeCompany, activeCompanyId } = useCompany();
  const currentCompanyId = activeCompanyId || activeCompany?.id || 'comp-super-admin';

  const [dbEmployees, setDbEmployees] = useState<EmployeeContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'draft' | 'expired'>('all');
  const [filterEmploymentType, setFilterEmploymentType] = useState<'all' | 'full_time' | 'part_time'>('all');
  const [printableContract, setPrintableContract] = useState<DetailedContract | null>(null);
  const [isExportingContractPdf, setIsExportingContractPdf] = useState(false);
  const contractPrintRef = useRef<HTMLDivElement>(null);
  
  // مزامنة الموظفين والعقود حياً من قاعدة البيانات للشركة النشطة
  useEffect(() => {
    let isMounted = true;
    async function syncData() {
      if (!currentCompanyId) return;
      try {
        const fetchedEmps = await TenantDatabaseService.getEmployeesByTenant(currentCompanyId);
        if (isMounted && fetchedEmps) {
          const mapped: EmployeeContract[] = fetchedEmps.map(emp => ({
            id: emp.id,
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
          setDbEmployees(mapped);
        }

        const fetchedContracts = await TenantDatabaseService.getContractsByTenant(currentCompanyId);
        if (isMounted) {
          if (fetchedContracts && fetchedContracts.length > 0) {
            const mappedContracts: DetailedContract[] = fetchedContracts.map((c: any) => ({
              id: c.employeeId || c.id,
              contractRef: c.id || `CONTRACT-${c.employeeId}`,
              name: c.employeeName || c.name || 'موظف',
              civilId: c.civilId || '',
              jobTitle: c.jobTitle || 'موظف',
              department: c.department || 'العموم',
              basicSalary: c.basicSalary || 0,
              housingAllowance: c.housingAllowance || 0,
              transportAllowance: c.transportAllowance || 0,
              medicalAllowance: c.otherAllowance || c.medicalAllowance || 0,
              isKuwaiti: Boolean(c.isKuwaiti),
              bankName: c.bankName || 'بيت التمويل الكويتي',
              iban: c.iban || '',
              contractStatus: c.status || 'running',
              startDate: c.startDate || new Date().toISOString().split('T')[0],
              endDate: c.endDate || '',
              contractType: c.contractType || 'fixed',
              probationDays: c.probationDays || 100,
              noticePeriodMonths: c.noticePeriodMonths || 3,
              workingHoursWeekly: c.workingHoursPerWeek || 48,
              employmentType: c.workingSchedule || c.employmentType || 'full_time',
              hasCustomSchedule: c.hasCustomSchedule || false,
              dailyHours: c.customDailyHours || c.dailyWorkHours || 8,
              shiftStartTime: c.shiftStartTime || '08:00',
              shiftEndTime: c.shiftEndTime || '16:00',
              gracePeriodMinutes: c.gracePeriodMinutes || 15,
              hourlyRate: c.hourlyRate || 0
            }));
            setContracts(mappedContracts);
          } else {
            setContracts([]);
          }
        }
      } catch (e) {
        console.error('Error syncing contracts/employees in OdooContractsApp:', e);
      }
    }
    syncData();
    return () => { isMounted = false; };
  }, [currentCompanyId]);

  // القائمة الشاملة المندمجة لموظفي الشركة
  const availableEmployees: EmployeeContract[] = React.useMemo(() => {
    const map = new Map<string, EmployeeContract>();
    dbEmployees.forEach(e => map.set(e.id, e));
    employees.forEach(e => {
      if (!map.has(e.id)) map.set(e.id, e);
    });
    return Array.from(map.values());
  }, [dbEmployees, employees]);

  const [contracts, setContracts] = useState<DetailedContract[]>([]);

  useEffect(() => {
    if (!currentCompanyId) {
      setContracts([]);
      return;
    }
    const key = `odoo_contracts_v1_${currentCompanyId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setContracts(JSON.parse(saved));
      } catch (e) {
        setContracts([]);
      }
    } else {
      setContracts([]);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`odoo_contracts_v1_${currentCompanyId}`, JSON.stringify(contracts));
    }
  }, [contracts, currentCompanyId]);

  const handleDeleteContract = (contractId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا العقد نهائياً من النظام؟')) {
      const updated = contracts.filter(c => c.contractRef !== contractId && c.id !== contractId);
      setContracts(updated);
      alert('تم حذف العقد بنجاح.');
    }
  };

  // Modal / Form Sheet state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<DetailedContract | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showChatter, setShowChatter] = useState(false);
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  // Filtered list
  const filteredContracts = contracts.filter(c => {
    if (!c) return false;
    const term = (searchTerm || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    const id = String(c.id || '').toLowerCase();
    const jobTitle = (c.jobTitle || '').toLowerCase();
    const contractRef = (c.contractRef || '').toLowerCase();
    const civilId = String(c.civilId || '').toLowerCase();

    const matchesSearch = name.includes(term) || 
                          id.includes(term) || 
                          jobTitle.includes(term) ||
                          contractRef.includes(term) ||
                          civilId.includes(term);
    const matchesStatus = filterStatus === 'all' || c.contractStatus === filterStatus;
    const matchesEmpType = filterEmploymentType === 'all' || (c.employmentType || 'full_time') === filterEmploymentType;
    return matchesSearch && matchesStatus && matchesEmpType;
  });

  // Calculate totals
  const totalMonthlyPayroll = contracts.reduce((sum, c) => {
    if (!c) return sum;
    if (c.employmentType === 'part_time') {
      const estimatedMonthlyHours = (c.dailyHours || 4) * 26;
      return sum + (estimatedMonthlyHours * (c.hourlyRate || 0)) + (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0);
    }
    return sum + (c.basicSalary || 0) + (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0);
  }, 0);

  const averageSalary = contracts.length > 0 ? (totalMonthlyPayroll / contracts.length) : 0;
  const runningCount = contracts.filter(c => c && c.contractStatus === 'running').length;
  const draftCount = contracts.filter(c => c && c.contractStatus === 'draft').length;
  const partTimeCount = contracts.filter(c => c && c.employmentType === 'part_time').length;

  // Open Create Form
  const handleOpenCreateContract = () => {
    const maxRefId = contracts.reduce((max, c) => {
      const num = parseInt(c?.contractRef?.split('/').pop() || '0', 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newRef = `CONTRACT/2026/${String(maxRefId + 1).padStart(3, '0')}`;
    const firstEmp = availableEmployees[0] || {
      id: '',
      name: '',
      civilId: '',
      jobTitle: '',
      department: '',
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      isKuwaiti: false,
      bankName: '',
      iban: ''
    };

    const newContract: DetailedContract = {
      id: firstEmp.id,
      contractRef: newRef,
      name: firstEmp.name,
      civilId: firstEmp.civilId,
      jobTitle: firstEmp.jobTitle,
      department: firstEmp.department,
      basicSalary: firstEmp.basicSalary || 800,
      housingAllowance: firstEmp.housingAllowance || 200,
      transportAllowance: firstEmp.transportAllowance || 100,
      medicalAllowance: 0,
      isKuwaiti: firstEmp.isKuwaiti,
      bankName: firstEmp.bankName,
      iban: firstEmp.iban,
      contractStatus: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      contractType: 'fixed',
      probationDays: 100,
      noticePeriodMonths: 3,
      workingHoursWeekly: 48,
      employmentType: 'full_time',
      hasCustomSchedule: false,
      dailyHours: 8,
      shiftStartTime: '08:00',
      shiftEndTime: '16:00',
      gracePeriodMinutes: 15,
      hourlyRate: 0,
      notes: 'عقد عمل جديد يخضع لأحكام قانون العمل الكويتي رقم 6 لسنة 2010'
    };

    setSelectedContract(newContract);
    setIsCreatingNew(true);
    setIsContractModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEditContract = (c: DetailedContract) => {
    setSelectedContract({ 
      ...c,
      employmentType: c.employmentType || 'full_time',
      dailyHours: c.dailyHours !== undefined ? c.dailyHours : 8,
      shiftStartTime: c.shiftStartTime || '08:00',
      shiftEndTime: c.shiftEndTime || '16:00',
      gracePeriodMinutes: c.gracePeriodMinutes !== undefined ? c.gracePeriodMinutes : 15,
      hourlyRate: c.hourlyRate || 0,
      hasCustomSchedule: c.hasCustomSchedule !== undefined ? c.hasCustomSchedule : (c.employmentType === 'part_time')
    });
    setIsCreatingNew(false);
    setIsContractModalOpen(true);
  };

  // Employee Selection auto-sync
  const handleEmployeeSelectionChange = (empId: string) => {
    const emp = availableEmployees.find(e => e.id === empId);
    if (emp && selectedContract) {
      setSelectedContract({
        ...selectedContract,
        id: emp.id,
        name: emp.name,
        civilId: emp.civilId,
        jobTitle: emp.jobTitle,
        department: emp.department,
        basicSalary: emp.basicSalary,
        housingAllowance: emp.housingAllowance,
        transportAllowance: emp.transportAllowance,
        isKuwaiti: emp.isKuwaiti,
        bankName: emp.bankName,
        iban: emp.iban,
        employmentType: emp.employmentType || selectedContract.employmentType || 'full_time',
        hourlyRate: emp.hourlyRate !== undefined ? emp.hourlyRate : selectedContract.hourlyRate,
        dailyHours: emp.dailyHours || selectedContract.dailyHours || 8,
        shiftStartTime: emp.shiftStartTime || selectedContract.shiftStartTime || '08:00',
        shiftEndTime: emp.shiftEndTime || selectedContract.shiftEndTime || '16:00',
        gracePeriodMinutes: emp.gracePeriodMinutes !== undefined ? emp.gracePeriodMinutes : 15
      });
    }
  };

  // Save Contract
  const handleSaveContract = async () => {
    if (!selectedContract) return;

    // Persist to Firestore
    try {
      await TenantDatabaseService.saveContract({
        id: selectedContract.contractRef || `CONTRACT-${selectedContract.id}`,
        companyId: currentCompanyId,
        employeeId: selectedContract.id,
        basicSalary: selectedContract.basicSalary,
        housingAllowance: selectedContract.housingAllowance,
        transportAllowance: selectedContract.transportAllowance,
        otherAllowance: selectedContract.medicalAllowance,
        startDate: selectedContract.startDate,
        endDate: selectedContract.endDate,
        contractType: selectedContract.contractType,
        status: selectedContract.contractStatus,
        customDailyHours: selectedContract.dailyHours,
        workingHoursPerWeek: selectedContract.workingHoursWeekly,
        workingSchedule: selectedContract.employmentType
      } as any, currentCompanyId);
    } catch (e) {
      console.error('Error saving contract to Firestore:', e);
    }

    // الربط الآلي للإجازات (Running Trigger Hook): إنشاء وتثبيت رصيد إجازات سنوية 30 يوم لسنة 2026 فور تفعيل العقد الساري
    triggerContractRunningLeaveAllocation({
      employeeId: selectedContract.id,
      employeeName: selectedContract.name,
      startDate: selectedContract.startDate || '2026-01-01',
      contractStatus: selectedContract.contractStatus,
      companyId: currentCompanyId
    });

    if (isCreatingNew) {
      setContracts([selectedContract, ...contracts]);
      toast.success(`تم إنشاء العقد (${selectedContract.contractRef}) للموظف ${selectedContract.name} واعتماد رصيد 30 يوماً لسنة 2026 تلقائياً`);
    } else {
      setContracts(contracts.map(c => c.contractRef === selectedContract.contractRef ? selectedContract : c));
      toast.success(`تم تحديث بيانات العقد (${selectedContract.contractRef}) وتحديث رصيد الإجازات لسنة 2026`);
    }

    // Sync full contract properties with global hierarchy
    updateContractDetails({
      id: selectedContract.id,
      basicSalary: selectedContract.basicSalary,
      housingAllowance: selectedContract.housingAllowance,
      transportAllowance: selectedContract.transportAllowance,
      medicalAllowance: selectedContract.medicalAllowance,
      employmentType: selectedContract.employmentType,
      hasCustomSchedule: selectedContract.hasCustomSchedule,
      dailyHours: selectedContract.dailyHours,
      shiftStartTime: selectedContract.shiftStartTime,
      shiftEndTime: selectedContract.shiftEndTime,
      gracePeriodMinutes: selectedContract.gracePeriodMinutes,
      hourlyRate: selectedContract.hourlyRate,
      contractStatus: selectedContract.contractStatus
    });

    // مزامنة خصائص الراتب مع سجل الموظف في Firestore
    try {
      const selCnt = selectedContract as any;
      const empList = await TenantDatabaseService.getEmployeesByTenant(currentCompanyId);
      const targetEmp = empList.find((e: any) => e.id === selCnt.id || e.id === selCnt.employeeId);
      if (targetEmp) {
          const bSal = Number(selCnt.basicSalary || 0);
          const hAll = Number(selCnt.housingAllowance || 0);
          const tAll = Number(selCnt.transportAllowance || 0);
          const mAll = Number(selCnt.medicalAllowance || 0);
          const oAll = Number(selCnt.otherAllowances || selCnt.otherAllowance || 0);
          const totAllowances = hAll + tAll + mAll + oAll;
          const totSal = bSal + totAllowances;

          const updatedEmp = {
            ...targetEmp,
            basicSalary: bSal,
            contractSalary: bSal,
            housingAllowance: hAll,
            transportAllowance: tAll,
            medicalAllowance: mAll,
            otherAllowance: oAll,
            otherAllowances: oAll,
            allowances: totAllowances,
            totalSalary: totSal,
            salary: totSal,
            contractType: selCnt.contractType || (targetEmp as any).contractType,
            contractStatus: selCnt.contractStatus || targetEmp.contractStatus,
            contractStartDate: selCnt.startDate || (targetEmp as any).contractStartDate,
            contractEndDate: selCnt.endDate || (targetEmp as any).contractEndDate,
          };
          await TenantDatabaseService.saveEmployee(updatedEmp, currentCompanyId);
      }
    } catch (err) {
      console.error('Error syncing employee salary from contract:', err);
    }

    setIsContractModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right font-sans dir-rtl text-slate-800" dir="rtl">
      
      {/* 1. Header Banner & Action Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">عقود العمل وهيكل الرواتب والدوام (hr.contract)</h1>
            <p className="text-xs text-slate-500 font-medium">
              إدارة العقود الفردية، الدوام الكامل والجزئي (Locum / Hourly)، جداول الساعات المخصصة، والربط الحي مع البصمة و WPS
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const exportData = filteredContracts.map((c, idx) => ({
                'م': idx + 1,
                'رقم العقد': c.contractRef,
                'اسم الموظف': c.name,
                'الرقم المدني': c.civilId,
                'المسمى الوظيفي': c.jobTitle,
                'القسم': c.department,
                'نوع الدوام': c.employmentType === 'part_time' ? 'دوام جزئي / بالساعة' : 'دوام كامل',
                'الراتب الأساسي (د.ك)': Number((c.basicSalary || 0).toFixed(3)),
                'بدل السكن (د.ك)': Number((c.housingAllowance || 0).toFixed(3)),
                'بدل الانتقال (د.ك)': Number((c.transportAllowance || 0).toFixed(3)),
                'الراتب الشامل (د.ك)': Number(((c.basicSalary || 0) + (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0)).toFixed(3)),
                'البنك': c.bankName,
                'الآيبان': c.iban,
                'حالة العقد': c.contractStatus === 'running' ? 'ساري' : c.contractStatus === 'draft' ? 'مسودة' : 'منتهي',
                'تاريخ البداية': c.startDate,
                'تاريخ الانتهاء': c.endDate || 'غير محدد'
              }));
              exportToExcel(exportData, 'سجل_عقود_العمل_والرواتب', 'عقود الموظفين');
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="تصدير سجل العقود إلى Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => safePrintAction('كشف عقود العمل')}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={15} />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Inline KPI Summary Bar */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        <div className="flex items-center gap-2 text-[#714B67]">
          <Calculator className="w-4 h-4" />
          <span>إجمالي موازنة الرواتب التقديرية:</span>
          <span className="font-mono text-sm font-black">{totalMonthlyPayroll.toFixed(3)} د.ك</span>
        </div>
        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>عقود سارية: <strong className="font-mono text-emerald-700">{runningCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>مسودات: <strong className="font-mono text-amber-700">{draftCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>دوام جزئي/بالساعة: <strong className="font-mono text-indigo-700">{partTimeCount}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs font-bold">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-[#714B67] text-white border-[#714B67]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            الكل ({contracts.length})
          </button>
          <button
            onClick={() => setFilterStatus('running')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'running' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>ساري ({runningCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'draft' ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>مسودة ({draftCount})</span>
          </button>

          {/* Type Filter */}
          <div className="border-r border-slate-200 pr-2 flex gap-1.5">
            <button
              onClick={() => setFilterEmploymentType('all')}
              className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                filterEmploymentType === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              كافة الدوامات
            </button>
            <button
              onClick={() => setFilterEmploymentType('full_time')}
              className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                filterEmploymentType === 'full_time' ? 'bg-teal-700 text-white border-teal-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              دوام كامل
            </button>
            <button
              onClick={() => setFilterEmploymentType('part_time')}
              className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                filterEmploymentType === 'part_time' ? 'bg-indigo-700 text-white border-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              دوام جزئي / بالساعة
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث برقم العقد، اسم الموظف، أو الرقم المدني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
          />
        </div>
      </div>

      {/* 4. Streamlined Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3">كود العقد</th>
                <th className="p-3">الموظف والمسمى الوظيفي</th>
                <th className="p-3 text-center">نوع الدوام والشيفت</th>
                <th className="p-3 text-left font-mono">التفاصيل المالية والبدلات</th>
                <th className="p-3 text-center">حالة العقد</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c, idx) => {
                const isPartTime = c.employmentType === 'part_time';
                const totalAllowances = (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0);
                const totalGross = isPartTime 
                  ? ((c.hourlyRate || 0) * (c.dailyHours || 4) * 26 + totalAllowances)
                  : ((c.basicSalary || 0) + totalAllowances);
                
                return (
                  <tr 
                    key={`${c.contractRef}-${idx}`} 
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-purple-50/30 transition`}
                  >
                    <td className="p-3 font-mono font-bold text-[#714B67]">
                      {c.contractRef}
                    </td>
                    
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {c.jobTitle} | {c.department} | المدني: {c.civilId}
                      </div>
                    </td>

                    {/* Employment Type & Shift Combined Cell */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 mb-1">
                        {isPartTime ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Stethoscope size={10} />
                            <span>دوام جزئي / بالساعة</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <Briefcase size={10} />
                            <span>دوام كامل</span>
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        <span>{c.shiftStartTime || '08:00'} - {c.shiftEndTime || '16:00'} ({c.dailyHours || 8}س)</span>
                      </div>
                    </td>
                    
                    {/* Combined Financial Details */}
                    <td className="p-3 text-left font-mono">
                      <div className="font-black text-sm text-[#714B67]">
                        {totalGross.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك (الاستحقاق)</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {isPartTime ? (
                          <span>أجر الساعة: {(c.hourlyRate || 0).toFixed(3)} د.ك</span>
                        ) : (
                          <span>الأساسي: {(c.basicSalary || 0).toFixed(3)} د.ك | البدلات: {totalAllowances.toFixed(3)} د.ك</span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      {c.contractStatus === 'running' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>ساري</span>
                        </span>
                      )}
                      {c.contractStatus === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <span>مسودة</span>
                        </span>
                      )}
                      {c.contractStatus === 'expired' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          <span>منتهي</span>
                        </span>
                      )}
                    </td>

                    {/* Streamlined Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditContract(c)}
                          className="bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          title="تحرير"
                        >
                          <Edit3 size={12} />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintableContract(c)}
                          className="bg-slate-50 hover:bg-slate-200 text-slate-600 p-1.5 rounded-lg transition cursor-pointer"
                          title="معاينة وطباعة العقد الرسمي"
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteContract(c.contractRef || c.id, e)}
                          className="bg-slate-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition cursor-pointer"
                          title="حذف العقد"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ODOO 18 CONTRACT FORM SHEET / MODAL */}
      {isContractModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp text-right flex flex-col max-h-[92vh]">
            
            {/* Modal Top Header & Status Pipeline Bar */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#714B67] text-white rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isCreatingNew ? 'إنشاء عقد عمل جديد (New Contract Sheet)' : `عقد العمل: ${selectedContract.contractRef}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    الموظف: <strong className="text-[#714B67]">{selectedContract.name}</strong> | الرقم المدني: {selectedContract.civilId}
                  </p>
                </div>
              </div>

              {/* Status State Pipeline */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedContract({ ...selectedContract, contractStatus: 'draft' })}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    selectedContract.contractStatus === 'draft' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  مسودة (Draft)
                </button>
                <ChevronRight size={12} className="text-slate-300 rotate-180" />
                <button
                  type="button"
                  onClick={() => setSelectedContract({ ...selectedContract, contractStatus: 'running' })}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    selectedContract.contractStatus === 'running' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  ساري (Running)
                </button>
                <ChevronRight size={12} className="text-slate-300 rotate-180" />
                <button
                  type="button"
                  onClick={() => setSelectedContract({ ...selectedContract, contractStatus: 'expired' })}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    selectedContract.contractStatus === 'expired' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  منتهي (Expired)
                </button>
              </div>
            </div>

            {/* Modal Body / Form Sheet */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Section 1: Employee Binding & Employment Type Selector */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="font-bold text-slate-900 flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#714B67]" />
                    <span>بيانات الموظف ونوع الدوام والتعاقد</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">قانون العمل الكويتي رقم 6/2010</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1">الموظف المعني بالعقد (Employee)</label>
                    <select
                      value={selectedContract.id}
                      onChange={(e) => handleEmployeeSelectionChange(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    >
                      {availableEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.id} - {emp.jobTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Type Selector (Full-Time vs Part-Time / Locum) */}
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">
                      نظام ونوع الدوام (Employment Type) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedContract.employmentType || 'full_time'}
                      onChange={(e) => {
                        const newType = e.target.value as 'full_time' | 'part_time';
                        setSelectedContract({
                          ...selectedContract,
                          employmentType: newType,
                          hasCustomSchedule: newType === 'part_time' ? true : selectedContract.hasCustomSchedule,
                          dailyHours: newType === 'part_time' ? (selectedContract.dailyHours || 4) : 8,
                          shiftStartTime: newType === 'part_time' ? '16:00' : '08:00',
                          shiftEndTime: newType === 'part_time' ? '20:00' : '16:00',
                          hourlyRate: newType === 'part_time' ? (selectedContract.hourlyRate || 25) : 0
                        });
                      }}
                      className="w-full p-2.5 bg-white border-2 border-[#714B67]/30 rounded-xl font-bold text-slate-900 focus:border-[#714B67]"
                    >
                      <option value="full_time">دوام كامل (Full-Time) - راتب شهري ثابت</option>
                      <option value="part_time">دوام جزئي / استشاري زائر (Part-Time / Locum) - بأجر الساعة</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">نوع العقد القانوني</label>
                    <select
                      value={selectedContract.contractType}
                      onChange={(e) => setSelectedContract({ ...selectedContract, contractType: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    >
                      <option value="fixed">عقد محدد المدة (Fixed-Term Contract)</option>
                      <option value="unlimited">عقد غير محدد المدة (Indefinite Contract)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">المسمى الوظيفي المعتمد</label>
                    <input
                      type="text"
                      value={selectedContract.jobTitle}
                      onChange={(e) => setSelectedContract({ ...selectedContract, jobTitle: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">القسم / الإدارة</label>
                    <input
                      type="text"
                      value={selectedContract.department}
                      onChange={(e) => setSelectedContract({ ...selectedContract, department: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">الرقم المدني (Civil ID)</label>
                    <input
                      type="text"
                      value={selectedContract.civilId}
                      onChange={(e) => setSelectedContract({ ...selectedContract, civilId: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dynamic Work Schedule Fields (ساعات وأوقات الدوام المخصصة) */}
              <div className="bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-200 space-y-3">
                <div className="font-bold text-indigo-950 flex items-center justify-between border-b border-indigo-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-700" />
                    <span>جدول وساعات العمل المخصصة</span>
                  </div>
                  
                  {/* Enable Custom Schedule Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedContract.hasCustomSchedule || selectedContract.employmentType === 'part_time'}
                      onChange={(e) => setSelectedContract({ ...selectedContract, hasCustomSchedule: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-indigo-900 font-bold">تخصيص شيفت وساعات الموظف</span>
                  </label>
                </div>

                {(selectedContract.hasCustomSchedule || selectedContract.employmentType === 'part_time') ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">ساعات العمل اليومية</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          step="0.5"
                          value={selectedContract.dailyHours || 8}
                          onChange={(e) => setSelectedContract({ ...selectedContract, dailyHours: parseFloat(e.target.value) || 8 })}
                          className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900 pl-10"
                        />
                        <span className="absolute left-3 top-2 text-xs text-slate-400">ساعة</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">وقت الحضور</label>
                      <input
                        type="time"
                        value={selectedContract.shiftStartTime || '08:00'}
                        onChange={(e) => setSelectedContract({ ...selectedContract, shiftStartTime: e.target.value })}
                        className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">وقت الانصراف</label>
                      <input
                        type="time"
                        value={selectedContract.shiftEndTime || '16:00'}
                        onChange={(e) => setSelectedContract({ ...selectedContract, shiftEndTime: e.target.value })}
                        className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">سماح التأخير الصباحي</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={selectedContract.gracePeriodMinutes !== undefined ? selectedContract.gracePeriodMinutes : 15}
                          onChange={(e) => setSelectedContract({ ...selectedContract, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900 pl-12"
                        />
                        <span className="absolute left-3 top-2 text-xs text-slate-400">دقيقة</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <span>جدول قياسي افتراضي: <strong>08:00 ص - 04:00 م</strong> (8 ساعات يومياً | سماح 15 دقيقة)</span>
                    <button
                      type="button"
                      onClick={() => setSelectedContract({ ...selectedContract, hasCustomSchedule: true })}
                      className="text-indigo-700 font-bold hover:underline cursor-pointer"
                    >
                      تغيير الشيفت ⚙️
                    </button>
                  </div>
                )}
              </div>

              {/* Section 3: Wage Structure Breakdown & Hourly Rate */}
              <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200 space-y-4">
                <div className="font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-700" />
                    <span>الهيكل المالي للراتب والبدلات</span>
                  </div>
                  {selectedContract.employmentType === 'part_time' && (
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      نظام الساعات الفعلية (Locum Hourly Rate)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {selectedContract.employmentType === 'part_time' ? (
                    <div>
                      <label className="text-indigo-900 block mb-1 font-black flex items-center gap-1">
                        <Timer size={12} className="text-indigo-600" />
                        <span>أجر الساعة التعاقدي (Hourly Rate)</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          value={selectedContract.hourlyRate || 0}
                          onChange={(e) => setSelectedContract({ ...selectedContract, hourlyRate: parseFloat(e.target.value) || 0, basicSalary: 0 })}
                          className="w-full p-2.5 bg-white border-2 border-indigo-400 rounded-xl font-mono font-bold text-indigo-900 pl-12"
                        />
                        <span className="absolute left-3 top-2.5 text-xs text-indigo-400 font-bold">د.ك/س</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">الراتب الأساسي (Basic Salary)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedContract.basicSalary}
                        onChange={(e) => setSelectedContract({ ...selectedContract, basicSalary: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">بدل السكن (Housing)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedContract.housingAllowance}
                      onChange={(e) => setSelectedContract({ ...selectedContract, housingAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">بدل الانتقال (Transport)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedContract.transportAllowance}
                      onChange={(e) => setSelectedContract({ ...selectedContract, transportAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">البدل الطبي / بدلات أخرى</label>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedContract.medicalAllowance || 0}
                      onChange={(e) => setSelectedContract({ ...selectedContract, medicalAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Calculation summary banner */}
                {(() => {
                  const isPartTime = selectedContract.employmentType === 'part_time';
                  const allowances = (selectedContract.housingAllowance || 0) + (selectedContract.transportAllowance || 0) + (selectedContract.medicalAllowance || 0);
                  
                  if (isPartTime) {
                    const hRate = selectedContract.hourlyRate || 0;
                    const dHours = selectedContract.dailyHours || 4;
                    const estimatedDayRate = hRate * dHours;
                    const estimatedMonthGross = (estimatedDayRate * 26) + allowances;

                    return (
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold">معادلة مسير الرواتب (WPS Formula):</div>
                          <div className="text-xs font-black text-indigo-900 font-mono">
                            (ساعات البصمة الفعلية × {hRate.toFixed(3)} د.ك) + {allowances.toFixed(3)} د.ك بدلات
                          </div>
                        </div>
                        <div className="border-r border-slate-200 pr-4">
                          <div className="text-[10px] text-slate-400 font-bold">التقديري الشهري (أساس 26 يوم):</div>
                          <div className="text-base font-black text-indigo-700 font-mono">{estimatedMonthGross.toFixed(3)} د.ك</div>
                        </div>
                      </div>
                    );
                  }

                  const gross = (selectedContract.basicSalary || 0) + allowances;
                  const dayRate = gross / 26;
                  const hourRate = dayRate / (selectedContract.dailyHours || 8);

                  return (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">إجمالي الراتب الشامل المعتمد (Gross Wage):</div>
                        <div className="text-base font-black text-emerald-800 font-mono">{gross.toFixed(3)} د.ك</div>
                      </div>
                      <div className="border-r border-slate-200 pr-4">
                        <div className="text-[10px] text-slate-400 font-bold">أجر اليوم الواحد (أساس 26 يوم):</div>
                        <div className="text-xs font-bold text-slate-800 font-mono">{dayRate.toFixed(3)} د.ك</div>
                      </div>
                      <div className="border-r border-slate-200 pr-4">
                        <div className="text-[10px] text-slate-400 font-bold">أجر ساعة العمل:</div>
                        <div className="text-xs font-bold text-slate-800 font-mono">{hourRate.toFixed(3)} د.ك</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Section 4: Collapsible Period & Legal Working Conditions */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLegalDetails(!showLegalDetails)}
                  className="w-full p-3.5 flex items-center justify-between text-slate-800 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#714B67]" />
                    <span>المدد والاشتراطات القانونية (بداية العقد، التجربة، الإخطار)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-normal">
                    <span>{showLegalDetails ? 'إخفاء' : `بداية: ${selectedContract.startDate || 'اليوم'} | تجربة: ${selectedContract.probationDays || 100} يوم`}</span>
                    {showLegalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>

                {showLegalDetails && (
                  <div className="p-4 pt-1 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 bg-white">
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ بداية العقد</label>
                      <input
                        type="date"
                        value={selectedContract.startDate}
                        onChange={(e) => setSelectedContract({ ...selectedContract, startDate: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ نهاية العقد (إن وجد)</label>
                      <input
                        type="date"
                        value={selectedContract.endDate || ''}
                        onChange={(e) => setSelectedContract({ ...selectedContract, endDate: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">فترة التجربة (أيام)</label>
                      <input
                        type="number"
                        value={selectedContract.probationDays}
                        onChange={(e) => setSelectedContract({ ...selectedContract, probationDays: parseInt(e.target.value) || 100 })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">فترة الإخطار (أشهر)</label>
                      <input
                        type="number"
                        value={selectedContract.noticePeriodMonths}
                        onChange={(e) => setSelectedContract({ ...selectedContract, noticePeriodMonths: parseInt(e.target.value) || 3 })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء (Discard)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectedContract && setPrintableContract(selectedContract)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>معاينة وطباعة العقد</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveContract}
                  className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save size={15} />
                  <span>حفظ واعتماد العقد (Save Contract)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Official A4 Printable Contract Modal */}
      {printableContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200 print:border-none print:shadow-none print:w-full print:max-w-none">
            
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    عقد عمل أهلي كويتي رسمي معتمد - {printableContract.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    مرجع العقد: {printableContract.contractRef} | الرقم المدني: {printableContract.civilId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!contractPrintRef.current) return;
                    setIsExportingContractPdf(true);
                    try {
                      await exportElementToPdf(contractPrintRef.current, `عقد_عمل_${printableContract.name}`);
                      toast.success('تم تصدير العقد بصيغة PDF بنجاح');
                    } catch (e) {
                      toast.error('حدث خطأ أثناء تصدير العقد');
                    } finally {
                      setIsExportingContractPdf(false);
                    }
                  }}
                  disabled={isExportingContractPdf}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck size={14} />
                  <span>{isExportingContractPdf ? 'جاري التصدير...' : 'تصدير PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => safePrintAction(`عقد عمل رسمي - ${printableContract.name}`)}
                  className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer size={14} />
                  <span>طباعة A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintableContract(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-xl transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable A4 Content Sheet */}
            <div className="p-6 md:p-12 overflow-x-auto bg-slate-50 print:bg-white print:p-0 flex justify-center">
              <div 
                ref={contractPrintRef}
                className="bg-white text-slate-900 shadow-xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 border border-slate-200 print:border-none relative flex flex-col justify-between"
                style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", lineHeight: 1.8 }}
                dir="rtl"
              >
                {/* Header */}
                <div className="border-b-2 border-[#714B67] pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-50 border-2 border-[#714B67] rounded-xl flex items-center justify-center font-black text-[#714B67] text-xl">
                        {(activeCompany?.nameAr || 'م').charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[#714B67]">
                          {activeCompany?.nameAr || activeCompany?.name || 'مجموعة المنارة للخدمات المتكاملة ذ.م.م'}
                        </h2>
                        <p className="text-[11px] font-bold text-slate-500 font-mono">
                          سجل تجاري: {activeCompany?.commercialRegNo || '148291'} | الرقم الآلي: {(activeCompany as any)?.paciNumber || '20491823'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left font-mono text-xs text-slate-600 space-y-1">
                      <div>التاريخ: {new Date().toLocaleDateString('ar-KW')}</div>
                      <div>رقم العقد: <strong className="text-[#714B67]">{printableContract.contractRef}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Contract Body */}
                <div className="space-y-4 text-justify text-xs md:text-sm">
                  <div className="text-center my-2">
                    <h1 className="text-lg md:text-xl font-black text-slate-900 border-b-2 border-slate-900 inline-block pb-1 px-6">
                      عقد عمل في القطاع الأهلي
                    </h1>
                    <div className="text-xs text-slate-600 font-bold mt-1">
                      (محرر وفقاً لأحكام قانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010 والقرارات المنفذة له)
                    </div>
                  </div>

                  <p className="leading-7">
                    إنه في يوم <strong>{new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> بدولة الكويت، تم الاتفاق والتراضي بين كل من:
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs md:text-sm">
                    <div><strong>الطرف الأول (صاحب العمل):</strong> {activeCompany?.nameAr || activeCompany?.name || 'المنشأة المعتمدة'}، سجل تجاري: {activeCompany?.commercialRegNo || '148291'}، الرقم الآلي: {(activeCompany as any)?.paciNumber || '20491823'}.</div>
                    <div><strong>الطرف الثاني (العامل):</strong> السيد/ {printableContract.name}، البطاقة المدنية: ({printableContract.civilId})، الجنسية: {printableContract.isKuwaiti ? 'كويتي' : 'غير كويتي'}.</div>
                  </div>

                  <div className="space-y-3 pt-1 leading-7">
                    <p>
                      <strong>البند الأول (طبيعة العمل ومكانه):</strong> يعمل الطرف الثاني لدى الطرف الأول بمهنة (<strong>{printableContract.jobTitle}</strong>) في قسم (<strong>{printableContract.department}</strong>)، ويلتزم بالعمل في مقرات المنشأة وفروعها بدولة الكويت.
                    </p>

                    <p>
                      <strong>البند الثاني (مدة العقد والتجربة):</strong> يبدأ سريان هذا العقد من تاريخ <strong>{printableContract.startDate || new Date().toISOString().slice(0, 10)}</strong>، ويخضع الطرف الثاني لفترة تجربة مدتها <strong>{printableContract.probationDays || 100} يوماً</strong> طبقاً للمادة (24) من قانون العمل.
                    </p>

                    {(() => {
                      const b = Number(printableContract.basicSalary) || 0;
                      const h = Number(printableContract.housingAllowance) || 0;
                      const t = Number(printableContract.transportAllowance) || 0;
                      const m = Number(printableContract.medicalAllowance) || 0;
                      const total = b + h + t + m;
                      const totalTafqeet = tafqeet(total);

                      return (
                        <p>
                          <strong>البند الثالث (الأجر والبدلات):</strong> يتقاضى الطرف الثاني أجراً شهرياً شاملاً قدره (<strong>{total.toFixed(3)} د.ك</strong>) فقط ({totalTafqeet} لا غير)، مفصلاً كالتالي: راتب أساسي ({b.toFixed(3)} د.ك) + بدل سكن ({h.toFixed(3)} د.ك) + بدل انتقال ({t.toFixed(3)} د.ك)، ويتم التحويل بانتظام عبر نظام حماية الأجور (WPS) لحسابه في {printableContract.bankName || 'البنك المعتمد'}.
                        </p>
                      );
                    })()}

                    <p>
                      <strong>البند الرابع (ساعات العمل والراحة):</strong> ساعات العمل <strong>{printableContract.workingHoursWeekly || 48} ساعة أسبوعياً</strong>، مع منح العامل يوم راحة أسبوعية مدفوعة الأجر طبقاً للمادتين (64 و 67).
                    </p>

                    <p>
                      <strong>البند الخامس (الإجازات السنوية ومكافأة نهاية الخدمة):</strong> يستحق العامل إجازة سنوية مدتها 30 يوماً مدفوعة الأجر بعد إتمام 9 أشهر خدمة، وتصرف مكافأة نهاية الخدمة طبقاً للمادة (51) من القانون رقم 6 لسنة 2010.
                    </p>

                    <p>
                      <strong>البند السادس (المحاكم المختصة):</strong> تختص المحاكم العمالية بدولة الكويت بنظر أي نزاع قد ينشأ، وحُرر هذا العقد من نسختين بيد كل طرف نسخة للعمل بموجبها.
                    </p>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="border-t-2 border-slate-200 pt-6 mt-6">
                  <div className="grid grid-cols-3 items-end text-xs md:text-sm">
                    <div className="space-y-1">
                      <div className="font-black text-slate-800">الطرف الأول (صاحب العمل):</div>
                      <div className="text-slate-500 text-xs">إدارة الموارد البشرية</div>
                      <div className="pt-8 font-bold text-slate-400">التوقيع: .........................</div>
                    </div>

                    <div className="text-center flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#714B67]/40 flex flex-col items-center justify-center p-1 text-center text-[9px] text-[#714B67] font-bold rotate-[-6deg]">
                        <span>ختم المنشأة الرسمي</span>
                        <span className="text-[8px] font-mono">{activeCompany?.commercialRegNo || '148291'}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="font-black text-slate-800 text-right">الطرف الثاني (العامل):</div>
                      <div className="text-slate-500 text-xs text-right">{printableContract.name}</div>
                      <div className="pt-8 font-bold text-slate-400 text-right">التوقيع: .........................</div>
                    </div>
                  </div>

                  <div className="text-center font-mono text-[10px] text-slate-400 pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <span>وثيقة عقد عمل صادرة عبر نظام منارة HR الذكي</span>
                    <span>مرجع: {printableContract.contractRef}</span>
                    <span>معتمدة ومطابقة لقانون العمل 6/2010</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Collapsible Chatter Section */}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowChatter(!showChatter)}
            className="text-xs font-bold text-slate-600 hover:text-[#714B67] flex items-center gap-2 transition cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>{showChatter ? 'إخفاء سجل التتبع والملاحظات (Odoo Chatter)' : 'عرض سجل التتبع والملاحظات الرسمية (Odoo Chatter)'}</span>
            {showChatter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showChatter && (
          <div className="mt-4 animate-fadeIn">
            {(() => {
               const messages: ChatterMessage[] = [];
               contracts.forEach(c => {
                 if (c.contractStatus === 'draft') {
                    messages.push({
                      id: `auto-contract-${c.id}`,
                      author: 'نظام العقود (hr.contract)',
                      date: new Date().toLocaleDateString('ar-KW'),
                      content: `يرجى مراجعة واعتماد مسودة العقد (${c.contractRef}) للموظف (${c.name}) - نوع الدوام: ${c.employmentType === 'part_time' ? 'دوام جزئي/بالساعة' : 'دوام كامل'}.`,
                      type: 'activity',
                      activityDetails: {
                        type: 'متابعة وتوقيع عقد',
                        assignee: 'مدير الموارد البشرية',
                        dueDate: new Date().toISOString().split('T')[0],
                        status: 'yellow',
                        statusText: 'مسودة قيد المراجعة'
                      }
                    });
                 }
               });
               return (
                 <OdooChatter 
                   recordId="contracts_global" 
                   model="hr.contract" 
                   followers={[
                     { id: '1', name: 'إدارة الموارد البشرية' },
                     { id: '2', name: 'مسؤول رواتب WPS' }
                   ]}
                   messages={messages.length > 0 ? messages : [
                     { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'جميع عقود العمل موثقة ومطابقة لقانون العمل الكويتي وتدعم الجداول المخصصة والساعات الفعلية.' }
                   ]}
                 />
               );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default OdooContractsApp;

