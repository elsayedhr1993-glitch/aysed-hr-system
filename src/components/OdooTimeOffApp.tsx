import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  Layers, 
  Check, 
  X, 
  Printer, 
  Plane, 
  DollarSign, 
  Calculator, 
  UserCheck, 
  Building2,
  FileText,
  List,
  BarChart,
  Upload,
  User,
  Sparkles,
  Trash2,
  RefreshCw,
  Info,
  FileSpreadsheet
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-hot-toast';
import { LeaveSettlementCalculator } from './LeaveSettlementCalculator';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  civilId: string;
  department: string;
  leaveType: 'annual' | 'sick' | 'hajj' | 'bereavement' | 'maternity' | 'unpaid' | 'emergency';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  replacementEmployee?: string;
  basicSalary: number;
  totalSalary: number;
  settlementDone?: boolean;
}

export interface LeaveAllocation {
  id: string;
  employeeId?: string;
  employeeName: string;
  fromYear: string;
  days: number;
  leaveType?: string;
  allocationDate: string;
  notes: string;
  allocatedBy?: string;
}

const leaveTypeLabels: Record<string, { label: string; color: string; maxDaysRule: string }> = {
  annual: { label: 'إجازة سنوية (30 يوم/سنة)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', maxDaysRule: '2.5 يوم/شهر - مادة 70' },
  sick: { label: 'إجازة مرضية (تقرير طبي)', color: 'bg-rose-100 text-rose-800 border-rose-300', maxDaysRule: '15 يوم بأجر كامل، 10 بنصف أجر' },
  hajj: { label: 'إجازة حج (21 يوم)', color: 'bg-amber-100 text-amber-800 border-amber-300', maxDaysRule: 'مادة 76 - خدمة لا تقل عن سنتين' },
  bereavement: { label: 'إجازة عزاء (حداد)', color: 'bg-slate-100 text-slate-800 border-slate-300', maxDaysRule: 'مادة 77 - 3 أيام للدرجة الأولى' },
  maternity: { label: 'إجازة وضع وأمومة', color: 'bg-purple-100 text-purple-800 border-purple-300', maxDaysRule: 'مادة 24 - 70 يوماً بأجر كامل' },
  emergency: { label: 'إجازة طارئة', color: 'bg-orange-100 text-orange-800 border-orange-300', maxDaysRule: 'تخصم من الرصيد السنوي' },
  unpaid: { label: 'إجازة بدون راتب', color: 'bg-gray-100 text-gray-700 border-gray-300', maxDaysRule: 'بموافقة صاحب العمل' },
};

const STORAGE_KEY_ALLOCATIONS = 'odoo_leave_allocations_v2';
const STORAGE_KEY_REQUESTS = 'odoo_leave_requests_v2';

export const OdooTimeOffApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees, leaveAccruals, updateLeaveAccrual, processMonthlyAccruals } = useOdooHierarchy();

  // 1. DATA STATES (with LocalStorage persistence)
  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading leave requests from storage', e);
    }
    return [
      {
        id: 'LV-2026-001',
        employeeId: 'EMP-001',
        employeeName: 'أحمد محمود الكندري',
        civilId: '290010112345',
        department: 'الأطباء',
        leaveType: 'annual',
        startDate: '2026-09-10',
        endDate: '2026-09-24',
        daysCount: 15,
        reason: 'إجازة سنوية اعتيادية للراحة والسفر',
        status: 'approved',
        appliedDate: '2026-08-30',
        replacementEmployee: 'محمد إبراهيم السيد',
        basicSalary: 1200,
        totalSalary: 1650,
        settlementDone: false
      },
      {
        id: 'LV-2026-002',
        employeeId: 'EMP-002',
        employeeName: 'محمد إبراهيم السيد',
        civilId: '288050498765',
        department: 'الموارد البشرية',
        leaveType: 'annual',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        daysCount: 30,
        reason: 'إجازة سنوية للسفر',
        status: 'approved',
        appliedDate: '2026-08-20',
        replacementEmployee: 'أحمد محمود الكندري',
        basicSalary: 650,
        totalSalary: 850,
        settlementDone: true
      },
      {
        id: 'LV-2026-003',
        employeeId: 'EMP-003',
        employeeName: 'فاطمة علي أحمد',
        civilId: '293010100000',
        department: 'الأطباء',
        leaveType: 'sick',
        startDate: '2026-09-15',
        endDate: '2026-09-17',
        daysCount: 3,
        reason: 'وعكة صحية (مرفق تقرير)',
        status: 'pending',
        appliedDate: '2026-09-14',
        replacementEmployee: 'سارة خالد',
        basicSalary: 900,
        totalSalary: 1100,
        settlementDone: false
      }
    ];
  });

  const [allocations, setAllocations] = useState<LeaveAllocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALLOCATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading allocations from storage', e);
    }
    return [
      {
        id: 'ALC-2025-01',
        employeeId: 'EMP-002',
        employeeName: 'محمد إبراهيم السيد',
        fromYear: '2025',
        days: 12.5,
        leaveType: 'annual',
        allocationDate: '2026-01-01',
        notes: 'رصيد مرحّل مستحق متبقي من سنة 2025',
        allocatedBy: 'مدير الموارد البشرية'
      },
      {
        id: 'ALC-2025-02',
        employeeId: 'EMP-001',
        employeeName: 'أحمد محمود الكندري',
        fromYear: '2025',
        days: 10,
        leaveType: 'annual',
        allocationDate: '2026-01-01',
        notes: 'رصيد افتتاحي مرحل معتمد',
        allocatedBy: 'الإدارة العليا'
      }
    ];
  });

  // Save to LocalStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to persist requests', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALLOCATIONS, JSON.stringify(allocations));
    } catch (e) {
      console.error('Failed to persist allocations', e);
    }
  }, [allocations]);

  // Unified Employees List for dropdowns
  const companyEmployees = (employees && employees.length > 0) ? employees : [
    { id: 'EMP-001', name: 'أحمد محمود الكندري', civilId: '290010112345', jobTitle: 'مدير الموارد البشرية', department: 'الإدارة العامة' },
    { id: 'EMP-002', name: 'محمد إبراهيم السيد', civilId: '288050498765', jobTitle: 'أخصائي شؤون إدارية', department: 'الموارد البشرية' },
    { id: 'EMP-003', name: 'فاطمة علي أحمد', civilId: '293010100000', jobTitle: 'طبيبة عامة', department: 'الأطباء' }
  ];

  // Filters & Tabs
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'requests' | 'allocations' | 'encashment'>('requests');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'gantt'>('list');

  // Modal Control States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedSettlementReq, setSelectedSettlementReq] = useState<LeaveRequest | null>(null);

  // Form Inputs - Leave Request
  const [newRequest, setNewRequest] = useState({
    employeeId: companyEmployees[0]?.id || 'EMP-001',
    employeeName: companyEmployees[0]?.name || 'أحمد محمود الكندري',
    civilId: companyEmployees[0]?.civilId || '290010112345',
    department: companyEmployees[0]?.department || 'القسم الطبي',
    leaveType: 'annual' as LeaveRequest['leaveType'],
    startDate: '',
    endDate: '',
    reason: '',
    replacementEmployee: '',
    basicSalary: 1200,
    totalSalary: 1650,
    excludeHolidays: false
  });

  // Form Inputs - Time Off Allocation (Odoo 18 Enterprise Form Fields)
  const [newAllocation, setNewAllocation] = useState({
    employeeId: companyEmployees[0]?.id || 'EMP-001',
    employeeName: companyEmployees[0]?.name || 'أحمد محمود الكندري',
    fromYear: '2025',
    days: '12.5',
    leaveType: 'annual',
    notes: 'رصيد إجازات سنوية مرحّل من العام السابق ومستحق وفق موافقة الإدارة'
  });

  // When selected employee changes in Allocation form
  const handleAllocationEmployeeChange = (empId: string) => {
    const selected = companyEmployees.find(e => e.id === empId);
    if (selected) {
      setNewAllocation(prev => ({
        ...prev,
        employeeId: selected.id,
        employeeName: selected.name
      }));
    }
  };

  // When selected employee changes in Request form
  const handleRequestEmployeeChange = (empId: string) => {
    const selected = companyEmployees.find(e => e.id === empId);
    if (selected) {
      setNewRequest(prev => ({
        ...prev,
        employeeId: selected.id,
        employeeName: selected.name,
        civilId: selected.civilId || prev.civilId,
        department: selected.department || prev.department
      }));
    }
  };

  // Calculate Difference in Days (Smart Calculation)
  const calculateDays = (start: string, end: string, excludeHolidays: boolean) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    let diffTime = d2.getTime() - d1.getTime();
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays <= 0) return 0;

    // Smart logic: if exclude holidays is checked, subtract weekends (Friday/Saturday)
    if (excludeHolidays) {
      let actualDays = 0;
      let currentDate = new Date(d1);
      while (currentDate <= d2) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
        if (dayOfWeek !== 5 && dayOfWeek !== 6) {
          actualDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return actualDays;
    }

    return diffDays;
  };

  // Handlers
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const count = calculateDays(newRequest.startDate, newRequest.endDate, newRequest.excludeHolidays);
    if (count <= 0) {
      toast.error('يرجى اختيار تاريخ نهاية صحيح بعد تاريخ البداية.');
      return;
    }

    const created: LeaveRequest = {
      id: `LV-2026-00${requests.length + 1}`,
      employeeId: newRequest.employeeId || 'EMP-001',
      employeeName: newRequest.employeeName || 'موظف جديد',
      civilId: newRequest.civilId,
      department: newRequest.department,
      leaveType: newRequest.leaveType,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      daysCount: count,
      reason: newRequest.reason || 'إجازة اعتيادية',
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      replacementEmployee: newRequest.replacementEmployee,
      basicSalary: newRequest.basicSalary,
      totalSalary: newRequest.totalSalary,
      settlementDone: false
    };

    setRequests([created, ...requests]);
    setShowApplyModal(false);
    toast.success('تم تقديم طلب الإجازة بنجاح، بانتظار اعتماد المدير.');
  };

  // Handle Odoo 18 Allocation Creation & Balance Re-computation
  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const daysNum = parseFloat(newAllocation.days);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.error('يرجى إدخال عدد أيام صحيح (أكبر من صفر).');
      return;
    }

    const createdAlloc: LeaveAllocation = {
      id: `ALC-${newAllocation.fromYear}-${String(allocations.length + 1).padStart(2, '0')}`,
      employeeId: newAllocation.employeeId,
      employeeName: newAllocation.employeeName,
      fromYear: newAllocation.fromYear,
      days: daysNum,
      leaveType: newAllocation.leaveType,
      allocationDate: new Date().toISOString().split('T')[0],
      notes: newAllocation.notes || 'رصيد إجازات مرحّل',
      allocatedBy: 'مسؤول الموارد البشرية'
    };

    const updatedAllocations = [createdAlloc, ...allocations];
    setAllocations(updatedAllocations);

    // Sync with Odoo Hierarchy Context if employee exists
    if (newAllocation.employeeId && updateLeaveAccrual) {
      const currentAccrual = leaveAccruals?.[newAllocation.employeeId];
      const prevCarried = currentAccrual?.carriedFrom2025 || 0;
      const earned = currentAccrual?.earned2026 || 20;
      const consumed = currentAccrual?.consumedDays || 0;
      updateLeaveAccrual(newAllocation.employeeId, prevCarried + daysNum, earned, consumed);
    }

    setShowAllocationModal(false);
    toast.success(
      `تم اعتماد وإضافة ${daysNum} يوم كرصيد مرحّل للموظف (${newAllocation.employeeName}) بنجاح.`
    );
  };

  const handleDeleteAllocation = (id: string, empName: string, daysCount: number) => {
    if (window.confirm(`هل أنت متأكد من حذف سطر التخصيص للموظف (${empName}) بمقدار ${daysCount} يوم؟`)) {
      setAllocations(allocations.filter(a => a.id !== id));
      toast.success('تم حذف سطر التخصيص وتحديث الرصيد.');
    }
  };

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
    
    // Sync with leaveAccrual state if approved
    const targetReq = requests.find(r => r.id === id);
    if (targetReq && status === 'approved' && targetReq.employeeId && updateLeaveAccrual) {
      const current = leaveAccruals?.[targetReq.employeeId];
      const carried = current?.carriedFrom2025 || 0;
      const earned = current?.earned2026 || 20;
      const prevConsumed = current?.consumedDays || 0;
      const newConsumed = prevConsumed + targetReq.daysCount;
      updateLeaveAccrual(targetReq.employeeId, carried, earned, newConsumed);
    }

    toast.success(`تم ${status === 'approved' ? 'اعتماد' : 'رفض'} طلب الإجازة وتحديث سجل الرصيد وأيام الخدمة.`);
  };

  const handleRunMonthlyAccrual = () => {
    if (processMonthlyAccruals) {
      processMonthlyAccruals();
      toast.success('تم تشغيل الاستحقاق الشهري بنجاح: إضافة 2.5 يوم لرصيد جميع الموظفين النشطين (يوم 30 شهرياً).');
    }
  };

  const markSettlementPaid = (id: string) => {
    setRequests(requests.map(req => req.id === id ? { ...req, settlementDone: true } : req));
    toast.success('تم اعتماد التسوية المسبقة، وتم تحويل المستحقات لمسير الرواتب بنجاح.');
    setSelectedSettlementReq(null);
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = selectedFilter === 'all' || req.status === selectedFilter;
    const matchesSearch = req.employeeName.includes(searchQuery) || req.id.includes(searchQuery) || req.reason.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalCarriedDays = allocations.reduce((acc, a) => acc + a.days, 0);

  // Selected Employee Details for Allocation Preview
  const selectedEmpForAlloc = companyEmployees.find(e => e.id === newAllocation.employeeId) || companyEmployees[0];
  const empAllocatedDaysTotal = allocations
    .filter(a => a.employeeId === selectedEmpForAlloc?.id || a.employeeName === selectedEmpForAlloc?.name)
    .reduce((acc, a) => acc + a.days, 0);

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Top Header with Odoo 18 Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">نظام إدارة الإجازات (Time Off)</h1>
              <span className="bg-[#714B67]/10 text-[#714B67] text-[10px] font-bold px-2 py-0.5 rounded-full">Odoo 18 Enterprise</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | قانون العمل الكويتي (مادة 70 و 71)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => {
              const exportData = requests.map((r, idx) => ({
                'م': idx + 1,
                'رقم الطلب': r.id,
                'اسم الموظف': r.employeeName,
                'الرقم المدني': r.civilId,
                'القسم': r.department,
                'نوع الإجازة': leaveTypeLabels[r.leaveType]?.label || r.leaveType,
                'من تاريخ': r.startDate,
                'إلى تاريخ': r.endDate,
                'عدد الأيام': r.daysCount,
                'الحالة': r.status === 'approved' ? 'معتمدة' : r.status === 'pending' ? 'قيد المراجعة' : 'مرفوضة',
                'الموظف البديل': r.replacementEmployee || 'غير محدد',
                'السبب': r.reason
              }));
              exportToExcel(exportData, 'سجل_إجازات_الموظفين', 'طلبات الإجازات');
            }}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            title="تصدير جدول الإجازات إلى ملف Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>تصدير Excel</span>
          </button>
          <button
            type="button"
            onClick={() => safePrintAction('سجل الإجازات الرسمية')}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            title="طباعة سجل الإجازات"
          >
            <Printer size={15} />
            <span>طباعة</span>
          </button>
          <button
            type="button"
            onClick={handleRunMonthlyAccrual}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            title="تشغيل إضافة الاستحقاق الشهري التلقائي (+2.5 يوم لجميع الموظفين النشطين يوم 30)"
          >
            <RefreshCw size={14} className="text-emerald-600 animate-spin-hover" /> استحقاق الشهر (+2.5 يوم)
          </button>
          <button
            type="button"
            onClick={() => setShowAllocationModal(true)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <Layers size={15} className="text-purple-700" /> تخصيص رصيد مرحّل (Allocation)
          </button>
          <button
            type="button"
            onClick={() => setShowApplyModal(true)}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <PlusCircle size={15} /> تقديم طلب إجازة جديد
          </button>
        </div>
      </div>

      {/* Metric Cards - Odoo Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>الرصيد السنوي الأساسي</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">30.0 <span className="text-xs font-normal text-slate-500">يوم / سنة</span></div>
          <div className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> +2.5 يوم يضاف شهرياً آلياً (مادة 70)
          </div>
        </div>

        {/* Trigger Allocation Modal from Balance Card */}
        <div 
          className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs cursor-pointer hover:border-purple-400 hover:shadow-md transition group relative overflow-hidden" 
          onClick={() => setShowAllocationModal(true)}
          title="انقر لفتح نافذة تخصيص وترحيل الرصيد"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span className="text-purple-900 group-hover:text-[#714B67]">رصيد الإجازات المرحّل</span>
            <Layers className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-700">+{totalCarriedDays.toFixed(1)} <span className="text-xs font-normal text-slate-500">أيام معتمدة</span></div>
          <div className="text-[10px] text-purple-700 mt-1 flex items-center gap-1 font-bold group-hover:underline">
            <PlusCircle size={12} /> اضغط لتخصيص أو ترحيل رصيد جديد
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>طلبات قيد المراجعة والاعتماد</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {requests.filter(r => r.status === 'pending').length} <span className="text-xs font-normal text-slate-500">طلب معلق</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">تتطلب اعتماد المدير / الموارد البشرية</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>الإجازات المستهلكة المعتمدة</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {requests.filter(r => r.status === 'approved').reduce((acc, curr) => acc + curr.daysCount, 0)} <span className="text-xs font-normal text-slate-500">يوم مستهلك</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">تشمل الإجازات المصروفة والتسويات</div>
        </div>

      </div>

      {/* Main Mode Tabs Switcher & View Modes */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveMainTab('requests')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeMainTab === 'requests' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays size={14} /> طلبات الإجازات والتسويات ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('allocations')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeMainTab === 'allocations' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} /> الأرصدة الافتتاحية ({allocations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('encashment')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeMainTab === 'encashment' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign size={14} /> تصفية الإجازات (Encashment)
          </button>
        </div>

        {activeMainTab === 'requests' && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-xs text-[#714B67]' : 'text-slate-600'}`}
            >
              <List size={14} /> القائمة
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${viewMode === 'calendar' ? 'bg-white shadow-xs text-[#714B67]' : 'text-slate-600'}`}
            >
              <Calendar size={14} /> التقويم
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${viewMode === 'gantt' ? 'bg-white shadow-xs text-[#714B67]' : 'text-slate-600'}`}
            >
              <BarChart size={14} /> مخطط جانت (تداخل)
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: REQUESTS & SETTLEMENTS */}
      {activeMainTab === 'requests' && (
        <>
          {viewMode === 'list' && (
            <>
              {/* Controls Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'جميع الطلبات' },
                    { id: 'pending', label: 'قيد الاعتماد' },
                    { id: 'approved', label: 'المعتمدة' },
                    { id: 'rejected', label: 'المرفوضة' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        selectedFilter === tab.id
                          ? 'bg-[#714B67] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث بالاسم أو القسم أو الرقم..."
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#714B67] outline-none transition"
                  />
                </div>
              </div>

              {/* Requests Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">الرقم</th>
                        <th className="p-3.5">الموظف</th>
                        <th className="p-3.5">نوع الإجازة</th>
                        <th className="p-3.5">الفترة الزمنية</th>
                        <th className="p-3.5">المدة</th>
                        <th className="p-3.5">الموظف البديل</th>
                        <th className="p-3.5">الحالة</th>
                        <th className="p-3.5 text-center">إجراءات الاعتماد / تسوية الراتب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRequests.map((req) => {
                        const leaveConfig = leaveTypeLabels[req.leaveType] || leaveTypeLabels.annual;
                        return (
                          <tr key={req.id} className="hover:bg-slate-50/70 transition">
                            <td className="p-3.5 font-mono font-bold text-slate-500">{req.id}</td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900">{req.employeeName}</div>
                              <div className="text-[10px] text-slate-400">{req.department}</div>
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${leaveConfig.color}`}>
                                {leaveConfig.label}
                              </span>
                              {req.leaveType === 'sick' && (
                                <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                                  <FileText size={10}/> مرفق تقرير طبي
                                </div>
                              )}
                            </td>
                            <td className="p-3.5 font-mono">
                              <div className="font-bold text-slate-800">{req.startDate}</div>
                              <div className="text-[11px] text-slate-400">إلى {req.endDate}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-black text-slate-900 text-sm">{req.daysCount}</span> <span className="text-slate-500">يوم</span>
                            </td>
                            <td className="p-3.5 text-slate-600 font-medium">
                              {req.replacementEmployee || '---'}
                            </td>
                            <td className="p-3.5">
                              {req.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                  <CheckCircle2 size={12} /> معتمدة
                                </span>
                              )}
                              {req.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                  <Clock size={12} /> قيد المراجعة
                                </span>
                              )}
                              {req.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                  <XCircle size={12} /> مرفوضة
                                </span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {req.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(req.id, 'approved')}
                                      className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                      title="اعتماد الطلب وخصم الرصيد"
                                    >
                                      <Check size={12} /> اعتماد
                                    </button>
                                    <button
                                      onClick={() => updateStatus(req.id, 'rejected')}
                                      className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                      title="رفض الطلب"
                                    >
                                      <X size={12} /> رفض
                                    </button>
                                  </>
                                )}
                                {req.status === 'approved' && req.leaveType === 'annual' && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSettlementReq(req)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                      req.settlementDone
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-[#714B67] hover:bg-[#5a3a52] text-white'
                                    }`}
                                    title="صرف راتب الإجازة مقدماً وفق المادة 71 من قانون العمل الكويتي"
                                  >
                                    <Plane size={12} />
                                    <span>{req.settlementDone ? 'تمت التسوية' : 'تسوية مسبقة للراتب قبل السفر'}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredRequests.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 font-bold text-sm">
                            لا توجد طلبات تطابق الفلتر الحالي.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Calendar / Gantt Views */}
          {(viewMode === 'calendar' || viewMode === 'gantt') && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <CalendarDays size={48} className="text-slate-300 mb-4" />
              <h2 className="text-lg font-bold text-slate-700">طريقة العرض '{viewMode === 'calendar' ? 'التقويم' : 'مخطط جانت'}'</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md text-center">
                تُعرض هنا الإجازات على شكل خط زمني لمعرفة التداخلات في الكادر الطبي والموظفين بناءً على تواريخ البدء والانتهاء للموظفين المعتمدة طلباتهم.
              </p>
              
              <div className="mt-8 w-full max-w-3xl space-y-3">
                {filteredRequests.filter(r => r.status === 'approved' || r.status === 'pending').slice(0,4).map(req => (
                  <div key={req.id} className="relative w-full bg-slate-50 border rounded-lg p-3 flex items-center">
                    <div className="w-1/4 truncate pr-2 font-bold text-xs text-slate-700">{req.employeeName}</div>
                    <div className="w-3/4 relative h-6 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`absolute top-0 bottom-0 right-10 left-20 rounded-full ${req.status === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-80 flex items-center px-3 text-[10px] text-white font-bold overflow-hidden whitespace-nowrap`}>
                        {req.startDate} إلى {req.endDate} ({req.daysCount} أيام)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: ALLOCATIONS (Odoo 18 Time Off Allocations View) */}
      {activeMainTab === 'allocations' && (
        <div className="space-y-4">
          {/* Allocations Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">سجل الأرصدة المرحلة والافتتاحية (Allocations History)</h3>
                <p className="text-[11px] text-slate-500">إجمالي الأرصدة المرحلة المسجلة: <strong className="text-purple-700">+{totalCarriedDays.toFixed(1)} يوم</strong></p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAllocationModal(true)}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle size={14} /> إضافة وتخصيص رصيد مرحّل جديد
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">رقم السجل</th>
                  <th className="p-3.5">الموظف المستفيد</th>
                  <th className="p-3.5">نوع الإجازة</th>
                  <th className="p-3.5">سنة الاستحقاق المرحل منها</th>
                  <th className="p-3.5">عدد الأيام الممنوحة</th>
                  <th className="p-3.5">تاريخ التخصيص</th>
                  <th className="p-3.5">ملاحظات وسبب التخصيص</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-500">{a.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{a.employeeName}</div>
                      {a.employeeId && <div className="text-[10px] font-mono text-slate-400">{a.employeeId}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                        إجازة سنوية
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-purple-700">{a.fromYear}</td>
                    <td className="p-3.5 font-mono font-black text-emerald-700 text-sm">+{a.days.toFixed(1)} يوم</td>
                    <td className="p-3.5 font-mono text-slate-600">{a.allocationDate}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate" title={a.notes}>{a.notes}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 size={10} /> معتمد ومضاف
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteAllocation(a.id, a.employeeName, a.days)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="حذف سطر التخصيص"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-bold text-sm">
                      لا توجد أرصدة مرحّلة مسجلة حتى الآن. اضغط على "إضافة وتخصيص رصيد مرحّل جديد" للبدء.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE SETTLEMENT CALCULATOR */}
      {activeMainTab === 'encashment' && (
        <div className="animate-in fade-in duration-300">
          <LeaveSettlementCalculator employees={companyEmployees as any} />
        </div>
      )}

      {/* --- MODAL 1: SMART APPLY FOR NEW LEAVE --- */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="text-[#714B67]" size={20} />
                تقديم طلب إجازة ذكي (New Leave Request)
              </h3>
              <button type="button" onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الموظف *</label>
                  <select
                    value={newRequest.employeeId}
                    onChange={(e) => handleRequestEmployeeChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] bg-white font-bold"
                  >
                    {companyEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / الإدارة</label>
                  <input
                    type="text"
                    value={newRequest.department}
                    readOnly
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الإجازة *</label>
                <select
                  value={newRequest.leaveType}
                  onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] font-semibold text-slate-900"
                >
                  <option value="annual">إجازة سنوية اعتيادية (30 يوم/سنة - مادة 70)</option>
                  <option value="sick">إجازة مرضية (مدفوعة / نصف أجر - تقرير طبي)</option>
                  <option value="emergency">إجازة طارئة (تخصم من السنوية)</option>
                  <option value="hajj">إجازة أداء فريضة الحج (21 يوم - مادة 76)</option>
                  <option value="maternity">إجازة وضع وأمومة (70 يوم - مادة 24)</option>
                  <option value="bereavement">إجازة عزاء وحداد (3 أيام - مادة 77)</option>
                  <option value="unpaid">إجازة بدون راتب</option>
                </select>
              </div>

              {/* Medical Certificate Upload if Sick Leave */}
              {newRequest.leaveType === 'sick' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <Upload className="text-blue-600 mt-1" size={20} />
                  <div className="flex-1">
                    <label className="block font-bold text-blue-900 mb-1">المرفقات والتقارير الطبية (Medical Certificate)</label>
                    <p className="text-[10px] text-blue-700 mb-2">يرجى رفع نسخة من التقرير الطبي المعتمد من وزارة الصحة أو المستشفى لتبرير الإجازة المرضية.</p>
                    <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition cursor-pointer" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ البدء *</label>
                  <input
                    type="date"
                    required
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء *</label>
                  <input
                    type="date"
                    required
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                <input 
                  type="checkbox" 
                  id="excludeHolidays" 
                  checked={newRequest.excludeHolidays}
                  onChange={(e) => setNewRequest({...newRequest, excludeHolidays: e.target.checked})}
                  className="w-4 h-4 text-[#714B67] rounded focus:ring-[#714B67] cursor-pointer"
                />
                <label htmlFor="excludeHolidays" className="font-bold text-slate-700 cursor-pointer">
                  استبعاد العطلات الرسمية وعطلات نهاية الأسبوع (Smart Calculation)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدة الفعلية المحتسبة</label>
                  <div className="text-xl font-black text-emerald-700 font-mono">
                    {calculateDays(newRequest.startDate, newRequest.endDate, newRequest.excludeHolidays)} <span className="text-xs text-slate-500 font-normal">أيام</span>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموظف البديل لتغطية المهام (Covering Staff)</label>
                  <select
                    value={newRequest.replacementEmployee}
                    onChange={(e) => setNewRequest({ ...newRequest, replacementEmployee: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#714B67]"
                  >
                    <option value="">بدون موظف بديل</option>
                    {companyEmployees.filter(e => e.id !== newRequest.employeeId).map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السبب / ملاحظات</label>
                <input
                  type="text"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="سبب طلب الإجازة..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowApplyModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold cursor-pointer transition hover:bg-slate-200 text-slate-700">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-[#714B67] text-white rounded-lg font-bold cursor-pointer hover:bg-[#5a3a52] transition shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> تقديم وحفظ الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TIME OFF ALLOCATION MODAL (ODOO 18 ENTERPRISE STYLE) --- */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#714B67] text-white rounded-xl shadow-xs">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    تخصيص رصيد إجازات مرحّل (Time Off Allocation)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    نموذج تخصيص الرصيد الافتتاحي والمرحل وفق نظام Odoo 18
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAllocationModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 font-bold cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAllocation} className="space-y-4">
              
              {/* Field 1: Employee ID & Name (Dropdown) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User size={13} className="text-[#714B67]" />
                  <span>اسم الموظف المستفيد (employee_id) *</span>
                </label>
                <select
                  required
                  value={newAllocation.employeeId}
                  onChange={(e) => handleAllocationEmployeeChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] font-bold text-slate-800 shadow-2xs"
                >
                  {companyEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} | {emp.jobTitle || 'موظف'} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2 & 3: Days count & Accrual Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    عدد الأيام الممنوحة (number_of_days) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="120"
                    required
                    value={newAllocation.days}
                    onChange={(e) => setNewAllocation({ ...newAllocation, days: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none font-mono font-black text-emerald-700 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] text-sm"
                    placeholder="12.5"
                  />
                  {/* Quick Select Badges */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">خيارات سريعة:</span>
                    {[5, 10, 12.5, 15, 30].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewAllocation({ ...newAllocation, days: String(val) })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          parseFloat(newAllocation.days) === val 
                            ? 'bg-purple-700 text-white' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    سنة الترحيل (accrual_year) *
                  </label>
                  <select
                    required
                    value={newAllocation.fromYear}
                    onChange={(e) => setNewAllocation({ ...newAllocation, fromYear: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none font-mono font-bold focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="2025">2025 (العام السابق)</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2026">2026 (تخصيص استثنائي)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-1">تحديد السنة التي استُحق عنها الرصيد المرحل</span>
                </div>
              </div>

              {/* Field 4: Leave Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الرصيد المخصص (Leave Type)</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="font-bold text-slate-800">إجازة سنوية اعتيادية (Annual Leave - مادة 70)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">30 يوم/سنة</span>
                </div>
              </div>

              {/* Field 5: Notes & Documentation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  سبب التخصيص والتوثيق الإداري (notes) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAllocation.notes}
                  onChange={(e) => setNewAllocation({ ...newAllocation, notes: e.target.value })}
                  placeholder="سبب ترحيل وإضافة الرصيد..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] text-xs"
                />
              </div>

              {/* Live Preview Summary Card */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] space-y-1.5">
                <div className="flex items-center justify-between font-bold text-purple-950">
                  <span className="flex items-center gap-1">
                    <Sparkles size={13} className="text-purple-700" />
                    معاينة أثر التخصيص على رصيد الموظف:
                  </span>
                  <span>{selectedEmpForAlloc?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-purple-200/60 font-mono">
                  <span>الرصيد المرحل الحالي:</span>
                  <span className="font-bold">+{empAllocatedDaysTotal.toFixed(1)} يوم</span>
                </div>
                <div className="flex items-center justify-between text-purple-900 font-mono">
                  <span>الرصيد المضاف الجديد:</span>
                  <span className="font-black text-emerald-700">+{parseFloat(newAllocation.days || '0').toFixed(1)} يوم</span>
                </div>
                <div className="flex items-center justify-between text-slate-900 font-bold pt-1 border-t border-purple-200/60 font-mono">
                  <span>إجمالي الرصيد المرحل بعد الاعتماد:</span>
                  <span className="text-[#714B67] font-black text-xs">
                    +{(empAllocatedDaysTotal + (parseFloat(newAllocation.days) || 0)).toFixed(1)} يوم
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info size={12} /> يحفظ في قاعدة البيانات والذاكرة المحلية
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllocationModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold cursor-pointer transition shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={15} /> اعتماد وإضافة الرصيد
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: LEAVE SETTLEMENT & ADVANCE SALARY (KUWAIT LAW ART 71) --- */}
      {selectedSettlementReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border text-xs my-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plane className="text-[#714B67]" size={20} />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">سند تسوية مسبقة للراتب قبل السفر (Leave Settlement)</h3>
                  <p className="text-[10px] text-slate-400">صرف مستحقات إجازة مقدمة (تنفيذاً للمادة 71 من قانون العمل الكويتي رقم 6 لسنة 2010)</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedSettlementReq(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <span className="text-slate-400 block text-[10px]">الموظف المسافر:</span>
                  <span className="font-bold text-slate-900">{selectedSettlementReq.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">الرقم المدني:</span>
                  <span className="font-mono font-bold">{selectedSettlementReq.civilId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">فترة الإجازة:</span>
                  <span className="font-bold text-slate-800">{selectedSettlementReq.startDate} ({selectedSettlementReq.daysCount} يوم)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">الراتب الشامل:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedSettlementReq.totalSalary.toFixed(3)} د.ك</span>
                </div>
              </div>

              <table className="w-full text-right border rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">البند المالي المستحق للصرف</th>
                    <th className="p-2.5">البيان والأساس القانوني</th>
                    <th className="p-2.5 text-left">المبلغ (د.ك)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2.5 font-bold">راتب الإجازة السنوية مقدماً</td>
                    <td className="p-2.5 text-slate-500">أجر {selectedSettlementReq.daysCount} يوماً مدفوعة الأجر مقدماً (مادة 71)</td>
                    <td className="p-2.5 font-mono font-bold text-left text-purple-900">
                      {((selectedSettlementReq.daysCount / 30) * selectedSettlementReq.totalSalary).toFixed(3)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">بدل تذاكر السفر السنوية</td>
                    <td className="p-2.5 text-slate-500">استحقاق تذكرة سفر نقدية سنوية</td>
                    <td className="p-2.5 font-mono font-bold text-left">120.000</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 text-emerald-900 font-black border-t-2 border-emerald-300">
                    <td className="p-3 text-sm">صافي المبلغ المستحق للتحويل البنكي (WPS):</td>
                    <td></td>
                    <td className="p-3 text-base font-mono text-left">
                      {(((selectedSettlementReq.daysCount / 30) * selectedSettlementReq.totalSalary) + 120).toFixed(3)} د.ك
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <strong>تأكيد إداري:</strong> عند اعتماد هذه التسوية المسبقة، يتم إدراج المبلغ وتوجيهه مباشرة لبرنامج مسير الرواتب ليتم تحويله في ملف البنوك (WPS / SIF) كأجر مدفوع مقدماً، ويستبعد تلقائياً من مسير راتب الشهر القادم لعدم التكرار.
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  type="button"
                  onClick={() => safePrintAction('طباعة التقرير')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
                >
                  <Printer size={14} /> طباعة السند (A4)
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSettlementReq(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold cursor-pointer hover:bg-slate-200 transition"
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    onClick={() => markSettlementPaid(selectedSettlementReq.id)}
                    className="px-5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 size={15} /> اعتماد وترحيل للرواتب
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdooTimeOffApp;

