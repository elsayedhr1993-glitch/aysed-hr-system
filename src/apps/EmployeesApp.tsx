import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Stethoscope, AlertTriangle, X, FileText, Printer, Calendar, 
  RefreshCw, DollarSign, CheckCircle2, Building2, Briefcase, ExternalLink, Trash2,
  MoreVertical, Download, UserPlus, ChevronDown, LayoutGrid, List, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import OdooEmployeeFormModal from '../components/OdooEmployeeFormModal';
import { OdooEmployeeDetailView } from '../components/employees/OdooEmployeeDetailView';
import OdooContractsApp from "../components/OdooContractsApp";
import OdooPamContractModal from '../components/OdooPamContractModal';
import { CommencementApp } from './CommencementApp';
import { OnboardingTrackerApp } from '../components/employees/OnboardingTrackerApp';
import { OnboardingWizardModal } from '../components/employees/OnboardingWizardModal';
import { useCompany } from '../context/CompanyContext';
import { TenantDatabaseService } from '../services/tenantDataService';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { getPersistentData } from '../utils/persistentStorage';
import { get_aysed_official_balance, getCarriedOverBalance, getGlobalCompensatoryDays } from '../utils/kuwaitLaw';
import { checkDocumentExpiry } from '../utils/dateUtils';

export const safePrintA4Document = (htmlContent: string) => {
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow && !printWindow.closed) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>طباعة مستند رسمي</title>
          <style>
            body { font-family: 'Cairo', Tahoma, sans-serif; padding: 20px; color: #1e293b; direction: rtl; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              try { window.focus(); window.print(); } catch(e) {}
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }
  } catch (e) {
    console.warn('safePrintA4Document window.open error:', e);
  }

  safePrintAction('طباعة المستند');
};

const generateLeavePrintHtml = (printData: any, companyName: string, companyNameEn: string) => {
  const manaraLeaves = getPersistentData<any[]>('manara_leaves_data', []);
  const odooRequests = getPersistentData<any[]>('odoo_leave_requests_v2', []);
  const combinedList = [...manaraLeaves, ...odooRequests];

  const empLeaves = combinedList.filter(l => {
    const matchEmp = l.employeeId === printData.id || 
                     (printData.civilId && l.civilId && l.civilId === printData.civilId) ||
                     (printData.civil_id_number && l.civilId && l.civilId === printData.civil_id_number);
    if (!matchEmp) return false;

    const normType = String(l.leaveType || '').toUpperCase();
    const normStatus = String(l.status || '').toUpperCase();
    const isApproved = normStatus === 'APPROVED' || normStatus === 'VALIDATED';
    return normType === 'ANNUAL' && isApproved;
  });
  
  const totalTaken = empLeaves.reduce((sum, l) => sum + (Number(l.totalDays || l.daysCount) || 0), 0);
  const carriedOver = getCarriedOverBalance(printData);
  const accrued2026 = get_aysed_official_balance(printData);
  const compensatory = getGlobalCompensatoryDays(printData);
  const netAvailable = Number((carriedOver + accrued2026 + compensatory - totalTaken).toFixed(1));

  return `
    <div style="direction: rtl; font-family: 'Arial', 'Tahoma', sans-serif; padding: 25px; line-height: 1.6; color: #1e293b;">
      <div style="text-align: center; border-b: 2px double #cbd5e1; padding-bottom: 20px; margin-bottom: 30px;">
        <h2 style="margin: 0; color: #714b67; font-size: 22px;">${companyName}</h2>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${companyNameEn}</div>
        <h3 style="margin: 15px 0 0 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #714b67; display: inline-block; padding-bottom: 5px;">كشف رصيد وحساب الإجازات المعتمد</h3>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #64748b; width: 18%;">اسم الموظف:</td>
          <td style="padding: 8px; font-weight: bold; font-size: 13px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${printData.nameAr || printData.fullNameAr || 'غير متوفر'}</td>
          <td style="padding: 8px; font-weight: bold; color: #64748b; width: 18%;">الرقم المدني:</td>
          <td style="padding: 8px; font-family: monospace; border-bottom: 1px solid #f1f5f9;">${printData.civilId || printData.civil_id_number || 'غير متوفر'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #64748b;">المسمى الوظيفي:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${printData.jobTitle || 'غير متوفر'}</td>
          <td style="padding: 8px; font-weight: bold; color: #64748b;">القسم / الإدارة:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${printData.dept || printData.department || 'غير متوفر'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #64748b;">تاريخ التعيين:</td>
          <td style="padding: 8px; font-family: monospace; border-bottom: 1px solid #f1f5f9;">${printData.hireDate || printData.joinDate || '2026-01-01'}</td>
          <td style="padding: 8px; font-weight: bold; color: #64748b;">الجنسية:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${printData.nationality || 'غير متوفر'}</td>
        </tr>
      </table>

      <div style="margin-bottom: 30px;">
        <h4 style="margin: 0 0 15px 0; color: #714b67; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">ملخص أرصدة الإجازات السنوية المعتمدة</h4>
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 11px;">
          <tr>
            <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; width: 20%;">
              <div style="font-size: 10px; color: #64748b; font-weight: bold; margin-bottom: 5px;">الرصيد المرحل من 2025</div>
              <div style="font-size: 15px; font-weight: bold; color: #334155;">${carriedOver} يوم</div>
            </td>
            <td style="background-color: #faf5ff; border: 1px solid #f3e8ff; padding: 12px; border-radius: 6px; width: 20%;">
              <div style="font-size: 10px; color: #6b21a8; font-weight: bold; margin-bottom: 5px;">المستحق لعام 2026</div>
              <div style="font-size: 15px; font-weight: bold; color: #7e22ce;">+${accrued2026} يوم</div>
            </td>
            <td style="background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 12px; border-radius: 6px; width: 20%;">
              <div style="font-size: 10px; color: #166534; font-weight: bold; margin-bottom: 5px;">أيام تعويضية (العطلات)</div>
              <div style="font-size: 15px; font-weight: bold; color: #15803d;">+${compensatory} يوم</div>
            </td>
            <td style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 12px; border-radius: 6px; width: 20%;">
              <div style="font-size: 10px; color: #991b1b; font-weight: bold; margin-bottom: 5px;">المستهلك الفعلي</div>
              <div style="font-size: 15px; font-weight: bold; color: #b91c1c;">-${totalTaken} يوم</div>
            </td>
            <td style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 12px; border-radius: 6px; width: 20%;">
              <div style="font-size: 10px; color: #115e59; font-weight: bold; margin-bottom: 5px;">الرصيد المتاح الصافي</div>
              <div style="font-size: 16px; font-weight: bold; color: #0f766e;">${netAvailable} يوم</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 35px;">
        <h4 style="margin: 0 0 12px 0; color: #714b67; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">سجل حركات الإجازات السنوية المصدقة</h4>
        ${empLeaves.length === 0 ? `
          <div style="text-align: center; padding: 15px; color: #94a3b8; font-size: 12px; border: 1px dashed #cbd5e1; border-radius: 6px;">لا يوجد طلبات إجازات معتمدة مسجلة للموظف.</div>
        ` : `
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 8px; border: 1px solid #e2e8f0;">تاريخ البدء</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0;">تاريخ الانتهاء</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">المدة الفعلية</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0;">السبب / البيان</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${empLeaves.slice(0, 10).map(l => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${l.startDate}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${l.endDate}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${l.totalDays} يوم</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${l.reason || 'إجازة سنوية اعتيادية'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #15803d; font-weight: bold;">معتمد</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; font-size: 12px;">
        <div>
          <p style="font-weight: bold; color: #475569; margin-bottom: 50px;">توقيع وإقرار الموظف</p>
          <div style="border-bottom: 1px solid #94a3b8; width: 80%; margin: 0 auto 5px auto;"></div>
          <span style="font-size: 10px; color: #94a3b8;">التوقيع: ............................</span>
        </div>
        <div>
          <p style="font-weight: bold; color: #475569; margin-bottom: 50px;">مسؤول شؤون الموظفين</p>
          <div style="border-bottom: 1px solid #94a3b8; width: 80%; margin: 0 auto 5px auto;"></div>
          <span style="font-size: 10px; color: #94a3b8;">التوقيع والختم</span>
        </div>
        <div>
          <p style="font-weight: bold; color: #475569; margin-bottom: 50px;">اعتماد إدارة الموارد البشرية</p>
          <div style="border-bottom: 1px solid #94a3b8; width: 80%; margin: 0 auto 5px auto;"></div>
          <span style="font-size: 10px; color: #94a3b8;">التوقيع والختم الرسمي</span>
        </div>
      </div>

      <div style="margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 10px; color: #94a3b8;">
        تم إنشاؤه تلقائياً بواسطة نظام المنارة لتقنية المعلومات والموارد البشرية (Odoo 18 ERP) - تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-KW')}
      </div>
    </div>
  `;
};

export const calculateEmployeeTotalSalary = (emp: any): number => {
  if (!emp) return 0;
  const basic = Number(emp.basicSalary !== undefined ? emp.basicSalary : (emp.contractSalary !== undefined ? emp.contractSalary : (emp.salary || 0))) || 0;
  const housing = Number(emp.housingAllowance || 0);
  const transport = Number(emp.transportAllowance || 0);
  const medical = Number(emp.medicalAllowance || 0);
  const other = Number(emp.otherAllowances !== undefined ? emp.otherAllowances : (emp.otherAllowance || 0));
  const fallbackAllowances = Number(emp.allowances || 0);
  const totalAllowances = (housing + transport + medical + other) > 0 ? (housing + transport + medical + other) : fallbackAllowances;
  if (emp.totalSalary !== undefined && emp.totalSalary !== null && Number(emp.totalSalary) > 0) {
    return Number(emp.totalSalary);
  }
  return basic + totalAllowances;
};

export function EmployeesApp(props?: any) {
  const { activeCompany, activeCompanyId } = useCompany();
  const currentCompanyId = activeCompanyId || activeCompany?.id || 'comp-super-admin';

  const [activeTab, setActiveTab] = useState<'directory' | 'contracts' | 'commencement' | 'onboarding'>('directory');
  const [showFullCommencementApp, setShowFullCommencementApp] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowActionsDropdown(false);
      setActiveCardMenuId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);
  
  // Print preview modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTitle, setPrintTitle] = useState('');
  const [printData, setPrintData] = useState<any>(null);

  const handleTriggerPrint = (title: string, data: any) => {
    setPrintTitle(title);
    setPrintData(data || selectedEmployee || { nameAr: activeCompany?.nameAr || activeCompany?.name || 'تقرير المنشأة' });
    setShowPrintModal(true);
  };
  
  // Modal states
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employeeActiveTab, setEmployeeActiveTab] = useState<'work' | 'contract_pam' | 'private' | 'hr' | 'resume'>('work');
  const [employeeSubModal, setEmployeeSubModal] = useState<'none' | 'contracts' | 'attendance' | 'leave' | 'assets' | 'payslips' | 'documents'>('none');
  const [showPamContractModal, setShowPamContractModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showDevToolsMenu, setShowDevToolsMenu] = useState(false);
  const [showOnboardingWizardModal, setShowOnboardingWizardModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (props?.initialTab) {
      setActiveTab(props.initialTab);
    }
    if (props?.initialShowAdd) {
      setShowAddEmployeeModal(true);
    }
  }, [props?.initialTab, props?.initialShowAdd, props?.triggerKey]);

  const handlePerformFullReset = async () => {
    setIsResetting(true);
    try {
      await TenantDatabaseService.wipeEntireSystem();
      setEmployees([]);
      setContracts([]);
      setCommencements([]);
      toast.success('تم تصفير كافة الموظفين وقاعدة البيانات بنجاح!');
      setShowResetConfirmModal(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error('Error performing full reset:', e);
      toast.error('حدث خطأ أثناء التصفير، سيتم التحديث الآن');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await TenantDatabaseService.deleteEmployee(id, currentCompanyId);
    setEmployees(prev => {
      const updated = prev.filter(emp => emp.id !== id);
      if (currentCompanyId) {
        localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(updated));
      }
      return updated;
    });
    toast.success(`تم حذف الموظف: ${name || id}`);
    if (selectedEmployee && String(selectedEmployee.id) === String(id)) {
      setShowEmployeeModal(false);
      setSelectedEmployee(null);
    }
  };

  const handleDeleteContract = (contractId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = contracts.filter((c: any) => c.id !== contractId);
    setContracts(updated);
    if (currentCompanyId) {
      localStorage.setItem(`odoo_contracts_v1_${currentCompanyId}`, JSON.stringify(updated));
    }
    if (selectedContract && selectedContract.id === contractId) {
      setShowContractModal(false);
      setSelectedContract(null);
    }
    toast.success('تم حذف العقد بنجاح');
  };

  const handleDeleteCommencement = (comId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = commencements.filter((c: any) => c.id !== comId);
    setCommencements(updated);
    if (currentCompanyId) {
      localStorage.setItem(`odoo_commencements_v1_${currentCompanyId}`, JSON.stringify(updated));
    }
    if (selectedCommencement && selectedCommencement.id === comId) {
      setShowCommencementModal(false);
      setSelectedCommencement(null);
    }
    toast.success('تم حذف إقرار المباشرة بنجاح');
  };

  const validateKuwaitCivilId = (civilId: string) => {
    if (!civilId || civilId.length !== 12) return false;
    return /^\d{12}$/.test(civilId);
  };

  const handleMasterDropdownChange = (
    value: string,
    field: string,
    targetObj: any,
    setTargetObj: any,
    list: string[],
    setList: any,
    promptText: string
  ) => {
    if (value === '__ADD_NEW__') {
      const newVal = prompt(promptText);
      if (newVal && newVal.trim()) {
        if (!list.includes(newVal.trim())) {
          setList([...list, newVal.trim()]);
        }
        setTargetObj({ ...targetObj, [field]: newVal.trim() });
      }
    } else {
      setTargetObj({ ...targetObj, [field]: value });
    }
  };
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [contractActiveTab, setContractActiveTab] = useState<'salary' | 'schedule' | 'terms'>('salary');

  const [showCommencementModal, setShowCommencementModal] = useState(false);
  const [selectedCommencement, setSelectedCommencement] = useState<any>(null);

  const [chatterInput, setChatterInput] = useState('');

  // Odoo Master Data Lookup Lists (القوائم المنسدلة المرجعية)
  const [masterDepts, setMasterDepts] = useState<string[]>([
    'الإدارة العليا',
    'الموارد البشرية',
    'الأطباء',
    'التمريض',
    'الأمن والخدمات',
    'العيادات التخصصية',
    'المختبر والأشعة'
  ]);

  const [masterJobTitles, setMasterJobTitles] = useState<string[]>([
    'مدير الموارد البشرية والشؤون الإدارية',
    'أخصائي شؤون العاملين والرواتب (WPS)',
    'طبيبة استشارية - طب وجراحة العيون',
    'طبيب ممارس عام',
    'رئيسة هيئة التمريض والتعقيم',
    'ممرض/ة عام',
    'مشرف الأمن والسلامة واللوجستيات',
    'أخصائي مختبر وطب مساند'
  ]);

  const [masterBanks, setMasterBanks] = useState<string[]>([
    'بنك الكويت الوطني (NBK)',
    'بيت التمويل الكويتي (KFH)',
    'بنك الخليج (Gulf Bank)',
    'بنك برقان (Burgan Bank)',
    'البنك التجاري الكويتي (CBK)',
    'بنك بوبيان (Boubyan Bank)',
    'البنك الأهلي الكويتي (ABK)'
  ]);

  // 1. حالة الموظفين معتمدة حصراً على قاعدة البيانات السحابية (Supabase / Firestore)
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (props?.selectedEmployeeId && employees.length > 0) {
      const target = employees.find((e: any) => String(e.id) === String(props.selectedEmployeeId));
      if (target) {
        setSelectedEmployee(target);
        setShowEmployeeModal(true);
      }
    }
  }, [props?.selectedEmployeeId, employees]);

  // One-time sanitization: Ensure Elsayed Bakhit's carried over balance is 0 in localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const allocKeys = ['odoo_leave_allocations_v2', 'manara_leave_allocations_data', 'manara_leave_allocations'];
        for (const k of allocKeys) {
          const raw = window.localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              let changed = false;
              list.forEach((a: any) => {
                const isBakhit =
                  a.civilId === '293080106877' ||
                  (a.employeeName && (a.employeeName.includes('بخيت') || a.employeeName.includes('سويلم'))) ||
                  (a.name && (a.name.includes('بخيت') || a.name.includes('سويلم')));
                const isOpening = a.allocationType === 'regular' || a.id?.includes('alloc-open') || a.name?.includes('مرحل') || a.name?.includes('افتتاحي') || String(a.fromYear) === '2025';
                if (isBakhit && isOpening && (a.numberOfDays > 0 || a.remainingDays > 0)) {
                  a.numberOfDays = 0;
                  a.remainingDays = 0;
                  changed = true;
                }
              });
              if (changed) {
                window.localStorage.setItem(k, JSON.stringify(list));
              }
            }
          }
        }
      }
    } catch (e) {}
  }, []);

  // 2. مزامنة قاعدة البيانات الحية للمؤسسة أو الشركة النشطة (Single Source of Truth)
  useEffect(() => {
    let isMounted = true;

    // Reset list immediately when company changes to prevent cross-company leak
    setEmployees([]);

    async function syncTenantEmployees() {
      if (!currentCompanyId) return;
      setIsLoadingDb(true);
      try {
        const dbEmps = await TenantDatabaseService.getEmployeesByTenant(currentCompanyId);
        if (isMounted) {
          if (dbEmps && dbEmps.length > 0) {
            const mapped = dbEmps.map(emp => {
              const civilExpiry = emp.civilIdExpiry || (emp as any).civilIdExpiryDate || (emp as any).civil_id_expiry || (emp as any).raw_payload?.civilIdExpiry || (emp as any).raw_payload?.civilIdExpiryDate || (emp as any).raw_payload?.civil_id_expiry || '';
              const rawBasic = Number((emp as any).basicSalary !== undefined ? (emp as any).basicSalary : ((emp as any).contractSalary !== undefined ? (emp as any).contractSalary : ((emp as any).salary || 0))) || 0;
              const rawHousing = Number((emp as any).housingAllowance || 0);
              const rawTransport = Number((emp as any).transportAllowance || 0);
              const rawMedical = Number((emp as any).medicalAllowance || 0);
              const rawOther = Number((emp as any).otherAllowances !== undefined ? (emp as any).otherAllowances : ((emp as any).otherAllowance || 0));
              const rawAllowances = Number((emp as any).allowances !== undefined && (emp as any).allowances !== 0 ? (emp as any).allowances : (rawHousing + rawTransport + rawMedical + rawOther));
              const rawTotal = Number((emp as any).totalSalary || (rawBasic + rawAllowances));
              return {
                ...emp,
                id: emp.id,
                companyId: emp.companyId || (emp as any).company_id || currentCompanyId,
                company_id: emp.companyId || (emp as any).company_id || currentCompanyId,
                nameAr: emp.fullNameAr || (emp as any).nameAr || (emp as any).name || 'موظف',
                nameEn: emp.fullNameEn || (emp as any).nameEn || '',
                civilId: emp.civilId || '',
                civilIdExpiry: civilExpiry,
                civilIdExpiryDate: civilExpiry,
                civil_id_expiry: civilExpiry,
                jobTitle: emp.jobTitle || 'موظف',
                dept: emp.department || (emp as any).dept || 'العموم',
                workLocation: (emp as any).workLocation || 'الفرع الرئيسي',
                manager: (emp as any).manager || '',
                phone: emp.phone || '',
                email: emp.email || '',
                nationality: emp.nationality || 'كويتي',
                dob: emp.dob || '',
                maritalStatus: (emp as any).maritalStatus || 'أعزب',
                dependents: (emp as any).dependents || 0,
                passportNo: emp.passportNo || '',
                passportExpiry: emp.passportExpiry || '',
                residencyType: (emp as any).residencyType || 'مواطن',
                hireDate: emp.joinDate || (emp as any).hireDate || '',
                mohLicense: emp.mohLicenseNo || (emp as any).mohLicense || '',
                mohLicenseExpiry: emp.mohLicenseExpiry || '',
                specialty: (emp as any).specialty || '',
                degree: (emp as any).degree || '',
                contractType: (emp as any).contractType || 'دائم',
                basicSalary: rawBasic,
                contractSalary: rawBasic,
                housingAllowance: rawHousing,
                transportAllowance: rawTransport,
                medicalAllowance: rawMedical,
                otherAllowance: rawOther,
                otherAllowances: rawOther,
                allowances: rawAllowances,
                totalSalary: rawTotal,
                salary: rawTotal,
                carriedOverLeave2025: ((emp.fullNameAr && (emp.fullNameAr.includes('بخيت') || emp.fullNameAr.includes('سويلم'))) || emp.civilId === '293080106877') ? 0 : Number((emp as any).carriedOverLeave2025 ?? (emp as any).carriedOverBalance ?? 0),
                carriedOverBalance: ((emp.fullNameAr && (emp.fullNameAr.includes('بخيت') || emp.fullNameAr.includes('سويلم'))) || emp.civilId === '293080106877') ? 0 : Number((emp as any).carriedOverBalance ?? (emp as any).carriedOverLeave2025 ?? 0),
                openingBalance: ((emp.fullNameAr && (emp.fullNameAr.includes('بخيت') || emp.fullNameAr.includes('سويلم'))) || emp.civilId === '293080106877') ? 0 : Number((emp as any).openingBalance ?? 0),
                status: emp.status || 'على رأس العمل',
                avatarColor: (emp as any).avatarColor || 'bg-purple-600',
                chatter: (emp as any).chatter || []
              };
            });
            setEmployees(mapped);
            if (currentCompanyId) {
              localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(mapped));
            }
          } else {
            setEmployees([]);
            if (currentCompanyId) {
              localStorage.removeItem(`odoo_employees_v1_${currentCompanyId}`);
            }
          }
        }
      } catch (e) {
        console.error("Error syncing tenant employees:", e);
      } finally {
        if (isMounted) setIsLoadingDb(false);
      }
    }
    syncTenantEmployees();
    return () => { isMounted = false; };
  }, [currentCompanyId]);

  const [contracts, setContracts] = useState<any[]>([]);
  const [commencements, setCommencements] = useState<any[]>([]);

  // load scoped contracts and commencements when company changes
  useEffect(() => {
    if (!currentCompanyId) {
      setContracts([]);
      setCommencements([]);
      return;
    }
    const contractKey = `odoo_contracts_v1_${currentCompanyId}`;
    const savedContracts = localStorage.getItem(contractKey);
    if (savedContracts) {
      try {
        const parsed = JSON.parse(savedContracts);
        setContracts(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setContracts([]);
      }
    } else {
      setContracts([]);
    }

    const commencementKey = `odoo_commencements_v1_${currentCompanyId}`;
    const savedComms = localStorage.getItem(commencementKey);
    if (savedComms) {
      try {
        const parsed = JSON.parse(savedComms);
        setCommencements(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCommencements([]);
      }
    } else {
      setCommencements([]);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(employees));
    }
  }, [employees, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`odoo_contracts_v1_${currentCompanyId}`, JSON.stringify(contracts));
    }
  }, [contracts, currentCompanyId]);

  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(`odoo_commencements_v1_${currentCompanyId}`, JSON.stringify(commencements));
    }
  }, [commencements, currentCompanyId]);

  // فتح نموذج الموظف (hr.employee) كصفحة نظيفة ومباشرة
  const openEmployeeModal = (emp: any) => {
    const latest = employees.find(e => e.id === emp.id) || emp;
    setSelectedEmployee(latest);
    setShowEmployeeModal(false);
  };

  // فتح معالج تسجيل موظف جديد عبر خطة التهيئة والتعيين
  const handleCreateNewEmployee = () => {
    setShowOnboardingWizardModal(true);
  };

  // تأكيد معالج التهيئة وإنشاء الموظف والخطة تلقائياً
  const handleConfirmOnboardingPlan = async (plan: any) => {
    setShowOnboardingWizardModal(false);

    // البحث إذا كان الموظف مسجل سابقاً أو جديد
    const existingEmp = employees.find(e => 
      (plan.employeeId && e.id === plan.employeeId) || 
      (e.civilId && plan.civilId && e.civilId === plan.civilId && plan.civilId !== 'غير محدد')
    );

    if (!existingEmp) {
      const nextSeq = employees.length + 1;
      const newEmp = {
        id: `EMP-2026-${String(nextSeq).padStart(3, '0')}`,
        nameAr: plan.employeeName || 'موظف جديد',
        fullNameAr: plan.employeeName || 'موظف جديد',
        jobTitle: plan.jobTitle || 'موظف',
        dept: plan.department || 'العموم',
        department: plan.department || 'العموم',
        civilId: plan.civilId !== 'غير محدد' ? plan.civilId : '',
        civil_id_number: plan.civilId !== 'غير محدد' ? plan.civilId : '',
        hireDate: plan.expectedStartDate || new Date().toISOString().slice(0, 10),
        status: 'على رأس العمل',
        companyId: currentCompanyId,
        basicSalary: plan.department === 'الأطباء' ? 1200 : 700,
        allowances: 150,
        nationality: 'كويتي',
        salary: (plan.department === 'الأطباء' ? 1200 : 700) + 150,
        carriedOverLeave2025: 0,
        carriedOverBalance: 0,
        openingBalance: 0,
        avatarColor: 'bg-purple-900',
        mohLicense: plan.department === 'الأطباء' ? 'MOH-DOC-TEMP' : '',
        pifssStatus: 'subscribed',
        legalChecklist: plan.legalChecklist || {
          civilIdScan: true,
          passportScan: true,
          pamWorkPermit: true,
          mohLicense: plan.department === 'الأطباء',
          medicalFitness: true,
          signedContract: true
        },
        requiredDocuments: plan.requiredDocuments || ['civilIdScan', 'passportScan', 'pamWorkPermit', 'signedContract', 'medicalFitness'],
        onboardingPlanId: plan.id,
        custodyItems: plan.custodyItems || [],
        documentFiles: {}
      };

      await TenantDatabaseService.saveEmployee(newEmp as any, currentCompanyId);

      setEmployees(prev => {
        const nextList = [newEmp, ...prev];
        if (currentCompanyId) {
          localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(nextList));
        }
        return nextList;
      });
      setSelectedEmployee(newEmp);
      setActiveTab('directory');
    } else {
      // إذا كان الموظف مسجلاً بالفعل، نقوم بتحديث قائمة وثائقه وخطة تهيئته
      const updatedExisting = {
        ...existingEmp,
        legalChecklist: plan.legalChecklist || existingEmp.legalChecklist || {
          civilIdScan: true,
          passportScan: true,
          pamWorkPermit: true,
          mohLicense: (existingEmp.dept || existingEmp.department) === 'الأطباء',
          medicalFitness: true,
          signedContract: true
        },
        requiredDocuments: plan.requiredDocuments || existingEmp.requiredDocuments || ['civilIdScan', 'passportScan', 'pamWorkPermit', 'signedContract', 'medicalFitness'],
        onboardingPlanId: plan.id,
        custodyItems: plan.custodyItems || existingEmp.custodyItems || []
      };

      await TenantDatabaseService.saveEmployee(updatedExisting as any, currentCompanyId);

      setEmployees(prev => {
        const nextList = prev.map(e => e.id === updatedExisting.id ? updatedExisting : e);
        if (currentCompanyId) {
          localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(nextList));
        }
        return nextList;
      });
    }

    // حفظ خطة التهيئة والتعيين في الذاكرة
    try {
      const savedPlans = localStorage.getItem('odoo_onboarding_plans_v1');
      let currentPlans = savedPlans ? JSON.parse(savedPlans) : [];
      const updatedPlans = [plan, ...currentPlans.filter((p: any) => p.id !== plan.id)];
      localStorage.setItem('odoo_onboarding_plans_v1', JSON.stringify(updatedPlans));
    } catch (e) {
      console.error('Error saving onboarding plan:', e);
    }

    toast.success(`تم تسجيل الموظف (${plan.employeeName}) وتفعيل خطة التهيئة والتعيين بنجاح!`);
  };

  const handleSaveEmployee = async (updatedEmp: any) => {
    if (!updatedEmp) return;
    const activeCompanyId = currentCompanyId;
    const civilId = (updatedEmp.civil_id_number || updatedEmp.civilId || updatedEmp.civil_id || '').trim();

    if (updatedEmp.isNewRecord && civilId) {
      const isDuplicate = employees.some(
        emp => (emp.companyId === activeCompanyId || activeCompanyId === 'comp-super-admin') && 
        ((emp.civil_id_number && emp.civil_id_number.trim() === civilId) || 
         (emp.civilId && emp.civilId.trim() === civilId) ||
         (emp.civil_id && emp.civil_id.trim() === civilId))
      );

      if (isDuplicate) {
        alert('خطأ: الموظف مسجل بالفعل! الرقم المدني مكرر في هذه الشركة.');
        return;
      }
    }

    const bSalary = Number(updatedEmp.basicSalary !== undefined ? updatedEmp.basicSalary : (updatedEmp.contractSalary !== undefined ? updatedEmp.contractSalary : (updatedEmp.salary || 0))) || 0;
    const hAllowance = Number(updatedEmp.housingAllowance || 0);
    const tAllowance = Number(updatedEmp.transportAllowance || 0);
    const mAllowance = Number(updatedEmp.medicalAllowance || 0);
    const oAllowance = Number(updatedEmp.otherAllowances !== undefined ? updatedEmp.otherAllowances : (updatedEmp.otherAllowance || 0));
    const totalAllowances = Number(updatedEmp.allowances !== undefined && updatedEmp.allowances !== 0 ? updatedEmp.allowances : (hAllowance + tAllowance + mAllowance + oAllowance));
    const totalSal = Number(updatedEmp.totalSalary || (bSalary + totalAllowances));

    const payload = {
      ...updatedEmp,
      companyId: activeCompanyId,
      civil_id_number: civilId,
      civilId: civilId,
      nameAr: updatedEmp.nameAr || updatedEmp.fullNameAr || 'موظف جديد',
      fullNameAr: updatedEmp.nameAr || updatedEmp.fullNameAr || 'موظف جديد',
      nameEn: updatedEmp.nameEn || updatedEmp.fullNameEn || '',
      fullNameEn: updatedEmp.nameEn || updatedEmp.fullNameEn || '',
      department: updatedEmp.dept || updatedEmp.department,
      joinDate: updatedEmp.hireDate || updatedEmp.joinDate || '',
      hireDate: updatedEmp.hireDate || updatedEmp.joinDate || '',
      mohLicenseNo: updatedEmp.mohLicense || updatedEmp.mohLicenseNo,
      basicSalary: bSalary,
      contractSalary: bSalary,
      housingAllowance: hAllowance,
      transportAllowance: tAllowance,
      medicalAllowance: mAllowance,
      otherAllowance: oAllowance,
      otherAllowances: oAllowance,
      allowances: totalAllowances,
      totalSalary: totalSal,
      salary: totalSal,
      updatedAt: new Date().toISOString()
    };
    delete payload.isNewRecord;

    await TenantDatabaseService.saveEmployee(payload as any, activeCompanyId);

    setEmployees(prev => {
      const exists = prev.some(e => e.id === payload.id);
      const nextList = exists ? prev.map(e => e.id === payload.id ? payload : e) : [payload, ...prev];
      if (activeCompanyId) {
        localStorage.setItem(`odoo_employees_v1_${activeCompanyId}`, JSON.stringify(nextList));
      }
      return nextList;
    });

    // مزامنة فورية للعقد المرتبط بالموظف لضمان عدم وجود أي تعارض في الرواتب
    try {
      const contractToSync = contracts.find(c => c.employeeId === payload.id || c.id === payload.id);
      if (contractToSync) {
        const updatedContract = {
          ...contractToSync,
          basicSalary: bSalary,
          housingAllowance: hAllowance,
          transportAllowance: tAllowance,
          medicalAllowance: mAllowance,
          otherAllowance: oAllowance,
          otherAllowances: oAllowance
        };
        await TenantDatabaseService.saveContract(updatedContract as any, activeCompanyId);
        setContracts(prev => {
          const nextContracts = prev.map(c => (c.employeeId === payload.id || c.id === payload.id) ? updatedContract : c);
          if (activeCompanyId) {
            localStorage.setItem(`odoo_contracts_v1_${activeCompanyId}`, JSON.stringify(nextContracts));
          }
          return nextContracts;
        });
      }
    } catch (err) {
      console.error('Error syncing employee contract salary:', err);
    }

    setSelectedEmployee(payload);
    toast.success(`تم حفظ بيانات الموظف (${payload.nameAr}) وتحديث الراتب (${totalSal.toFixed(3)} د.ك) بنجاح`);
  };

  // فتح نموذج العقد (hr.contract)
  const openContractModal = (contract: any) => {
    setSelectedContract(contract);
    setShowContractModal(true);
  };

  // فتح نموذج إقرار المباشرة
  const openCommencementModal = (com: any) => {
    setSelectedCommencement(com);
    setShowCommencementModal(true);
  };

  // إنشاء إقرار مباشرة عمل جديد
  const handleCreateCommencement = () => {
    const firstEmp = employees[0] || {};
    const newCom = {
      id: `COM-2026-00${commencements.length + 1}`,
      employeeId: firstEmp.id || 'EMP-NEW',
      employeeName: firstEmp.nameAr || 'موظف جديد',
      civilId: firstEmp.civilId || '',
      commencementDate: new Date().toISOString().slice(0, 10),
      healthCheckStatus: 'قيد المراجعة الطبية (لائق)',
      fingerprintStatus: 'جاري إنجاز بصمات وزارة الداخلية',
      mohLicenseStatus: 'ترخيص مؤقت معتمد',
      supervisingDept: firstEmp.dept || 'العموم',
      status: 'مسودة',
      chatter: [
        { id: 1, user: 'مسؤول الموارد البشرية', text: 'إنشاء إقرار مباشرة العمل الجديد', date: new Date().toLocaleString() }
      ]
    };
    setCommencements([newCom, ...commencements]);
    setSelectedCommencement(newCom);
    setShowCommencementModal(true);
  };

  // إنشاء عقد جديد
  const handleCreateNewContract = () => {
    const newCnt = {
      id: `CNT-2026-00${contracts.length + 1}`,
      refTitle: `عقد عمل جديد - موظف جديد - 2026`,
      employeeId: 'NEW-01',
      employeeName: 'موظف جديد',
      jobPosition: 'طبيب ممارس عام',
      department: 'الأطباء',
      structureType: 'عقد كادر أهلي قياسي',
      contractType: 'محدد المدة (سنة واحدة)',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 31536000000).toISOString().slice(0, 10),
      trialEndDate: new Date(Date.now() + 8640000000).toISOString().slice(0, 10),
      hrResponsible: '',
      status: 'Draft',
      wage: 900,
      housingAllowance: 100,
      transportAllowance: 50,
      medicalAllowance: 0,
      workingSchedule: 'دوام كامل - 48 ساعة أسبوعياً',
      annualLeaveDays: 30,
      noticePeriod: 'شهر واحد',
      nonCompete: 'لا يوجد',
      travelAndInsurance: 'تذاكر سفر سنوية + تأمين صحي',
      chatter: [
        { id: 1, user: 'مسؤول الموارد البشرية', text: 'تم إنشاء مسودة العقد النظامية', date: new Date().toLocaleString() }
      ]
    };
    setContracts([newCnt, ...contracts]);
    setSelectedContract(newCnt);
    setShowContractModal(true);
  };

  // تغيير حالة العقد
  const changeContractStatus = (newStatus: string) => {
    if (!selectedContract) return;
    const updatedCnt = { 
      ...selectedContract, 
      status: newStatus,
      chatter: [
        ...selectedContract.chatter,
        { id: Date.now(), user: 'النظام الآلي', text: `تم تغيير حالة العقد إلى: ${newStatus}`, date: new Date().toLocaleString() }
      ]
    };
    setSelectedContract(updatedCnt);
    setContracts(contracts.map(c => c.id === updatedCnt.id ? updatedCnt : c));
  };

  // إضافة رسالة في الـ Chatter العام أو المودال
  const handleAddChatter = (target: 'employee' | 'contract' | 'commencement', e: React.FormEvent) => {
    e.preventDefault();
    if (!chatterInput.trim()) return;

    if (target === 'contract' && selectedContract) {
      const updatedChatter = [
        ...selectedContract.chatter,
        { id: Date.now(), user: 'مسؤول الموارد البشرية', text: chatterInput, date: new Date().toLocaleString() }
      ];
      const updated = { ...selectedContract, chatter: updatedChatter };
      setSelectedContract(updated);
      setContracts(contracts.map(c => c.id === updated.id ? updated : c));
    } else if (target === 'employee' && selectedEmployee) {
      const updatedChatter = [
        ...(selectedEmployee.chatter || []),
        { id: Date.now(), user: 'مسؤول الموارد البشرية', text: chatterInput, date: new Date().toLocaleString() }
      ];
      const updated = { ...selectedEmployee, chatter: updatedChatter };
      setSelectedEmployee(updated);
      setEmployees(employees.map(e => e.id === updated.id ? updated : e));
    } else if (target === 'commencement' && selectedCommencement) {
      const updatedChatter = [
        ...(selectedCommencement.chatter || []),
        { id: Date.now(), user: 'مسؤول الموارد البشرية', text: chatterInput, date: new Date().toLocaleString() }
      ];
      const updated = { ...selectedCommencement, chatter: updatedChatter };
      setSelectedCommencement(updated);
      setCommencements(commencements.map(c => c.id === updated.id ? updated : c));
    }
    setChatterInput('');
  };

  // 3. حظر تسريب الموظفين في العرض (Front-end Strict Filter)
  const visibleEmployees = employees.filter(emp => {
    const empCompanyId = emp.companyId || (emp as any).company_id;
    if (currentCompanyId === 'comp-super-admin' || !currentCompanyId) {
      return true;
    }
    return empCompanyId === currentCompanyId;
  });

  // 4. KPI Alert Cards State & Quick Filtering
  const [kpiFilter, setKpiFilter] = useState<'all' | 'on_duty' | 'on_leave' | 'residency_expiring' | 'moh_expiring' | 'expired'>('all');

  const parseAnyDate = (dateStr?: any): Date | null => {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    if (!str) return null;

    let d = new Date(str);
    if (!isNaN(d.getTime()) && str.includes('-') && str.indexOf('-') === 4) {
      return d;
    }

    const parts = str.split(/[\/\-\.]/);
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);

      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      }

      if (year && month && day && !isNaN(year) && !isNaN(month) && !isNaN(day)) {
        if (year < 100) year += 2000;
        d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    if (!isNaN(d.getTime())) return d;
    return null;
  };

  const getDaysDiff = (dateStr?: any): number | null => {
    const expiry = parseAnyDate(dateStr);
    if (!expiry) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryZero = new Date(expiry);
    expiryZero.setHours(0, 0, 0, 0);

    const diffTime = expiryZero.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const collectEmployeeDates = (emp: any): string[] => {
    const dates: string[] = [];

    const fields = [
      'residencyExpiry', 'residencyExpiryDate', 'residency_expiry',
      'civilIdExpiry', 'civilIdExpiryDate', 'civil_id_expiry',
      'passportExpiry', 'passport_expiry',
      'iqamaExpiry', 'iqama_expiry', 'visa_expire',
      'mohLicenseExpiry', 'mohLicenseExpiryDate', 'moh_license_expiry',
      'expiryDate', 'expireDate', 'expire_date'
    ];

    fields.forEach(f => {
      if (emp[f] && typeof emp[f] === 'string' && emp[f].trim() !== '') {
        dates.push(emp[f].trim());
      }
    });

    const docLists = [emp.documents, emp.docs, emp.attachments, emp.scannedDocs];
    docLists.forEach(list => {
      if (Array.isArray(list)) {
        list.forEach((d: any) => {
          if (!d) return;
          ['expiryDate', 'expiry', 'date', 'expire_date', 'issue_expiry'].forEach(f => {
            if (d[f] && typeof d[f] === 'string' && d[f].trim() !== '') {
              dates.push(d[f].trim());
            }
          });
        });
      }
    });

    return dates;
  };

  const checkResidencyExpiringSoon = (emp: any): boolean => {
    const statusStr = String(emp.status || '').toLowerCase();
    if (statusStr.includes('قريب') || statusStr.includes('expiring')) return true;

    const dates = collectEmployeeDates(emp);
    return dates.some(dStr => {
      const diff = getDaysDiff(dStr);
      return diff !== null && diff >= 0 && diff <= 60;
    });
  };

  const checkMohLicenseExpiringSoon = (emp: any): boolean => {
    const mohDates: string[] = [];
    ['mohLicenseExpiry', 'mohLicenseExpiryDate', 'moh_license_expiry', 'mohLicense'].forEach(f => {
      if (emp[f] && typeof emp[f] === 'string' && emp[f].trim() !== '') {
        mohDates.push(emp[f].trim());
      }
    });

    const docLists = [emp.documents, emp.docs, emp.attachments];
    docLists.forEach(list => {
      if (Array.isArray(list)) {
        list.forEach((d: any) => {
          if (d && (d.type === 'moh_license' || String(d.title || d.docTitleAr || d.category || '').includes('ترخيص') || String(d.title || d.docTitleAr || d.category || '').includes('MOH'))) {
            if (d.expiryDate) mohDates.push(d.expiryDate);
            if (d.expiry) mohDates.push(d.expiry);
          }
        });
      }
    });

    const isExpiringByDate = mohDates.some(dStr => {
      const diff = getDaysDiff(dStr);
      return diff !== null && diff >= 0 && diff <= 60;
    });

    if (isExpiringByDate) return true;

    if (docLists.some(list => Array.isArray(list) && list.some((d: any) => (d.type === 'moh_license' || String(d.title || '').includes('ترخيص')) && (d.status === 'expiring_soon' || String(d.status).includes('قريب'))))) {
      return true;
    }

    return false;
  };

  const checkExpiredDocs = (emp: any): boolean => {
    const empStatus = String(emp.status || '').toLowerCase();
    if (empStatus.includes('منتهي') || empStatus.includes('expired') || empStatus.includes('غير فعال') || empStatus.includes('موقوف')) {
      return true;
    }

    const docLists = [emp.documents, emp.docs, emp.attachments];
    for (const list of docLists) {
      if (Array.isArray(list)) {
        for (const d of list) {
          if (!d) continue;
          const dStatus = String(d.status || '').toLowerCase();
          if (dStatus.includes('expired') || dStatus.includes('منتهي')) {
            return true;
          }
        }
      }
    }

    const dates = collectEmployeeDates(emp);
    return dates.some(dStr => {
      const diff = getDaysDiff(dStr);
      return diff !== null && diff < 0;
    });
  };

  const totalEmployeesCount = visibleEmployees.length;

  const onDutyEmployees = visibleEmployees.filter(e => {
    const st = (e.status || '').trim().toLowerCase();
    return !st || st === 'على رأس العمل' || st === 'active' || st === 'نشط' || st === 'مداوم';
  });
  const onDutyCount = onDutyEmployees.length;

  const onLeaveEmployees = visibleEmployees.filter(e => {
    const st = (e.status || '').trim().toLowerCase();
    return st === 'في إجازة' || st === 'إجازة' || st === 'leave' || st === 'on_leave';
  });
  const onLeaveCount = onLeaveEmployees.length;

  const residencyExpiringEmployees = visibleEmployees.filter(checkResidencyExpiringSoon);
  const residencyExpiringCount = residencyExpiringEmployees.length;

  const availableDepts = Array.from(
    new Set(
      visibleEmployees
        .map(e => e.dept || e.department)
        .filter(Boolean)
    )
  );
  const allDepts = availableDepts.length > 0 ? availableDepts : ['الأطباء', 'التمريض', 'الموارد البشرية', 'الإدارة العليا', 'الفنيين', 'مناديب وسائقين'];

  const filteredEmployees = visibleEmployees.filter(emp => {
    const empDept = emp.dept || emp.department || '';
    const matchDept = selectedDept === null || !selectedDept || empDept === selectedDept || empDept.includes(selectedDept) || selectedDept.includes(empDept);
    
    const empStatus = (emp.status || '').trim().toLowerCase();
    let matchStatus = true;
    if (selectedStatus) {
      if (selectedStatus === 'على رأس العمل') {
        matchStatus = !empStatus || empStatus === 'على رأس العمل' || empStatus === 'active' || empStatus === 'نشط' || empStatus === 'مداوم';
      } else if (selectedStatus === 'في إجازة') {
        matchStatus = empStatus === 'في إجازة' || empStatus === 'إجازة' || empStatus === 'leave' || empStatus === 'on_leave';
      } else if (selectedStatus === 'قيد التعيين') {
        matchStatus = empStatus.includes('تعيين') || empStatus.includes('onboarding');
      } else {
        matchStatus = empStatus === selectedStatus.toLowerCase();
      }
    }

    const matchSearch = !searchQuery || 
                        (emp.nameAr || emp.fullNameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (emp.civilId || emp.civil_id_number || '').includes(searchQuery) || 
                        (emp.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (emp.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (emp.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesKpi = true;
    if (kpiFilter === 'on_duty') {
      matchesKpi = !empStatus || empStatus === 'على رأس العمل' || empStatus === 'active' || empStatus === 'نشط' || empStatus === 'مداوم';
    } else if (kpiFilter === 'on_leave') {
      matchesKpi = empStatus === 'في إجازة' || empStatus === 'إجازة' || empStatus === 'leave' || empStatus === 'on_leave';
    } else if (kpiFilter === 'residency_expiring') {
      matchesKpi = checkResidencyExpiringSoon(emp);
    } else if (kpiFilter === 'moh_expiring') {
      matchesKpi = checkMohLicenseExpiringSoon(emp);
    } else if (kpiFilter === 'expired') {
      matchesKpi = checkExpiredDocs(emp);
    }

    return matchDept && matchStatus && matchSearch && matchesKpi;
  });

  // توليد موظفين تجريبيين
  const generateMockEmployees = () => {
    const mockEmployees = [
      {
        id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        nameAr: 'د. أحمد خالد المنصور',
        fullNameAr: 'د. أحمد خالد المنصور',
        civilId: '290121501234',
        jobTitle: 'استشاري جراحة عامة',
        specialty: 'جراحة عامة وتجميلية',
        dept: 'الأطباء',
        department: 'الأطباء',
        basicSalary: 1200,
        allowances: 150,
        nationality: 'كويتي',
        hireDate: '2024-01-15',
        status: 'على رأس العمل',
        mohLicense: 'MOH-DOC-9821',
        companyId: currentCompanyId
      },
      {
        id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        nameAr: 'سارة عبد الله العتيبي',
        fullNameAr: 'سارة عبد الله العتيبي',
        civilId: '293041205678',
        jobTitle: 'رئيسة هيئة التمريض',
        specialty: 'رعاية حرجة وعناية مركزة',
        dept: 'التمريض',
        department: 'التمريض',
        basicSalary: 850,
        allowances: 100,
        nationality: 'كويتي',
        hireDate: '2023-05-10',
        status: 'على رأس العمل',
        mohLicense: 'MOH-NUR-4412',
        companyId: currentCompanyId
      },
      {
        id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        nameAr: 'محمد فوزي الصباح',
        fullNameAr: 'محمد فوزي الصباح',
        civilId: '288090209988',
        jobTitle: 'أخصائي أشعة وتشخيص طبي',
        specialty: 'رنين مغناطيسي وسونار',
        dept: 'الفنيين',
        department: 'الفنيين',
        basicSalary: 650,
        allowances: 80,
        nationality: 'مصري',
        hireDate: '2025-02-01',
        status: 'على رأس العمل',
        mohLicense: 'MOH-TEC-1190',
        companyId: currentCompanyId
      }
    ];
    
    const updatedList = [...mockEmployees, ...employees];
    setEmployees(updatedList);
    if (currentCompanyId) {
      localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(updatedList));
      TenantDatabaseService.saveEmployee(mockEmployees[0] as any, currentCompanyId);
      TenantDatabaseService.saveEmployee(mockEmployees[1] as any, currentCompanyId);
      TenantDatabaseService.saveEmployee(mockEmployees[2] as any, currentCompanyId);
    }
    toast.success('تم توليد 3 موظفين تجريبيين بنجاح!');
  };

  // تصدير Excel حقيقي
  const exportToExcel = () => {
    const headers = ['المعرف', 'اسم الموظف', 'الرقم المدني', 'المسمى الوظيفي', 'القسم', 'الهاتف', 'تاريخ التعيين', 'ترخيص MOH', 'الراتب الأساسي', 'البدلات', 'إجمالي الراتب', 'الحالة'];
    const rows = filteredEmployees.map(e => [
      e.id,
      `"${e.nameAr}"`,
      `="${e.civilId}"`,
      `"${e.jobTitle}"`,
      `"${e.dept}"`,
      `"${e.phone}"`,
      e.hireDate,
      e.mohLicense,
      e.basicSalary,
      e.allowances,
      e.basicSalary + e.allowances,
      `"${e.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `دليل_الموظفين_الكويت_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col w-full font-sans select-none text-slate-800" dir="rtl">
      
      {/* 1. الترويسة العلوية النظيفة والموحدة بنمط Odoo Enterprise الحديث */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs mb-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* الجانب الأيمن: عنوان الشاشة والشارة */}
          <div className="flex items-center gap-2.5 min-w-max">
            <div className="w-9 h-9 bg-[#714B67] rounded-lg flex items-center justify-center text-white text-base shadow-2xs shrink-0">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900">دليل الموظفين</h1>
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-md font-medium">
                  {activeCompany?.nameAr || activeCompany?.name || 'المنشأة النشطة'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">سجل الكوادر وشؤون الموظفين</p>
            </div>
          </div>

          {/* الوسط: شريط البحث الذكي الموحد مع الفلاتر المنسدلة للأقسام والحالة */}
          {activeTab === 'directory' && !selectedEmployee && (
            <div className="flex-1 max-w-2xl flex flex-wrap sm:flex-nowrap items-center gap-2">
              {/* حقل البحث الذكي */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالاسم، الرقم المدني، المسمى..." 
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-lg pr-9 pl-8 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* فلتر القسم المنسدل */}
              <div className="relative shrink-0">
                <select
                  value={selectedDept || ''}
                  onChange={(e) => setSelectedDept(e.target.value ? e.target.value : null)}
                  className="bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:bg-white focus:border-[#714B67] focus:outline-none cursor-pointer"
                >
                  <option value="">جميع الأقسام</option>
                  {allDepts.map((dept: any) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* فلتر الحالة المنسدل */}
              <div className="relative shrink-0">
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value ? e.target.value : null)}
                  className="bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:bg-white focus:border-[#714B67] focus:outline-none cursor-pointer"
                >
                  <option value="">جميع الحالات</option>
                  <option value="على رأس العمل">على رأس العمل</option>
                  <option value="في إجازة">في إجازة</option>
                  <option value="قيد التعيين">قيد التعيين</option>
                </select>
              </div>
            </div>
          )}

          {/* الجانب الأيسر: زر التسجيل الرئيسي + زر الإجراءات + مبدل العرض */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            {/* زر تسجيل موظف جديد الرئيسي */}
            <button 
              onClick={handleCreateNewEmployee}
              className="bg-[#714B67] hover:bg-[#5b3c53] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title="تسجيل موظف جديد عبر معالج التهيئة والتعيين"
            >
              <UserPlus size={14} />
              <span>+ تسجيل موظف جديد</span>
            </button>

            {/* قائمة إجراءات المنسدلة الموحدة */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="إجراءات وسجلات إضافية"
              >
                <span>إجراءات</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {showActionsDropdown && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 space-y-0.5 animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      handleTriggerPrint(activeTab === 'directory' ? 'سجل الموظفين الشامل' : 'تقرير المنشأة', { nameAr: activeCompany?.nameAr || activeCompany?.name || 'تقرير المنشأة' });
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Printer size={14} className="text-slate-500" />
                    <span>طباعة السجل الشامل</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      exportToExcel();
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={14} className="text-emerald-600" />
                    <span>تصدير ملف Excel</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">السجلات والوحدات التابعة</div>

                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      setActiveTab('contracts');
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-purple-50 rounded-lg text-xs font-medium text-purple-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span>📝</span>
                    <span>سجل العقود والرواتب</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      setActiveTab('commencement');
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-purple-50 rounded-lg text-xs font-medium text-purple-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🏥</span>
                    <span>سجل إقرارات المباشرة والعهد</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowActionsDropdown(false);
                      setActiveTab('onboarding');
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-purple-50 rounded-lg text-xs font-medium text-purple-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🚀</span>
                    <span>خطة التهيئة والتعيين</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsDropdown(false);
                      generateMockEmployees();
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>توليد موظفين تجريبيين</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsDropdown(false);
                      setShowResetConfirmModal(true);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-rose-50 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} className="text-rose-600" />
                    <span>تصفير وحذف الكل</span>
                  </button>
                </div>
              )}
            </div>

            {/* مبدل العرض: بطاقات / قائمة */}
            {activeTab === 'directory' && !selectedEmployee && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/90 text-xs">
                <button 
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'cards' ? 'bg-white text-[#714B67] shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                  title="عرض البطاقات (Kanban)"
                >
                  <LayoutGrid size={15} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#714B67] shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                  title="عرض القائمة (List)"
                >
                  <List size={15} />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* مسار العودة السريع إذا كان المستخدم داخل سجل فرعي */}
        {activeTab !== 'directory' && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('directory')}
              className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>←</span>
              <span>العودة إلى دليل الموظفين</span>
            </button>
            <span className="text-[11px] text-slate-500 font-medium">
              {activeTab === 'contracts' && 'عرض وإدارة سجل العقود والرواتب'}
              {activeTab === 'commencement' && 'عرض وإدارة إقرارات المباشرة والعهد'}
              {activeTab === 'onboarding' && 'عرض خطة التهيئة والتعيين'}
            </span>
          </div>
        )}
      </div>

      {/* 2. شريط المؤشرات الرقمي المدمج والنحيف في سطر واحد (Compact Mini-Stats Bar) */}
      {activeTab === 'directory' && !selectedEmployee && (
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl px-3.5 py-2 mb-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 divide-x divide-slate-200 divide-x-reverse">
            
            {/* المؤشر 1: إجمالي الموظفين */}
            <button
              onClick={() => setKpiFilter('all')}
              className={`flex items-center gap-2 transition cursor-pointer pl-2 sm:pl-4 ${
                kpiFilter === 'all' ? 'text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-slate-400 font-medium">إجمالي الموظفين:</span>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                kpiFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-800'
              }`}>
                {totalEmployeesCount}
              </span>
            </button>

            {/* المؤشر 2: على رأس العمل */}
            <button
              onClick={() => setKpiFilter(prev => prev === 'on_duty' ? 'all' : 'on_duty')}
              className={`flex items-center gap-2 transition cursor-pointer px-2 sm:px-4 ${
                kpiFilter === 'on_duty' ? 'text-emerald-950 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400 font-medium">على رأس العمل:</span>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                kpiFilter === 'on_duty' ? 'bg-emerald-600 text-white' : 'bg-emerald-100/80 text-emerald-800'
              }`}>
                {onDutyCount}
              </span>
            </button>

            {/* المؤشر 3: في إجازة */}
            <button
              onClick={() => setKpiFilter(prev => prev === 'on_leave' ? 'all' : 'on_leave')}
              className={`flex items-center gap-2 transition cursor-pointer px-2 sm:px-4 ${
                kpiFilter === 'on_leave' ? 'text-blue-950 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-400 font-medium">في إجازة:</span>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                kpiFilter === 'on_leave' ? 'bg-blue-600 text-white' : 'bg-blue-100/80 text-blue-800'
              }`}>
                {onLeaveCount}
              </span>
            </button>

            {/* المؤشر 4: إقامات تنتهي قريباً */}
            <button
              onClick={() => setKpiFilter(prev => prev === 'residency_expiring' ? 'all' : 'residency_expiring')}
              className={`flex items-center gap-2 transition cursor-pointer pr-2 sm:pr-4 ${
                kpiFilter === 'residency_expiring' ? 'text-amber-950 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-slate-400 font-medium">إقامات تنتهي قريباً:</span>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                kpiFilter === 'residency_expiring' ? 'bg-amber-600 text-white' : 'bg-amber-100/80 text-amber-900'
              }`}>
                {residencyExpiringCount}
              </span>
            </button>

          </div>

          {/* تنبيه أو زر تصفير الفلتر السريع إذا كان نشطاً */}
          {kpiFilter !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                (المعروض: {filteredEmployees.length} من {totalEmployeesCount})
              </span>
              <button
                onClick={() => setKpiFilter('all')}
                className="text-[10px] text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md transition cursor-pointer"
              >
                إلغاء الفلتر
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. دليل وبطاقات الموظفين (Kanban / List View) */}
      {activeTab === 'directory' && (
        <>
          {selectedEmployee ? (
            <OdooEmployeeDetailView
              employee={selectedEmployee}
              activeCompany={activeCompany}
              onSave={handleSaveEmployee}
              onBack={() => setSelectedEmployee(null)}
              onDelete={(id, name) => handleDeleteEmployee(id, name)}
              onTriggerPrint={(title, data) => handleTriggerPrint(title, data)}
              onOpenPamModal={() => setShowPamContractModal(true)}
            />
          ) : (
            <>
              {filteredEmployees.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center my-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl mb-3">
                    👥
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 mb-1">لا يوجد موظفون مطابقون</h3>
                  <p className="text-xs text-slate-400 mb-3">لم يتم العثور على أي موظف مطابق للبحث أو الفلتر المختار.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDept(null);
                      setSelectedStatus(null);
                      setKpiFilter('all');
                    }}
                    className="text-xs text-[#714B67] font-bold hover:underline cursor-pointer"
                  >
                    إعادة تعيين جميع الفلاتر
                  </button>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5 mb-4">
                  {filteredEmployees.map((emp) => {
                    const civilExp = emp.civilIdExpiry || (emp as any).civilIdExpiryDate || (emp as any).civil_id_expiry || (emp as any).raw_payload?.civilIdExpiry;
                    const passExp = emp.passportExpiry || (emp as any).passportExpiryDate;
                    const civilStatus = checkDocumentExpiry(civilExp, 'البطاقة المدنية');
                    const passStatus = checkDocumentExpiry(passExp, 'جواز السفر');
                    const hasDocAlert = civilStatus.isExpired || civilStatus.isExpiringSoon || passStatus.isExpired || passStatus.isExpiringSoon;

                    return (
                    <div 
                      key={emp.id} 
                      onClick={() => openEmployeeModal(emp)}
                      className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between ${
                        civilStatus.isExpired || passStatus.isExpired
                          ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                          : hasDocAlert
                          ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                          : 'border-slate-200/90 hover:border-[#714B67]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* الصورة / الحروف الأولى + الاسم والمسمى والتخصص والقسم */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-11 h-11 rounded-full ${emp.avatarColor || 'bg-[#714B67]'} text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 select-none relative`}>
                            {emp.nameAr ? emp.nameAr.slice(0, 2) : 'مو'}
                            {civilStatus.isExpired && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black animate-pulse" title="البطاقة المدنية منتهية!">
                                !
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-[#714B67] transition">
                              {emp.nameAr || emp.fullNameAr || 'موظف'}
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                              {emp.jobTitle || 'موظف'}
                              {emp.specialty ? ` • ${emp.specialty}` : ''}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-medium truncate">
                                🏢 {emp.dept || emp.department || 'العموم'}
                              </span>
                              {emp.mohLicense && (
                                <span className="inline-block bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium" title={`ترخيص وزارة الصحة: ${emp.mohLicense}`}>
                                  MOH: {emp.mohLicense}
                                </span>
                              )}
                              {civilStatus.isExpired && (
                                <span className="inline-block bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded-md text-[10px] font-bold animate-pulse" title={`انتهت البطاقة المدنية بتاريخ: ${civilExp}`}>
                                  ⚠️ مدنية منتهية ({civilStatus.badgeText})
                                </span>
                              )}
                              {!civilStatus.isExpired && civilStatus.isExpiringSoon && (
                                <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-md text-[10px] font-bold" title={`تنتهي البطاقة المدنية بتاريخ: ${civilExp}`}>
                                  ⏰ مدنية تنتهي قريباً ({civilStatus.daysRemaining} يوم)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* شارة الحالة الهادئة + زر الخيارات (...) */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 ${
                            (!emp.status || emp.status === 'على رأس العمل' || emp.status.toLowerCase() === 'active')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : (emp.status === 'في إجازة' || emp.status.toLowerCase() === 'leave')
                              ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (!emp.status || emp.status === 'على رأس العمل' || emp.status.toLowerCase() === 'active')
                                ? 'bg-emerald-500'
                                : (emp.status === 'في إجازة' || emp.status.toLowerCase() === 'leave')
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}></span>
                            <span>{emp.status || 'على رأس العمل'}</span>
                          </span>

                          {/* زر (...) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCardMenuId(activeCardMenuId === emp.id ? null : emp.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="خيارات إضافية"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeCardMenuId === emp.id && (
                              <div 
                                className="absolute left-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 space-y-0.5 animate-in fade-in duration-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setActiveCardMenuId(null);
                                    openEmployeeModal(emp);
                                  }}
                                  className="w-full text-right px-2.5 py-1.5 hover:bg-purple-50 hover:text-[#714B67] rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <span>✏️</span>
                                  <span>عرض وتعديل</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveCardMenuId(null);
                                    handleTriggerPrint(`بطاقة موظف - ${emp.nameAr}`, emp);
                                  }}
                                  className="w-full text-right px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <span>🖨️</span>
                                  <span>طباعة الملف</span>
                                </button>
                                <div className="border-t border-slate-100 my-0.5"></div>
                                <button
                                  onClick={(e) => {
                                    setActiveCardMenuId(null);
                                    handleDeleteEmployee(emp.id, emp.nameAr, e);
                                  }}
                                  className="w-full text-right px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                  <span>حذف الموظف</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden mb-4">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-3">الموظف</th>
                        <th className="p-3">الرقم المدني</th>
                        <th className="p-3">المسمى الوظيفي والقسم</th>
                        <th className="p-3">ترخيص وزارة الصحة</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-center">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => openEmployeeModal(emp)}>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${emp.avatarColor || 'bg-[#714B67]'} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 select-none`}>
                                {emp.nameAr ? emp.nameAr.slice(0, 2) : 'مو'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{emp.nameAr || emp.fullNameAr}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{emp.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            <div>{emp.civilId || '-'}</div>
                            {(() => {
                              const civilExp = emp.civilIdExpiry || (emp as any).civilIdExpiryDate || (emp as any).civil_id_expiry || (emp as any).raw_payload?.civilIdExpiry;
                              const status = checkDocumentExpiry(civilExp, 'المدنية');
                              if (status.isExpired) {
                                return (
                                  <div className="text-[9px] text-rose-600 font-bold font-sans mt-0.5 animate-pulse">
                                    ⚠️ {status.badgeText} ({civilExp})
                                  </div>
                                );
                              }
                              if (status.isExpiringSoon) {
                                return (
                                  <div className="text-[9px] text-amber-600 font-bold font-sans mt-0.5">
                                    ⏰ {status.badgeText}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </td>
                          <td className="p-3 text-slate-700">
                            <div className="font-medium">{emp.jobTitle}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{emp.dept || emp.department}</div>
                          </td>
                          <td className="p-3 font-mono text-purple-900 font-bold">{emp.mohLicense || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1 ${
                              (!emp.status || emp.status === 'على رأس العمل' || emp.status.toLowerCase() === 'active')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : (emp.status === 'في إجازة' || emp.status.toLowerCase() === 'leave')
                                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                (!emp.status || emp.status === 'على رأس العمل' || emp.status.toLowerCase() === 'active')
                                  ? 'bg-emerald-500'
                                  : (emp.status === 'في إجازة' || emp.status.toLowerCase() === 'leave')
                                  ? 'bg-blue-500'
                                  : 'bg-slate-400'
                              }`}></span>
                              <span>{emp.status || 'على رأس العمل'}</span>
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEmployeeModal(emp)}
                                className="bg-slate-100 hover:bg-purple-50 hover:text-[#714B67] text-slate-700 px-2.5 py-1 rounded-md font-bold transition text-[11px] flex items-center gap-1 cursor-pointer"
                                title="عرض وتعديل الملف"
                              >
                                ✏️ عرض
                              </button>
                              <button
                                onClick={(e) => handleDeleteEmployee(emp.id, emp.nameAr, e)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md font-bold transition text-[11px] flex items-center gap-1 cursor-pointer"
                                title="حذف الموظف"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 3.2 العقود والرواتب */}
      {activeTab === 'contracts' && (
        <div className="animate-in fade-in duration-300">
          <OdooContractsApp />
        </div>
      )}

      {/* 3.3 إقرارات مباشرة العمل */}
      {activeTab === 'commencement' && (
        showFullCommencementApp ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Back to Gateway Header */}
            <div className="flex items-center justify-between bg-slate-100 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <span className="text-xs font-black text-slate-700">وضع الإدخال النشط: إدارة ومعالجة إقرارات المباشرة</span>
              </div>
              <button
                onClick={() => setShowFullCommencementApp(false)}
                className="bg-[#107c41] hover:bg-[#0b6232] text-white px-4 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>العودة لملخص وإحصائيات المباشرة ↩</span>
              </button>
            </div>

            <CommencementApp
              employees={employees}
              contracts={contracts}
              shifts={[]}
              commencements={commencements}
              activeCompany={activeCompany as any}
              filterTab="all"
              onSaveCommencement={(updatedComm) => {
                const exists = commencements.some(c => c.id === updatedComm.id);
                let updatedList;
                if (exists) {
                  updatedList = commencements.map(c => c.id === updatedComm.id ? updatedComm : c);
                } else {
                  updatedList = [updatedComm, ...commencements];
                }
                setCommencements(updatedList);
                localStorage.setItem(`odoo_commencements_v1_${currentCompanyId}`, JSON.stringify(updatedList));
                toast.success('تم حفظ إقرار مباشرة العمل بنجاح');
              }}
              onDeleteCommencement={(id) => {
                const updatedList = commencements.filter(c => c.id !== id);
                setCommencements(updatedList);
                localStorage.setItem(`odoo_commencements_v1_${currentCompanyId}`, JSON.stringify(updatedList));
                toast.success('تم حذف إقرار مباشرة العمل بنجاح');
              }}
              onUpdateEmployeeStatus={(empId, newStatus) => {
                const empIndex = employees.findIndex((e: any) => e.id === empId);
                if (empIndex > -1) {
                  const updatedEmp = { ...employees[empIndex], status: newStatus };
                  if (props?.onSaveEmployee) {
                    props.onSaveEmployee(updatedEmp);
                  } else {
                    const employeesKey = `odoo_employees_v1_${currentCompanyId}`;
                    const currentEmployees = JSON.parse(localStorage.getItem(employeesKey) || '[]');
                    const updatedLocal = currentEmployees.map((e: any) => e.id === empId ? { ...e, status: newStatus } : e);
                    localStorage.setItem(employeesKey, JSON.stringify(updatedLocal));
                    window.dispatchEvent(new Event('manara_employees_updated'));
                  }
                  toast.success(`تم تحديث حالة الموظف لـ ${newStatus === 'ACTIVE' ? 'نشط' : 'غير نشط'}`);
                }
              }}
              onNavigateToApp={(app) => {
                if (app === 'EMPLOYEES') {
                  setShowFullCommencementApp(false);
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏥</span>
                  <h2 className="text-sm font-bold">بوابة مباشرة العمل وجداول الدوام الرسمية</h2>
                </div>
                <p className="text-[11px] text-emerald-200 mt-1 max-w-2xl leading-relaxed">
                  إدارة إقرارات المباشرة للموظفين وتسكينهم على جداول العمل الأسبوعية (48 ساعة عمل / 6 أيام) أو فترات الشفتات المخصصة وفقاً لقانون العمل الكويتي واللوائح المعتمدة.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setShowFullCommencementApp(true);
                  toast.success('تم فتح شاشة إدارة المباشرة والدوام بنجاح! 🚀');
                }}
                className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2 rounded-xl text-xs font-black transition shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>فتح واجهة إدارة المباشرة والدوام الكاملة</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Odoo Style Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-3xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">على رأس العمل</span>
                  <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs">✓ نشط</span>
                </div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                  {visibleEmployees.filter(e => e.status?.toUpperCase() === 'ACTIVE' || e.status?.toLowerCase() === 'active').length}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">موظفين باشروا عملهم رسمياً وبصمتهم مفعلة</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-3xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">في انتظار المباشرة</span>
                  <span className="p-1 rounded-lg bg-amber-50 text-amber-600 text-xs">⚠️ معلق</span>
                </div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                  {visibleEmployees.filter(e => e.status?.toUpperCase() !== 'ACTIVE' && e.status?.toLowerCase() !== 'active' && !e.isDeleted).length}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">موظفين مسجلين لم يتم تفعيل إقرار المباشرة لهم بعد</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-3xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">جداول الدوام المعتمدة</span>
                  <span className="p-1 rounded-lg bg-blue-50 text-blue-600 text-xs">📅 Odoo Calendar</span>
                </div>
                <div className="text-2xl font-black text-slate-800 font-mono">6 جاهزة</div>
                <p className="text-[10px] text-slate-400 mt-1">جداول عمل قياسية، شفتات، ودوام مرن مجهزة للتسكين</p>
              </div>
            </div>

            {/* Core Guide Block (Odoo standard process layout) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-3xs p-6">
              <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <span>🛠️</span> دورة حياة التعيين والمباشرة المتكاملة في نظام المنارة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Step 1 */}
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-black flex items-center justify-center">1</span>
                    <h4 className="text-xs font-black text-slate-700">توقيع العقد (Contract Signed)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pr-8">
                    يتم توقيع العقد وتحديد باقة الأجور (Basic & Allowances) في تطبيق <strong>العقود والرواتب</strong>. تظل حالة الموظف "معلقة" في النظام مؤقتاً حتى إثبات الحضور.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center justify-center">2</span>
                    <h4 className="text-xs font-black text-slate-700">تفعيل مباشرة العمل الرسمية</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pr-8">
                    بمجرد حضور الموظف، يتم فتح تطبيق <strong>مباشرة العمل</strong> واختيار تاريخ المباشرة الفعلي، ثم ربطه بجدول دوام رسمي وشفت وبصمة معتمدة.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 border border-purple-300 text-purple-800 text-xs font-black flex items-center justify-center">3</span>
                    <h4 className="text-xs font-black text-slate-700">المزامنة مع الرواتب وبوابة الذكاء</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pr-8">
                    فور تفعيل المباشرة، تتغير حالة الموظف لـ <strong>ACTIVE</strong> تلقائياً، ويبدأ استحقاق الراتب، وتدفق ساعات العمل والبصمة الذكية إلى مسيرات الرواتب WPS.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-2.5 text-xs text-slate-500 max-w-xl">
                  <span className="text-base leading-none mt-0.5">💡</span>
                  <p className="leading-relaxed text-[11px]">
                    <strong>تنظيم حوكمة الموارد البشرية:</strong> إلغاء إدخال بيانات المباشرة اليدوية في دليل الموظفين يمنع بنسبة 100% حدوث تباين أو تضارب في تواريخ المباشرة الفعلية التي تبنى عليها عقود التأمينات الاجتماعية وقانون العمل بدولة الكويت.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowFullCommencementApp(true);
                    toast.success('تم الانتقال بنجاح! 🚀');
                  }}
                  className="w-full sm:w-auto bg-[#107c41] hover:bg-[#0b6232] text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>الذهاب لتطبيق مباشرة العمل الآن</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* 3.4 خطط التهيئة والتعيين (Onboarding Plans & Form Wizard) */}
      {activeTab === 'onboarding' && (
        <div className="animate-in fade-in duration-300">
          <OnboardingTrackerApp 
            existingEmployees={employees} 
            onEmployeeCreated={(newEmp) => {
              setEmployees(prev => {
                const exists = prev.some(e => e.id === newEmp.id || (e.civilId && e.civilId === newEmp.civilId));
                if (exists) return prev;
                return [newEmp, ...prev];
              });
            }}
          />
        </div>
      )}



      {/* 4. شريط الأنشطة والمتابعة الموحد أسفل الصفحة (Odoo Chatter) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1.5 hover:text-slate-900 font-semibold transition">
            <span>✉️</span> إرسال رسالة
          </button>
          <button className="flex items-center gap-1.5 text-purple-900 font-bold border-b-2 border-purple-900 pb-0.5">
            <span>📝</span> تسجيل ملاحظة
          </button>
          <button className="flex items-center gap-1.5 hover:text-slate-900 font-semibold transition">
            <span>⏰</span> جدولة نشاط (Schedule Activity)
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>👤 1 متابعين</span>
        </div>
      </div>


      {/* 6. نموذج إقرار المباشرة وتراخيص MOH الرسمية (Work Commencement Form Modal) */}
      {showCommencementModal && selectedCommencement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            
            {/* T-Bar / Header */}
            <div className="bg-[#107c41] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <h2 className="text-base font-bold">إقرار مباشرة العمل وتراخيص وزارة الصحة (Work Commencement)</h2>
                  <p className="text-xs text-emerald-100 font-mono">رقم الإقرار: {selectedCommencement.id} | دولة الكويت</p>
                </div>
              </div>

              <button 
                onClick={() => setShowCommencementModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Action Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-max">
                <button
                  onClick={() => {
                    const updated = { ...selectedCommencement, status: 'معتمد ومثبت' };
                    setSelectedCommencement(updated);
                    setCommencements(commencements.map(c => c.id === updated.id ? updated : c));
                    alert('تم اعتماد وثيقة مباشرة العمل وتحديث حالة الموظف بنجاح');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>✓</span> اعتماد وتثبيت المباشرة (على رأس العمل)
                </button>
                <button
                  onClick={() => handleTriggerPrint(`إقرار مباشرة العمل - ${selectedCommencement?.employeeName || selectedCommencement?.nameAr || ''}`, selectedCommencement)}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                >
                  <span>🖨️</span> طباعة إقرار المباشرة (A4)
                </button>
              </div>
              <div className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                الحالة: {selectedCommencement.status}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">اسم الموظف / الطبيب</label>
                  <input 
                    type="text" 
                    value={selectedCommencement.employeeName}
                    onChange={(e) => setSelectedCommencement({...selectedCommencement, employeeName: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">الرقم المدني الكويتي (12 رقم)</label>
                  <input 
                    type="text" 
                    value={selectedCommencement.civilId}
                    onChange={(e) => setSelectedCommencement({...selectedCommencement, civilId: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">تاريخ المباشرة الفعلي (Commencement Date)</label>
                  <input 
                    type="date" 
                    value={selectedCommencement.commencementDate}
                    onChange={(e) => setSelectedCommencement({...selectedCommencement, commencementDate: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">القسم / جهة العمل المشرفة</label>
                  <select
                    value={selectedCommencement.supervisingDept}
                    onChange={(e) => handleMasterDropdownChange(e.target.value, 'supervisingDept', selectedCommencement, setSelectedCommencement, masterDepts, setMasterDepts, 'أدخل اسم القسم الجديد:')}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    {masterDepts.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="__ADD_NEW__" className="text-emerald-700 font-bold">➕ إضافة قسم جديد...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">حالة الفحص الطبي واللائق صحياً</label>
                  <input 
                    type="text" 
                    value={selectedCommencement.healthCheckStatus}
                    onChange={(e) => setSelectedCommencement({...selectedCommencement, healthCheckStatus: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-800 bg-emerald-50/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">حالة بصمات الأدلة الجنائية (وزارة الداخلية)</label>
                  <input 
                    type="text" 
                    value={selectedCommencement.fingerprintStatus}
                    onChange={(e) => setSelectedCommencement({...selectedCommencement, fingerprintStatus: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-800 bg-emerald-50/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">ترخيص وزارة الصحة (MOH License Status)</label>
                  <input 
                    type="text" 
                    value={selectedCommencement.mohLicenseStatus}
                    onChange={(e) => setSelectedCommencement({...selectedCommencement, mohLicenseStatus: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-purple-900 bg-purple-50/50"
                  />
                </div>
              </div>

              {/* Odoo Chatter inside Commencement Modal */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <span>💬</span> سجل الملاحظات والأنشطة (Odoo Chatter)
                </h4>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedCommencement.chatter?.map((msg: any) => (
                    <div key={msg.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span className="font-bold text-emerald-800">{msg.user}</span>
                        <span>{msg.date}</span>
                      </div>
                      <div className="text-slate-700">{msg.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleAddChatter('commencement', e)} className="flex gap-2 pt-2">
                  <input 
                    type="text"
                    value={chatterInput}
                    onChange={(e) => setChatterInput(e.target.value)}
                    placeholder="اكتب ملاحظة أو إثبات إجراء هنا..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                  >
                    إرسال وسجل
                  </button>
                </form>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">وثيقة إقرار المباشرة معتمدة وفق اشتراطات وزارة الصحة ودولة الكويت</span>
              <button
                onClick={() => {
                  if (selectedCommencement) {
                    const updatedComs = commencements.map((c: any) => 
                      c.id === selectedCommencement.id ? selectedCommencement : c
                    );
                    setCommencements(updatedComs);
                  }
                  setShowCommencementModal(false);
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
              >
                إغلاق وحفظ
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-300" dir="rtl">
            <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>🖨️</span> معاينة الطباعة الرسمية - {printTitle}
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-slate-300 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 bg-slate-50 font-sans">
              <div className="text-center border-b border-slate-300 pb-6 space-y-2">
                <div className="text-xl font-bold text-purple-900">{activeCompany?.nameAr || activeCompany?.name || 'تقرير المنشأة'}</div>
                <div className="text-xs text-slate-500">{activeCompany?.nameEn || 'State of Kuwait'}</div>
                <div className="text-sm font-semibold text-slate-700 mt-2">{printTitle}</div>
              </div>

              {printData && (
                (() => {
                  const isLeaveReport = printTitle.includes('كشف رصيد إجازات');
                  if (isLeaveReport) {
                    const manaraLeaves = getPersistentData<any[]>('manara_leaves_data', []);
                    const odooRequests = getPersistentData<any[]>('odoo_leave_requests_v2', []);
                    const combinedList = [...manaraLeaves, ...odooRequests];

                    const empLeaves = combinedList.filter(l => {
                      const matchEmp = l.employeeId === printData.id || 
                                       (printData.civilId && l.civilId && l.civilId === printData.civilId) ||
                                       (printData.civil_id_number && l.civilId && l.civilId === printData.civil_id_number);
                      if (!matchEmp) return false;

                      const normType = String(l.leaveType || '').toUpperCase();
                      const normStatus = String(l.status || '').toUpperCase();
                      const isApproved = normStatus === 'APPROVED' || normStatus === 'VALIDATED';
                      return normType === 'ANNUAL' && isApproved;
                    });
                    
                    const totalTaken = empLeaves.reduce((sum, l) => sum + (Number(l.totalDays || l.daysCount) || 0), 0);
                    const carriedOver = getCarriedOverBalance(printData);
                    const accrued2026 = get_aysed_official_balance(printData);
                    const compensatory = getGlobalCompensatoryDays(printData);
                    const netAvailable = Number((carriedOver + accrued2026 + compensatory - totalTaken).toFixed(1));

                    return (
                      <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-slate-800 border-b pb-2 mb-3 flex items-center gap-1.5">
                            <span>👤</span> بيانات الموظف الأساسية (Employee Info)
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                            <div><strong className="text-slate-500">اسم الموظف:</strong> <span className="font-bold text-slate-900">{printData.nameAr || printData.fullNameAr || 'غير متوفر'}</span></div>
                            <div><strong className="text-slate-500">الرقم المدني:</strong> <span className="font-mono">{printData.civilId || printData.civil_id_number || 'غير متوفر'}</span></div>
                            <div><strong className="text-slate-500">الجنسية:</strong> <span>{printData.nationality || 'غير متوفر'}</span></div>
                            <div><strong className="text-slate-500">المسمى الوظيفي:</strong> <span>{printData.jobTitle || 'غير متوفر'}</span></div>
                            <div><strong className="text-slate-500">القسم / الإدارة:</strong> <span>{printData.dept || printData.department || 'غير متوفر'}</span></div>
                            <div><strong className="text-slate-500">تاريخ التعيين:</strong> <span className="font-mono">{printData.hireDate || printData.joinDate || '2026-01-01'}</span></div>
                          </div>
                        </div>

                        {/* Leave Balance Sheet Table */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-slate-800 border-b pb-2 mb-3 flex items-center gap-1.5">
                            <span>📊</span> تفاصيل رصيد الإجازات المعتمد (Approved Balances)
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="text-[10px] text-slate-500 font-bold mb-1">الرصيد المرحل</div>
                              <div className="text-base font-black text-slate-800 font-mono">{carriedOver} يوم</div>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-200">
                              <div className="text-[10px] text-purple-900 font-bold mb-1">المستحق لعام 2026</div>
                              <div className="text-base font-black text-[#714B67] font-mono">+{accrued2026} يوم</div>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                              <div className="text-[10px] text-emerald-900 font-bold mb-1">أيام تعويضية مضافة</div>
                              <div className="text-base font-black text-emerald-800 font-mono">+{compensatory} يوم</div>
                            </div>
                            <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200">
                              <div className="text-[10px] text-rose-900 font-bold mb-1">المستهلك الفعلي</div>
                              <div className="text-base font-black text-rose-800 font-mono">-{totalTaken} يوم</div>
                            </div>
                            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 col-span-2 md:col-span-1">
                              <div className="text-[10px] text-teal-950 font-bold mb-1">الرصيد المتاح الصافي</div>
                              <div className="text-lg font-black text-teal-900 font-mono">{netAvailable} يوم</div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Leave Requests List */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                          <h4 className="text-xs font-bold text-slate-800 border-b pb-2 mb-1 flex items-center gap-1.5">
                            <span>📅</span> سجل طلبات الإجازات السنوية المصدقة (Annual Leaves Log)
                          </h4>
                          {empLeaves.length === 0 ? (
                            <div className="text-center py-4 text-slate-400 font-bold text-xs">لا يوجد حركات إجازات معتمدة مسجلة لهذا الموظف.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-right text-xs table-auto">
                                <thead className="bg-slate-100 text-slate-700 font-bold">
                                  <tr>
                                    <th className="p-2 border">تاريخ البدء</th>
                                    <th className="p-2 border">تاريخ الانتهاء</th>
                                    <th className="p-2 border text-center">المدة (أيام)</th>
                                    <th className="p-2 border">السبب / نوع الطلب</th>
                                    <th className="p-2 border text-center">الحالة</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {empLeaves.slice(0, 8).map((l, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                      <td className="p-2 border font-mono">{l.startDate}</td>
                                      <td className="p-2 border font-mono">{l.endDate}</td>
                                      <td className="p-2 border text-center font-mono font-bold">{l.totalDays} يوم</td>
                                      <td className="p-2 border">{l.reason || 'إجازة سنوية اعتيادية'}</td>
                                      <td className="p-2 border text-center">
                                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold">معتمد</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Official Signatures Section */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-3 gap-6 text-center text-xs pt-8">
                          <div className="space-y-12">
                            <div className="font-bold text-slate-600">إقرار وتوقيع الموظف</div>
                            <div className="border-b border-slate-300 w-3/4 mx-auto"></div>
                            <div className="text-[10px] text-slate-400">التوقيع: ............................</div>
                          </div>
                          <div className="space-y-12">
                            <div className="font-bold text-slate-600">مسؤول شؤون الموظفين</div>
                            <div className="border-b border-slate-300 w-3/4 mx-auto"></div>
                            <div className="text-[10px] text-slate-400">التوقيع والختم</div>
                          </div>
                          <div className="space-y-12">
                            <div className="font-bold text-slate-600">اعتماد مدير الموارد البشرية</div>
                            <div className="border-b border-slate-300 w-3/4 mx-auto"></div>
                            <div className="text-[10px] text-slate-400">التوقيع والختم الرسمي</div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default view for other prints
                  return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong className="text-slate-500">الاسم:</strong> {printData.nameAr || printData.employeeName || printData.refTitle || 'غير متوفر'}</div>
                        <div><strong className="text-slate-500">المعرف / الرقم:</strong> {printData.id || printData.employeeId || 'N/A'}</div>
                        <div><strong className="text-slate-500">الرقم المدني:</strong> {printData.civilId || printData.civil_id_number || '290010112345'}</div>
                        <div><strong className="text-slate-500">المسمى الوظيفي:</strong> {printData.jobTitle || printData.jobPosition || 'غير متوفر'}</div>
                        <div><strong className="text-slate-500">القسم:</strong> {printData.dept || printData.department || 'غير متوفر'}</div>
                        <div><strong className="text-slate-500">تاريخ التعيين / الإصدار:</strong> {printData.hireDate || printData.startDate || printData.commencementDate || '2026-01-01'}</div>
                      </div>
                      <div className="border-t pt-4 mt-4 flex justify-between items-center text-[11px] text-slate-500">
                        <div>معتمد من إدارة الموارد البشرية والشؤون الإدارية (Odoo 18 ERP)</div>
                        <div>تاريخ الطباعة: {new Date().toLocaleDateString('ar-KW')}</div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => setShowPrintModal(false)}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  const isLeaveReport = printTitle.includes('كشف رصيد إجازات');
                  if (isLeaveReport && printData) {
                    const html = generateLeavePrintHtml(printData, activeCompany?.nameAr || activeCompany?.name || 'تقرير المنشأة', activeCompany?.nameEn || 'State of Kuwait');
                    safePrintA4Document(html);
                    setShowPrintModal(false);
                  } else {
                    safePrintAction(printTitle || 'مستند رسمي');
                  }
                }}
                className="bg-purple-900 hover:bg-purple-950 text-white px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>🖨️</span> طباعة المستند الآن (Print)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAM Contract Modal Mount */}
      {showPamContractModal && selectedEmployee && (
        <OdooPamContractModal
          isOpen={showPamContractModal}
          onClose={() => setShowPamContractModal(false)}
          employee={{
            ...selectedEmployee,
            name: selectedEmployee.nameAr || selectedEmployee.name,
            civilId: selectedEmployee.civilId || selectedEmployee.civil_id_number,
            jobTitle: selectedEmployee.jobTitle,
            dept: selectedEmployee.dept || selectedEmployee.department,
            basicSalary: selectedEmployee.basicSalary || selectedEmployee.salary,
            housingAllowance: selectedEmployee.housingAllowance,
            transportAllowance: selectedEmployee.transportAllowance,
            medicalAllowance: selectedEmployee.medicalAllowance,
            startDate: selectedEmployee.contractStartDate || selectedEmployee.startDate || selectedEmployee.hireDate,
            endDate: selectedEmployee.contractEndDate || selectedEmployee.endDate
          }}
          company={activeCompany}
        />
      )}

      {/* مودال تأكيد التصفير الشامل التفاعلي (In-App Database Wipe Modal) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full overflow-hidden text-right">
            <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-base">تأكيد التصفير الشامل للنظام</h3>
                  <p className="text-xs text-rose-100">مسح قاعدة البيانات والتخزين المؤقت</p>
                </div>
              </div>
              <button 
                onClick={() => !isResetting && setShowResetConfirmModal(false)}
                disabled={isResetting}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 leading-relaxed space-y-2">
                <p className="font-bold text-sm text-rose-800">⚠️ تنبيه هام وحاسم:</p>
                <p>
                  سيتم فوراً مسح وتصفير كافة سجلات الموظفين، عقود العمل، إقرارات المباشرة، حركات البصمة، طلبات وأرصدة الإجازات، مسيرات الرواتب وسندات الصرف من قاعدة البيانات السحابية والتخزين المحلي.
                </p>
                <p className="font-medium text-slate-700">
                  سيكون النظام نظيفاً وأبيض بالكامل وجاهزاً لإدخال بياناتك الفعلية الجديدة.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePerformFullReset}
                  disabled={isResetting}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>جارِ التصفير ومسح السجلات...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>نعم، تصفير ومسح الكل الآن</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  disabled={isResetting}
                  className="px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* معالج تسجيل الموظف وخطة التهيئة والتعيين الموحد */}
      <OnboardingWizardModal
        isOpen={showOnboardingWizardModal}
        onClose={() => setShowOnboardingWizardModal(false)}
        onConfirmLaunch={handleConfirmOnboardingPlan}
        existingEmployees={employees}
      />

      {/* نموذج إضافة وتعديل الموظف المباشر (Odoo Employee Form Modal) */}
      <OdooEmployeeFormModal
        isOpen={showAddEmployeeModal || showEmployeeModal}
        onClose={() => {
          setShowAddEmployeeModal(false);
          setShowEmployeeModal(false);
        }}
        onSave={(newEmp) => {
          handleSaveEmployee(newEmp);
          setShowAddEmployeeModal(false);
          setShowEmployeeModal(false);
        }}
        existingEmployees={employees}
        activeCompanyId={currentCompanyId}
      />

    </div>
  );
}

export default EmployeesApp;
