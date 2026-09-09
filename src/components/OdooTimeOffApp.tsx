import React, { useState, useEffect, useMemo } from 'react';
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
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  ShieldCheck,
  Ban,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-hot-toast';
import { LeaveSettlementCalculator } from './LeaveSettlementCalculator';
import { calculate2026AccruedDays, getCarriedOverBalance, getGlobalCompensatoryDays, calculateActualLeaveDays } from '../utils/kuwaitLaw';
import { computeFifoLeaveAllocations, buildEmployeeBaselineAllocations } from '../services/leaveService';

// Time Off Sub-components
import { PrintableLeaveFormModal } from './timeoff/PrintableLeaveFormModal';
import { ReturnToWorkModal } from './timeoff/ReturnToWorkModal';
import { LeaveRejectionModal } from './timeoff/LeaveRejectionModal';
import { LeavePolicyWizardModal, getLeaveMasterPolicy, LeavePolicyData } from './leaves/LeavePolicyWizardModal';
import { AbsenceTimelineView } from './timeoff/AbsenceTimelineView';

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
  status: 'draft' | 'pending' | 'pending_manager' | 'pending_hr' | 'approved' | 'rejected' | 'returned';
  appliedDate: string;
  replacementEmployee?: string;
  basicSalary: number;
  totalSalary: number;
  settlementDone?: boolean;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  hrApprovedBy?: string;
  hrApprovedAt?: string;
  rejectionReason?: string;
  returnedToWorkDate?: string;
  returnedToWorkNotes?: string;
  advanceSalarySettled?: boolean;
  advanceSalaryAmount?: number;
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
  maternity: { label: 'إجازة وضع وأمومة', color: 'bg-pink-100 text-pink-800 border-pink-300', maxDaysRule: 'مادة 24 - 70 يوماً بأجر كامل' },
  emergency: { label: 'إجازة طارئة', color: 'bg-orange-100 text-orange-800 border-orange-300', maxDaysRule: 'تخصم من الرصيد السنوي' },
  unpaid: { label: 'إجازة بدون راتب', color: 'bg-gray-100 text-gray-700 border-gray-300', maxDaysRule: 'بموافقة صاحب العمل' },
};

const STORAGE_KEY_ALLOCATIONS = 'odoo_leave_allocations_v2';
const STORAGE_KEY_REQUESTS = 'odoo_leave_requests_v2';

const DEFAULT_SAMPLE_REQUESTS: LeaveRequest[] = [];

export const OdooTimeOffApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees, leaveAccruals, updateLeaveAccrual, processMonthlyAccruals } = useOdooHierarchy();

  // 1. DATA STATES (with LocalStorage persistence)
  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading leave requests from storage', e);
    }
    return [];
  });

  const handleDeleteRequest = (id: string, empName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف طلب الإجازة للموظف (${empName}) نهائياً؟`)) {
      const updated = requests.filter(r => r.id !== id);
      setRequests(updated);
      try {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update storage on delete', e);
      }
      toast.success('تم حذف طلب الإجازة بنجاح.');
    }
  };

  const handleClearAllSampleData = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع طلبات وسجلات الإجازات الحالية؟')) {
      setRequests([]);
      try {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify([]));
      } catch (e) {
        console.error('Failed to clear requests storage', e);
      }
      toast.success('تم مسح كافة طلبات الإجازات بنجاح.');
    }
  };

  const [allocations, setAllocations] = useState<LeaveAllocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALLOCATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading allocations from storage', e);
    }
    return [];
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

  // Unified Employees List
  const companyEmployees = (employees && employees.length > 0) ? employees : [];

  // Main navigation tabs: requests, timeline, allocations, finance
  const [activeMainTab, setActiveMainTab] = useState<'requests' | 'timeline' | 'allocations' | 'finance'>('requests');
  const [financeSubTab, setFinanceSubTab] = useState<'advance_salary' | 'encashment_calculator'>('advance_salary');

  // Filters & Search for Requests
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Control States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showPolicyWizardModal, setShowPolicyWizardModal] = useState(false);
  const [leavePolicy, setLeavePolicy] = useState<LeavePolicyData>(() => getLeaveMasterPolicy());

  useEffect(() => {
    const handlePolicyUpdated = () => {
      setLeavePolicy(getLeaveMasterPolicy());
    };
    window.addEventListener('timeoff_policy_updated', handlePolicyUpdated);
    return () => window.removeEventListener('timeoff_policy_updated', handlePolicyUpdated);
  }, []);

  const [selectedSettlementReq, setSelectedSettlementReq] = useState<LeaveRequest | null>(null);
  const [selectedPrintReq, setSelectedPrintReq] = useState<LeaveRequest | null>(null);
  const [selectedReturnReq, setSelectedReturnReq] = useState<LeaveRequest | null>(null);
  const [rejectionModalState, setRejectionModalState] = useState<{ req: LeaveRequest; stageLabel: string } | null>(null);

  // Helper to dynamically calculate employee leave balance linked to their Contract & Fiscal Year
  const getEmployeeContractBalance = (empId: string) => {
    const emp = companyEmployees.find(e => e.id === empId);
    const empAny = emp as any;
    const contractStartStr = empAny?.joinDate || empAny?.contractStartDate || empAny?.date_start || empAny?.startDate || '2026-01-01';
    const contractEndStr = empAny?.contractEndDate || empAny?.date_end || '2027-12-31';

    const mappedAllocations = allocations.map(a => ({
      ...a,
      numberOfDays: a.days,
      allocationType: 'regular',
      state: 'validate',
      name: a.notes,
      dateFrom: a.allocationDate
    }));

    let carried = 0;
    let earned = 0;
    let consumed = 0;
    let available = 0;

    if (emp) {
      const empAllocs = buildEmployeeBaselineAllocations(emp as any, mappedAllocations as any);
      const fifo = computeFifoLeaveAllocations(emp as any, empAllocs, requests as any);
      
      const totalOpening = fifo.allocations.filter(a => a.allocationType === 'regular').reduce((s, a) => s + (a.numberOfDays || 0), 0);
      const totalAccrued = fifo.allocations.filter(a => a.allocationType === 'accrual' && !a.name?.includes('تعويضي') && !a.name?.includes('بديل') && !a.name?.includes('عطلة')).reduce((s, a) => s + (a.numberOfDays || 0), 0);
      const totalCompensatory = getGlobalCompensatoryDays(emp as any);
      
      carried = totalOpening;
      earned = totalAccrued + totalCompensatory;
      consumed = fifo.totalConsumed;
      available = Math.max(0, (carried + earned) - consumed);
    }

    const startYear = contractStartStr ? contractStartStr.slice(0, 4) : '2025';
    const endYear = contractEndStr ? contractEndStr.slice(0, 4) : '2027';

    return {
      emp,
      carried,
      earned,
      consumed,
      available,
      contractStartStr,
      contractEndStr,
      fiscalYearLabel: `السنة المالية للعقد (${startYear} - ${endYear})`,
      contractRef: (emp as any)?.contractRef || `KW-CNT-${empId}-${startYear}`
    };
  };

  // Form Inputs - Leave Request
  const [newRequest, setNewRequest] = useState({
    employeeId: companyEmployees[0]?.id || '',
    employeeName: companyEmployees[0]?.name || (companyEmployees[0] as any)?.fullNameAr || '',
    civilId: companyEmployees[0]?.civilId || '',
    department: companyEmployees[0]?.department || '',
    leaveType: 'annual' as LeaveRequest['leaveType'],
    startDate: '2026-09-10',
    endDate: '2026-09-24',
    reason: '',
    replacementEmployee: '',
    basicSalary: companyEmployees[0]?.basicSalary || 0,
    totalSalary: (companyEmployees[0] as any)?.totalSalary || (companyEmployees[0] as any)?.salary || 0,
    excludeHolidays: true
  });

  // Calculate live days breakdown with Kuwait law public holidays & weekend deduction
  const requestDurationBreakdown = useMemo(() => {
    return calculateActualLeaveDays(newRequest.startDate, newRequest.endDate);
  }, [newRequest.startDate, newRequest.endDate]);

  // Check overlaps for new request
  const newRequestOverlaps = useMemo(() => {
    if (!newRequest.startDate || !newRequest.endDate) return { teamOverlaps: [], replacementOverlap: false };

    const teamOverlaps = requests.filter(r => 
      (r.status === 'approved' || r.status === 'pending_manager' || r.status === 'pending_hr') &&
      r.employeeId !== newRequest.employeeId &&
      r.department && r.department === newRequest.department &&
      r.startDate <= newRequest.endDate && r.endDate >= newRequest.startDate
    );

    const replacementOverlap = requests.some(r =>
      (r.status === 'approved' || r.status === 'pending_manager' || r.status === 'pending_hr') &&
      (r.employeeName === newRequest.replacementEmployee || r.employeeId === newRequest.replacementEmployee) &&
      r.startDate <= newRequest.endDate && r.endDate >= newRequest.startDate
    );

    return { teamOverlaps, replacementOverlap };
  }, [requests, newRequest]);

  // Form Inputs - Time Off Allocation (Odoo 18 Enterprise Form Fields)
  const [newAllocation, setNewAllocation] = useState({
    employeeId: companyEmployees[0]?.id || '',
    employeeName: companyEmployees[0]?.name || (companyEmployees[0] as any)?.fullNameAr || '',
    fromYear: '2026',
    days: '0',
    leaveType: 'annual',
    notes: ''
  });

  const handleAllocationEmployeeChange = (empId: string) => {
    const selected = companyEmployees.find(e => e.id === empId);
    if (selected) {
      setNewAllocation({
        ...newAllocation,
        employeeId: selected.id,
        employeeName: selected.name || (selected as any).fullNameAr || ''
      });
    }
  };

  const handleEmployeeChange = (empId: string) => {
    const selected = companyEmployees.find(e => e.id === empId);
    if (selected) {
      setNewRequest({
        ...newRequest,
        employeeId: selected.id,
        employeeName: selected.name || (selected as any).fullNameAr || '',
        civilId: selected.civilId || '',
        department: selected.department || '',
        basicSalary: selected.basicSalary || 0,
        totalSalary: (selected as any).totalSalary || (selected as any).salary || 0
      });
    }
  };

  // Handlers for Request Creation
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const count = newRequest.excludeHolidays ? requestDurationBreakdown.actualDays : requestDurationBreakdown.totalDays;

    if (count <= 0) {
      toast.error('يرجى اختيار تواريخ صحيحة بحيث تتضمن أيام عمل محتسبة.');
      return;
    }

    // Check available balance for Annual Leave
    if (newRequest.leaveType === 'annual') {
      const empId = newRequest.employeeId || companyEmployees[0]?.id || '';
      const { available } = getEmployeeContractBalance(empId);

      if (count > available) {
        const excess = count - available;
        const confirmOverride = window.confirm(
          `الرصيد غير كافٍ!\nرصيد الموظف المتاح وفق استحقاق العقد هو ${available.toFixed(2)} يوم فقط، بينما المطلوب ${count} أيام.\n\nهل ترغب بالسماح بتجاوز الرصيد بمقدار (${excess.toFixed(2)} يوم) على أن يتم إدراج الأيام الزائدة كأيام غير مدفوعة تُخصم من مدة الخدمة عند النهاية؟`
        );
        if (!confirmOverride) return;
      }
    }

    const created: LeaveRequest = {
      id: `LV-2026-00${requests.length + 1}`,
      employeeId: newRequest.employeeId || companyEmployees[0]?.id || '',
      employeeName: newRequest.employeeName || 'موظف جديد',
      civilId: newRequest.civilId,
      department: newRequest.department,
      leaveType: newRequest.leaveType,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      daysCount: count,
      reason: newRequest.reason || 'إجازة اعتيادية',
      status: 'pending_manager', // Starts at step 1 (Direct Manager Approval)
      appliedDate: new Date().toISOString().split('T')[0],
      replacementEmployee: newRequest.replacementEmployee,
      basicSalary: newRequest.basicSalary,
      totalSalary: newRequest.totalSalary,
      settlementDone: false
    };

    setRequests([created, ...requests]);
    setShowApplyModal(false);
    toast.success('تم تقديم طلب الإجازة بنجاح، بانتظار موافقة المدير المباشر (المرحلة الأولى).');
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

  // 2-Step Approval Workflow:
  // Step 1: Manager approves -> status becomes pending_hr
  const handleManagerApprove = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setRequests(requests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'pending_hr',
          managerApprovedBy: 'مدير القسم المباشر',
          managerApprovedAt: todayStr
        };
      }
      return req;
    }));
    toast.success('تمت موافقة المدير المباشر بنجاح، وأحيل الطلب إلى إدارة الموارد البشرية للاعتماد النهائي.');
  };

  // Step 2: HR approves -> status becomes approved
  const handleHrApprove = (id: string) => {
    const targetReq = requests.find(r => r.id === id);
    if (!targetReq) return;

    // Balance check
    if (targetReq.leaveType === 'annual') {
      const current = leaveAccruals?.[targetReq.employeeId];
      const carried = current?.carriedFrom2025 || 0;
      const earned = current?.earned2026 || 0;
      const consumed = current?.consumedDays || 0;
      const available = (carried + earned) - consumed;

      if (targetReq.daysCount > available) {
        const excess = targetReq.daysCount - available;
        const confirmOverride = window.confirm(
          `تنبيه تجاوز الرصيد!\n\nالرصيد المتاح للموظف (${available.toFixed(2)} يوم) أقل من الإجازة المطلوبة (${targetReq.daysCount}).\n\nهل أنت متأكد من اعتماد الإجازة والموافقة على تجاوز الرصيد بمقدار (${excess.toFixed(2)} يوم)؟ سيتم خصم هذه الأيام الزائدة تلقائياً من أيام خدمة الموظف.`
        );
        if (!confirmOverride) return;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    setRequests(requests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'approved',
          hrApprovedBy: 'إدارة الموارد البشرية والشؤون القانونية',
          hrApprovedAt: todayStr
        };
      }
      return req;
    }));

    // Update context
    if (targetReq.employeeId && updateLeaveAccrual) {
      const current = leaveAccruals?.[targetReq.employeeId];
      const carried = current?.carriedFrom2025 || 0;
      const earned = current?.earned2026 || 0;
      const prevConsumed = current?.consumedDays || 0;
      updateLeaveAccrual(targetReq.employeeId, carried, earned, prevConsumed + targetReq.daysCount);
    }

    toast.success('تم الاعتماد النهائي للإجازة وتحديث رصيد الموظف وسجلاته الرسمية.');
  };

  // Rejection with reason modal confirm
  const handleConfirmRejection = (requestId: string, reason: string) => {
    setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'rejected', rejectionReason: reason } : r));
    setRejectionModalState(null);
    toast.success('تم تسجيل قرار الرفض وتوثيق الأسباب في سجل الطلب.');
  };

  // Return to work confirm
  const handleConfirmReturnToWork = (requestId: string, returnDate: string, notes: string, diffDays: number) => {
    setRequests(requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'returned',
          returnedToWorkDate: returnDate,
          returnedToWorkNotes: notes
        };
      }
      return r;
    }));

    setSelectedReturnReq(null);
    if (diffDays > 0) {
      toast.success(`تم تسجيل مباشرة العمل مع رصد تأخير (+${diffDays} يوم) تم إخطار قسم الرواتب بها.`);
    } else if (diffDays < 0) {
      toast.success(`تم تسجيل مباشرة العمل مبكراً قبل الموعد بـ (${Math.abs(diffDays)} يوم).`);
    } else {
      toast.success('تم تسجيل مباشرة العمل في الموعد المحدد بنجاح.');
    }
  };

  const handleRunMonthlyAccrual = () => {
    if (processMonthlyAccruals) {
      processMonthlyAccruals();
      toast.success('تم تشغيل الاستحقاق الشهري بنجاح: إضافة 2.5 يوم لرصيد جميع الموظفين النشطين (يوم 30 شهرياً).');
    }
  };

  const markSettlementPaid = (id: string) => {
    setRequests(requests.map(req => req.id === id ? { ...req, settlementDone: true } : req));
    toast.success('تم اعتماد التسوية المسبقة، وتم ترحيل المستحقات لمسير الرواتب بنجاح.');
    setSelectedSettlementReq(null);
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const isPending = req.status === 'pending' || req.status === 'pending_manager' || req.status === 'pending_hr';
    const matchesFilter = 
      selectedFilter === 'all' || 
      req.status === selectedFilter ||
      (selectedFilter === 'pending' && isPending);

    const matchesSearch = 
      req.employeeName.includes(searchQuery) || 
      req.id.includes(searchQuery) || 
      req.reason.includes(searchQuery) ||
      (req.department && req.department.includes(searchQuery));

    return matchesFilter && matchesSearch;
  });

  const totalCarriedDays = allocations.reduce((acc, a) => acc + a.days, 0);

  // Selected Employee Details for Allocation Preview
  const selectedEmpForAlloc = companyEmployees.find(e => e.id === newAllocation.employeeId) || companyEmployees[0];
  const empAllocatedDaysTotal = allocations
    .filter(a => a.employeeId === selectedEmpForAlloc?.id || a.employeeName === selectedEmpForAlloc?.name)
    .reduce((acc, a) => acc + a.days, 0);

  // Stats calculation
  const pendingRequestsCount = requests.filter(r => r.status === 'pending' || r.status === 'pending_manager' || r.status === 'pending_hr').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const activeLeavesTodayCount = requests.filter(r => r.status === 'approved' && r.startDate <= todayStr && r.endDate >= todayStr).length;

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Top Header with Clean Enterprise Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">نظام إدارة الإجازات والغياب (Time Off)</h1>
              <span className="bg-[#714B67]/10 text-[#714B67] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Odoo 18 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | قانون العمل الكويتي رقم 6 لسنة 2010
            </p>
          </div>
        </div>

        {/* Top Actions: Streamlined without duplicate buttons */}
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
                'الحالة': r.status === 'approved' ? 'معتمدة' : r.status === 'returned' ? 'تمت مباشرة العمل' : r.status.includes('pending') ? 'قيد المراجعة' : 'مرفوضة',
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
            <span>طباعة السجل</span>
          </button>

          {requests.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllSampleData}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              title="حذف جميع الطلبات الحالية"
            >
              <Trash2 size={14} className="text-rose-600" />
              <span>حذف كل الطلبات</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPolicyWizardModal(true)}
            className="bg-purple-900 hover:bg-purple-950 text-white border border-purple-800 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            title="تثبيت وتهيئة لائحة الإجازات الرسمية (Leave Policy Wizard)"
          >
            <ShieldCheck size={15} className="text-amber-300" />
            <span>لائحة وقواعد الإجازات</span>
          </button>

          <button
            type="button"
            onClick={handleRunMonthlyAccrual}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            title={`تشغيل إضافة الاستحقاق الشهري التلقائي (+${leavePolicy.monthlyAccrualRate} يوم لجميع الموظفين النشطين يوم 30)`}
          >
            <RefreshCw size={14} className="text-emerald-600" /> استحقاق الشهر (+{leavePolicy.monthlyAccrualRate} يوم)
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

      {/* Metric Cards - Live Odoo Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Annual Legal Quota */}
        <div 
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
          onClick={() => setShowPolicyWizardModal(true)}
          title="انقر لتعديل لائحة وقواعد الإجازات"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>الرصيد السنوي اللائحي</span>
            <Calendar className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {leavePolicy.annualDays.toFixed(1)} <span className="text-xs font-normal text-slate-500">يوم / سنة</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} /> +{leavePolicy.monthlyAccrualRate} يوم/شهرياً (مادة 70)
            </span>
            <span className="text-purple-700 underline">تعديل اللائحة</span>
          </div>
        </div>

        {/* Card 2: Carried Over Balances */}
        <div 
          className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs cursor-pointer hover:border-purple-400 hover:shadow-md transition group" 
          onClick={() => { setActiveMainTab('allocations'); setShowAllocationModal(true); }}
          title="انقر لفتح نافذة تخصيص وترحيل الرصيد"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span className="text-purple-900 group-hover:text-[#714B67]">رصيد الإجازات المرحّل</span>
            <Layers className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-700">+{totalCarriedDays.toFixed(1)} <span className="text-xs font-normal text-slate-500">أيام معتمدة</span></div>
          <div className="text-[10px] text-purple-700 mt-1 flex items-center gap-1 font-bold group-hover:underline">
            <PlusCircle size={12} /> تخصيص رصيد مرحّل جديد
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>طلبات قيد المراجعة والاعتماد</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {pendingRequestsCount} <span className="text-xs font-normal text-slate-500">طلب معلق</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">تتطلب اعتماد المدير / الموارد البشرية</div>
        </div>

        {/* Card 4: Active Leaves Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>الموظفون في إجازة اليوم</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {activeLeavesTodayCount} <span className="text-xs font-normal text-slate-500">موظف مجاز</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">تغطية الأقسام مستقرة ومؤمنة</div>
        </div>

      </div>

      {/* Main Four Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveMainTab('requests')}
          className={`px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'requests' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays size={15} /> طلبات الإجازات والاعتمادات ({requests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('timeline')}
          className={`px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'timeline' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart size={15} /> مخطط تداخل الغيابات وتغطية الأقسام (Timeline)
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('allocations')}
          className={`px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'allocations' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={15} /> الأرصدة الافتتاحية والمرحّلة ({allocations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('finance')}
          className={`px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'finance' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign size={15} /> المركز المالي لتسويات وبدل الإجازات (Settlements)
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: REQUESTS & 2-STEP APPROVALS LIST */}
      {/* ======================================================== */}
      {activeMainTab === 'requests' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'جميع الطلبات' },
                { id: 'pending', label: 'قيد الاعتماد' },
                { id: 'approved', label: 'المعتمدة' },
                { id: 'returned', label: 'تمت المباشرة' },
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
                    <th className="p-3.5">الموظف والقسم</th>
                    <th className="p-3.5">نوع الإجازة</th>
                    <th className="p-3.5">الفترة الزمنية</th>
                    <th className="p-3.5">المدة الفعلية</th>
                    <th className="p-3.5">الموظف البديل</th>
                    <th className="p-3.5">حالة الاعتماد</th>
                    <th className="p-3.5 text-center">الإجراءات والاعتماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => {
                    const leaveConfig = leaveTypeLabels[req.leaveType] || leaveTypeLabels.annual;
                    const isPendingManager = req.status === 'pending_manager' || req.status === 'pending';
                    const isPendingHr = req.status === 'pending_hr';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition">
                        
                        {/* ID */}
                        <td className="p-3.5 font-mono font-bold text-slate-500">{req.id}</td>
                        
                        {/* Employee & Dept */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{req.employeeName}</div>
                          <div className="text-[10px] text-slate-400">{req.department || 'الإدارة العامة'}</div>
                        </td>

                        {/* Leave Type */}
                        <td className="p-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${leaveConfig.color}`}>
                            {leaveConfig.label}
                          </span>
                          {req.leaveType === 'sick' && (
                            <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-1 font-semibold">
                              <FileText size={11} /> تقرير طبي مرفق
                            </div>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-slate-800">{req.startDate}</div>
                          <div className="text-[11px] text-slate-400">إلى {req.endDate}</div>
                        </td>

                        {/* Days */}
                        <td className="p-3.5">
                          <span className="font-black text-slate-900 text-sm">{req.daysCount}</span> <span className="text-slate-500">يوم</span>
                        </td>

                        {/* Replacement */}
                        <td className="p-3.5 text-slate-600 font-medium">
                          {req.replacementEmployee ? (
                            <div className="flex items-center gap-1">
                              <UserCheck size={13} className="text-emerald-600" />
                              <span>{req.replacementEmployee}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">بدون بديل</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5">
                          {isPendingManager && (
                            <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-300">
                              <Clock size={12} />
                              <span>1. بانتظار موافقة المدير</span>
                            </div>
                          )}

                          {isPendingHr && (
                            <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full text-[10px] font-bold border border-purple-300">
                              <ShieldCheck size={12} />
                              <span>2. بانتظار اعتماد الموارد البشرية</span>
                            </div>
                          )}

                          {req.status === 'approved' && (
                            <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-300">
                              <CheckCircle2 size={12} />
                              <span>معتمدة نهائياً</span>
                            </div>
                          )}

                          {req.status === 'returned' && (
                            <div className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-900 px-2.5 py-1 rounded-full text-[10px] font-bold border border-cyan-300">
                              <CheckCheck size={12} />
                              <span>تمت المباشرة ({req.returnedToWorkDate || 'الموعد'})</span>
                            </div>
                          )}

                          {req.status === 'rejected' && (
                            <div className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-[10px] font-bold border border-rose-300" title={req.rejectionReason || 'مرفوضة إدارياً'}>
                              <XCircle size={12} />
                              <span>مرفوضة</span>
                            </div>
                          )}
                        </td>

                        {/* Action Buttons: 2-step approval & official actions */}
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            
                            {/* Step 1: Direct Manager Approves */}
                            {isPendingManager && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleManagerApprove(req.id)}
                                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="الموافقة المبدئية وإحالة الطلب للموارد البشرية"
                                >
                                  <Check size={12} /> موافقة المدير
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectionModalState({ req, stageLabel: 'موافقة المدير المباشر' })}
                                  className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="رفض الطلب مع توثيق السبب"
                                >
                                  <X size={12} /> رفض
                                </button>
                              </>
                            )}

                            {/* Step 2: HR Final Approves */}
                            {isPendingHr && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleHrApprove(req.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="الاعتماد النهائي من الموارد البشرية وتحديث الرصيد"
                                >
                                  <ShieldCheck size={12} /> اعتماد نهائي (HR)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectionModalState({ req, stageLabel: 'اعتماد الموارد البشرية' })}
                                  className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="رفض الطلب مع توثيق السبب"
                                >
                                  <X size={12} /> رفض
                                </button>
                              </>
                            )}

                            {/* Approved State Actions */}
                            {req.status === 'approved' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPrintReq(req)}
                                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="طباعة نموذج إجازة رسمي A4 ثنائي اللغة"
                                >
                                  <Printer size={12} /> استمارة A4
                                </button>

                                {req.leaveType === 'annual' && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSettlementReq(req)}
                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                      req.settlementDone
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-[#714B67] hover:bg-[#5a3a52] text-white'
                                    }`}
                                    title="صرف راتب الإجازة مقدماً وفق المادة 71 من قانون العمل الكويتي"
                                  >
                                    <Plane size={12} />
                                    <span>{req.settlementDone ? 'تمت التسوية' : 'تسوية راتب مسبقة'}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedReturnReq(req)}
                                  className="px-2 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="تسجيل إشعار مباشرة العمل بعد انتهاء الإجازة"
                                >
                                  <RotateCcw size={12} /> مباشرة العمل
                                </button>
                              </>
                            )}

                            {/* Returned State */}
                            {req.status === 'returned' && (
                              <button
                                type="button"
                                onClick={() => setSelectedPrintReq(req)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="طباعة الاستمارة الرسمية متضمنة إشعار العودة"
                              >
                                <Printer size={12} /> الاستمارة الرسمية
                              </button>
                            )}

                            {/* Rejected State */}
                            {req.status === 'rejected' && req.rejectionReason && (
                              <span className="text-[10px] text-rose-600 italic truncate max-w-[150px]" title={req.rejectionReason}>
                                السبب: {req.rejectionReason}
                              </span>
                            )}

                            {/* Delete Request Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req.id, req.employeeName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                              title="حذف طلب الإجازة نهائياً"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold text-sm">
                        لا توجد طلبات إجازة تطابق البحث أو الفلتر المحدد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INTERACTIVE ABSENCE TIMELINE & TEAM COVERAGE */}
      {/* ======================================================== */}
      {activeMainTab === 'timeline' && (
        <div className="animate-in fade-in duration-300">
          <AbsenceTimelineView
            requests={requests}
            totalEmployeesCount={companyEmployees.length}
            onSelectRequest={(req) => setSelectedPrintReq(req)}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ALLOCATIONS & OPENING BALANCES */}
      {/* ======================================================== */}
      {activeMainTab === 'allocations' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">سجل الأرصدة الافتتاحية والمرحّلة (Leave Allocations)</h2>
              <p className="text-xs text-slate-500">إدارة أرصدة الإجازات السنوية المرحلة من السنوات السابقة وفق Odoo 18</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllocationModal(true)}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle size={15} /> إضافة رصيد مرحّل جديد
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">رقم السند</th>
                  <th className="p-3.5">اسم الموظف</th>
                  <th className="p-3.5">السنة المالية</th>
                  <th className="p-3.5">الأيام الممنوحة</th>
                  <th className="p-3.5">تاريخ التخصيص</th>
                  <th className="p-3.5">البيان والسبب</th>
                  <th className="p-3.5">المعتمد</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-500">{alloc.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{alloc.employeeName}</td>
                    <td className="p-3.5 font-mono text-purple-900 font-bold">{alloc.fromYear}</td>
                    <td className="p-3.5 font-mono font-black text-emerald-700 text-sm">+{alloc.days} يوم</td>
                    <td className="p-3.5 font-mono text-slate-500">{alloc.allocationDate}</td>
                    <td className="p-3.5 text-slate-600">{alloc.notes}</td>
                    <td className="p-3.5 text-slate-500">{alloc.allocatedBy || 'الموارد البشرية'}</td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteAllocation(alloc.id, alloc.employeeName, alloc.days)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="حذف سطر التخصيص"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      لا توجد أرصدة مرحّلة مسجلة حالياً. اضغط على "إضافة رصيد مرحّل جديد" لتسجيل رصيد افتتاحي.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: UNIFIED FINANCIAL SETTLEMENTS & ENCASHMENT */}
      {/* ======================================================== */}
      {activeMainTab === 'finance' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Sub Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-fit">
            <button
              type="button"
              onClick={() => setFinanceSubTab('advance_salary')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                financeSubTab === 'advance_salary' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane size={14} /> صرف راتب الإجازة مقدماً (المادة 71 قبل السفر)
            </button>
            <button
              type="button"
              onClick={() => setFinanceSubTab('encashment_calculator')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                financeSubTab === 'encashment_calculator' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator size={14} /> تصفية وبيع رصيد الإجازات (Encashment Calculator)
            </button>
          </div>

          {/* Sub-tab 1: Advance Salary Settlements */}
          {financeSubTab === 'advance_salary' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">سندات صرف راتب الإجازة السنوية مقدماً (تنفيذاً للمادة 71 من قانون العمل الكويتي):</strong>
                  <span>
                    يحق للعامل استلام أجره عن فترة الإجازة السنوية مقدماً قبل السفر مضافاً إليه بدل تذاكر السفر السنوية إن وجدت، ويتم ترحيل المبلغ آلياً لبرنامج الرواتب ليُدرج في ملف البنوك (WPS).
                  </span>
                </div>
              </div>

              {/* Table of Approved Annual Leaves eligible for advance pay */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">الموظف</th>
                      <th className="p-3.5">الرقم المدني</th>
                      <th className="p-3.5">فترة الإجازة</th>
                      <th className="p-3.5">الراتب الشامل</th>
                      <th className="p-3.5">أجر الإجازة المقدم (د.ك)</th>
                      <th className="p-3.5">بدل التذاكر</th>
                      <th className="p-3.5">صافي المستحق (WPS)</th>
                      <th className="p-3.5 text-center">حالة الصرف والإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.filter(r => r.status === 'approved' && r.leaveType === 'annual').map((req) => {
                      const advanceSalary = (req.daysCount / 30) * req.totalSalary;
                      const ticketAllowance = 120.000;
                      const totalPayable = advanceSalary + ticketAllowance;

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{req.employeeName}</div>
                            <div className="text-[10px] text-slate-400">{req.department}</div>
                          </td>
                          <td className="p-3.5 font-mono">{req.civilId}</td>
                          <td className="p-3.5 font-mono">
                            <div>{req.startDate}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{req.daysCount} يوم عمل</div>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-800">{req.totalSalary.toFixed(3)} د.ك</td>
                          <td className="p-3.5 font-mono font-bold text-purple-900">{advanceSalary.toFixed(3)} د.ك</td>
                          <td className="p-3.5 font-mono text-slate-600">{ticketAllowance.toFixed(3)} د.ك</td>
                          <td className="p-3.5 font-mono font-black text-emerald-700 text-sm">{totalPayable.toFixed(3)} د.ك</td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedSettlementReq(req)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 mx-auto cursor-pointer ${
                                req.settlementDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-[#714B67] hover:bg-[#5a3a52] text-white shadow-2xs'
                              }`}
                            >
                              <Plane size={12} />
                              <span>{req.settlementDone ? 'سند معتمد (عرض/طباعة)' : 'إصدار سند صرف مسبق'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {requests.filter(r => r.status === 'approved' && r.leaveType === 'annual').length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                          لا توجد إجازات سنوية معتمدة جاهزة للصرف المسبق حالياً.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Comprehensive Encashment Calculator */}
          {financeSubTab === 'encashment_calculator' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <LeaveSettlementCalculator employees={companyEmployees as any} />
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: NEW LEAVE REQUEST MODAL (With Kuwait Law Holiday Auto-Exclusion & Overlap Alert) */}
      {/* ======================================================== */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border text-xs my-8 space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-[#714B67]" size={20} />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">تقديم طلب إجازة رسمي جديد</h3>
                  <p className="text-[10px] text-slate-400">نظام Odoo 18 مع استبعاد العطلات الكويتية آلياً وفحص التعارضات</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowApplyModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5">
              
              {/* Employee Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموظف *</label>
                <select
                  required
                  value={newRequest.employeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] bg-white font-bold text-slate-800"
                >
                  {companyEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) - {emp.jobTitle || 'موظف'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الإجازة *</label>
                <select
                  value={newRequest.leaveType}
                  onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] bg-white font-bold"
                >
                  <option value="annual">إجازة سنوية اعتيادية (Annual Leave - مادة 70)</option>
                  <option value="sick">إجازة مرضية (Sick Leave - مادة 69)</option>
                  <option value="emergency">إجازة طارئة (Emergency Leave)</option>
                  <option value="hajj">إجازة حج (Hajj Leave - مادة 76)</option>
                  <option value="maternity">إجازة وضع وأمومة (Maternity Leave - مادة 24)</option>
                  <option value="bereavement">إجازة عزاء (Bereavement Leave - مادة 77)</option>
                  <option value="unpaid">إجازة بدون راتب (Unpaid Leave)</option>
                </select>

                {/* Annual Balance Preview Bar */}
                {newRequest.leaveType === 'annual' && (() => {
                  const balanceData = getEmployeeContractBalance(newRequest.employeeId);
                  return (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mt-2 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5 font-bold text-emerald-950">
                        <span>رصيد العقد المتاح ({balanceData.fiscalYearLabel}):</span>
                        <span className="font-mono text-emerald-800 font-black text-xs">
                          {balanceData.available.toFixed(1)} يوم متاح
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-[10px]">
                        <div className="bg-white/90 p-1 rounded border border-emerald-100">
                          <span className="text-slate-400 block text-[9px]">المرحل:</span>
                          <span className="font-bold text-emerald-800">+{balanceData.carried.toFixed(1)}</span>
                        </div>
                        <div className="bg-white/90 p-1 rounded border border-emerald-100">
                          <span className="text-slate-400 block text-[9px]">المكتسب 2026:</span>
                          <span className="font-bold text-emerald-800">+{balanceData.earned.toFixed(1)}</span>
                        </div>
                        <div className="bg-white/90 p-1 rounded border border-emerald-100">
                          <span className="text-slate-400 block text-[9px]">المستهلك:</span>
                          <span className="font-bold text-rose-700">-{balanceData.consumed.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Medical upload if sick */}
              {newRequest.leaveType === 'sick' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
                  <Upload className="text-blue-600 mt-0.5" size={18} />
                  <div className="flex-1">
                    <label className="block font-bold text-blue-900 mb-0.5">المرفقات والتقارير الطبية (Medical Certificate)</label>
                    <p className="text-[10px] text-blue-700 mb-1.5">يرجى رفع نسخة من التقرير الطبي المعتمد من وزارة الصحة لتبرير الإجازة المرضية.</p>
                    <input type="file" className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-600 file:text-white cursor-pointer" />
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ البدء *</label>
                  <input
                    type="date"
                    required
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء *</label>
                  <input
                    type="date"
                    required
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#714B67] font-mono"
                  />
                </div>
              </div>

              {/* Smart Kuwait Holidays Auto-Exclusion toggle & Live Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                  <input 
                    type="checkbox" 
                    id="excludeHolidays" 
                    checked={newRequest.excludeHolidays}
                    onChange={(e) => setNewRequest({...newRequest, excludeHolidays: e.target.checked})}
                    className="w-4 h-4 text-[#714B67] rounded focus:ring-[#714B67] cursor-pointer"
                  />
                  <label htmlFor="excludeHolidays" className="font-bold text-slate-700 cursor-pointer text-[11px]">
                    استبعاد العطلات الرسمية لدولة الكويت وعطلات نهاية الأسبوع آلياً (Kuwait Labor Law Smart Engine)
                  </label>
                </div>

                {/* Duration Breakdown Badge */}
                <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-950">
                    <span>المدة الفعلية المعتمدة المستقطعة من الرصيد:</span>
                    <span className="font-mono text-purple-900 font-black text-sm">
                      {newRequest.excludeHolidays ? requestDurationBreakdown.actualDays : requestDurationBreakdown.totalDays} يوم عمل
                    </span>
                  </div>
                  {newRequest.excludeHolidays && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-purple-200/60">
                      <span>إجمالي أيام الفترة: {requestDurationBreakdown.totalDays} يوم</span>
                      <span className="text-emerald-700 font-bold">
                        مستبعد: {requestDurationBreakdown.deductedWeekends} جمعة + {requestDurationBreakdown.deductedHolidays} عطلات رسمية للدولة
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Overlap & Conflict Warnings */}
              {newRequestOverlaps.teamOverlaps.length > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">تنبيه تداخل بالقسم ({newRequest.department}):</strong>
                    <span className="text-[11px]">
                      يوجد {newRequestOverlaps.teamOverlaps.length} موظف من نفس القسم في إجازة متزامنة: ({newRequestOverlaps.teamOverlaps.map(x => x.employeeName).join('، ')}).
                    </span>
                  </div>
                </div>
              )}

              {newRequestOverlaps.replacementOverlap && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2 animate-fade-in">
                  <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>تنبيه الموظف البديل: الزميل ({newRequest.replacementEmployee}) لديه إجازة مسجلة في نفس الفترة! يرجى اختيار بديل آخر.</span>
                </div>
              )}

              {/* Replacement Staff */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">الموظف البديل لتغطية المهام (Covering Staff)</label>
                <select
                  value={newRequest.replacementEmployee}
                  onChange={(e) => setNewRequest({ ...newRequest, replacementEmployee: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#714B67]"
                >
                  <option value="">بدون موظف بديل (أو تكليف مباشر من المدير)</option>
                  {companyEmployees.filter(e => e.id !== newRequest.employeeId).map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.department || 'موظف'})</option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">السبب / الملاحظات</label>
                <input
                  type="text"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="سبب طلب الإجازة..."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#714B67]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)} 
                  className="px-4 py-2 bg-slate-100 rounded-lg font-bold hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#714B67] text-white rounded-lg font-bold hover:bg-[#5a3a52] transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> تقديم وحفظ الطلب
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TIME OFF ALLOCATION MODAL (Odoo 18 Enterprise) */}
      {/* ======================================================== */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs my-8">
            
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
                    تخصيص الرصيد الافتتاحي والمرحل وفق نظام Odoo 18
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

            <form onSubmit={handleCreateAllocation} className="space-y-4">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User size={13} className="text-[#714B67]" />
                  <span>اسم الموظف المستفيد (employee_id) *</span>
                </label>
                <select
                  required
                  value={newAllocation.employeeId}
                  onChange={(e) => handleAllocationEmployeeChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#714B67] font-bold text-slate-800"
                >
                  {companyEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} | {emp.jobTitle || 'موظف'} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>

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
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none font-mono font-black text-emerald-700 focus:border-[#714B67] text-sm"
                    placeholder="12.5"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">خيارات:</span>
                    {[5, 10, 12.5, 15, 30].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewAllocation({ ...newAllocation, days: String(val) })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          parseFloat(newAllocation.days) === val 
                            ? 'bg-[#714B67] text-white' 
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
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none font-mono font-bold focus:border-[#714B67]"
                  >
                    <option value="2027">2027 (استحقاق 2027)</option>
                    <option value="2026">2026 (استحقاق 2026)</option>
                    <option value="2025">2025 (رصيد مرحل من 2025)</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>

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
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-[#714B67] text-xs"
                />
              </div>

              {/* Live Preview Card */}
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

      {/* ======================================================== */}
      {/* MODAL 3: LEAVE ADVANCE SALARY SETTLEMENT (KUWAIT LAW ART 71) */}
      {/* ======================================================== */}
      {selectedSettlementReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border text-xs my-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plane className="text-[#714B67]" size={20} />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">سند صرف راتب إجازة مقدماً قبل السفر (Leave Settlement)</h3>
                  <p className="text-[10px] text-slate-400">تنفيذاً للمادة 71 من قانون العمل الكويتي رقم 6 لسنة 2010</p>
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
                  onClick={() => safePrintAction('سند_تسوية_راتب_مسبقة')}
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

      {/* ======================================================== */}
      {/* MODAL 4: PRINTABLE OFFICIAL LEAVE APPLICATION FORM (A4) */}
      {/* ======================================================== */}
      {selectedPrintReq && (
        <PrintableLeaveFormModal
          request={selectedPrintReq}
          onClose={() => setSelectedPrintReq(null)}
          activeCompanyName={activeCompany?.nameAr || 'المنشأة المركزية المتكاملة'}
          pamFileNumber={activeCompany?.wsiCode || '12345678'}
          civilIdCompany={activeCompany?.civilIdCompany || '123456789012'}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 5: RETURN TO WORK VERIFICATION MODAL */}
      {/* ======================================================== */}
      {selectedReturnReq && (
        <ReturnToWorkModal
          request={selectedReturnReq}
          onClose={() => setSelectedReturnReq(null)}
          onConfirmReturn={handleConfirmReturnToWork}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 6: LEAVE REJECTION REASON MODAL */}
      {/* ======================================================== */}
      {rejectionModalState && (
        <LeaveRejectionModal
          request={rejectionModalState.req}
          stageLabel={rejectionModalState.stageLabel}
          onClose={() => setRejectionModalState(null)}
          onConfirmReject={handleConfirmRejection}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 7: LEAVE POLICY INITIALIZATION WIZARD */}
      {/* ======================================================== */}
      <LeavePolicyWizardModal
        isOpen={showPolicyWizardModal}
        onClose={() => setShowPolicyWizardModal(false)}
      />

    </div>
  );
};

export default OdooTimeOffApp;
