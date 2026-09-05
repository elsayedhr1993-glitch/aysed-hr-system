import React, { useState, useEffect } from 'react';
import { Users, Clock, Stethoscope, AlertTriangle, X, FileText, Printer, Calendar, RefreshCw, DollarSign, CheckCircle2, Building2, Briefcase, ExternalLink, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import OdooEmployeeFormModal from '../components/OdooEmployeeFormModal';
import { OdooEmployeeDetailView } from '../components/employees/OdooEmployeeDetailView';
import OdooContractsApp from "../components/OdooContractsApp";
import OdooPamContractModal from '../components/OdooPamContractModal';
import { useCompany } from '../context/CompanyContext';
import { TenantDatabaseService } from '../services/tenantDataService';
import { safePrintAction } from '../guards/SystemIntegrityGuard';

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

export function EmployeesApp(props?: any) {
  const { activeCompany, activeCompanyId } = useCompany();
  const currentCompanyId = activeCompanyId || activeCompany?.id || 'comp-super-admin';

  const [activeTab, setActiveTab] = useState<'directory' | 'contracts' | 'commencement'>('directory');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  
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
  const [isResetting, setIsResetting] = useState(false);

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
                hireDate: emp.joinDate || (emp as any).hireDate || new Date().toISOString().slice(0, 10),
                mohLicense: emp.mohLicenseNo || (emp as any).mohLicense || '',
                mohLicenseExpiry: emp.mohLicenseExpiry || '',
                specialty: (emp as any).specialty || '',
                degree: (emp as any).degree || '',
                contractType: (emp as any).contractType || 'دائم',
                basicSalary: (emp as any).basicSalary || (emp as any).contractSalary || 1000,
                allowances: (emp as any).allowances || 0,
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
    setSelectedEmployee(emp);
    setShowEmployeeModal(false);
  };

  // إنشاء موظف جديد كصفحة كاملة نظيفة
  const handleCreateNewEmployee = () => {
    const nextSeq = employees.length + 1;
    const defaultDept = selectedDept !== 'الكل' ? selectedDept : 'الموارد البشرية';
    
    // Auto-detect if medical staff based on department to set a relevant default job title
    const isMedicalDept = ['الأطباء', 'التمريض'].includes(defaultDept);
    const defaultJobTitle = defaultDept === 'الأطباء' ? 'طبيب أخصائي' : 
                            defaultDept === 'التمريض' ? 'ممرض عام' : 'موظف إداري';

    const newEmp = {
      id: `EMP-2026-${String(nextSeq).padStart(3, '0')}`,
      nameAr: '',
      nameEn: '',
      fullNameAr: '',
      fullNameEn: '',
      civilId: '',
      civil_id_number: '',
      civilIdExpiry: '',
      jobTitle: defaultJobTitle,
      dept: defaultDept,
      companyId: currentCompanyId,
      basicSalary: 350,
      housingAllowance: 50,
      transportAllowance: 25,
      medicalAllowance: 25,
      allowances: 0,
      hireDate: '2026-01-01',
      contractStartDate: '2026-01-01',
      contractEndDate: '2027-01-01',
      contractType: 'محدد المدة',
      contractStatus: 'ساري',
      status: 'active',
      mohLicense: '',
      phone: '',
      email: '',
      nationality: 'كويتي',
      avatarColor: 'bg-[#714B67]',
      pifssStatus: 'subscribed',
      isNewRecord: true
    };
    setSelectedEmployee(newEmp);
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
      joinDate: (updatedEmp.hireDate || updatedEmp.joinDate || '2026-01-01').slice(0, 10),
      hireDate: (updatedEmp.hireDate || updatedEmp.joinDate || '2026-01-01').slice(0, 10),
      mohLicenseNo: updatedEmp.mohLicense || updatedEmp.mohLicenseNo,
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

    setSelectedEmployee(payload);
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
    if (activeCompanyId === 'comp-super-admin') {
      return true;
    }
    return empCompanyId === activeCompanyId;
  });

  // 4. KPI Alert Cards State & Quick Filtering
  const [kpiFilter, setKpiFilter] = useState<'all' | 'residency_expiring' | 'moh_expiring' | 'expired'>('all');

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

  const activeEmployeesCount = visibleEmployees.length;
  const residencyExpiringCount = visibleEmployees.filter(checkResidencyExpiringSoon).length;
  const mohExpiringCount = visibleEmployees.filter(checkMohLicenseExpiringSoon).length;
  const expiredDocsCount = visibleEmployees.filter(checkExpiredDocs).length;

  const filteredEmployees = visibleEmployees.filter(emp => {
    const matchDept = selectedDept === 'الكل' || emp.dept === selectedDept || emp.department === selectedDept;
    const matchSearch = (emp.nameAr || emp.fullNameAr || '').includes(searchQuery) || 
                        (emp.civilId || emp.civil_id_number || '').includes(searchQuery) || 
                        (emp.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (emp.jobTitle || '').includes(searchQuery);

    let matchesKpi = true;
    if (kpiFilter === 'residency_expiring') {
      matchesKpi = checkResidencyExpiringSoon(emp);
    } else if (kpiFilter === 'moh_expiring') {
      matchesKpi = checkMohLicenseExpiringSoon(emp);
    } else if (kpiFilter === 'expired') {
      matchesKpi = checkExpiredDocs(emp);
    }

    return matchDept && matchSearch && matchesKpi;
  });

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
    <div className="flex-1 flex flex-col bg-slate-100 overflow-y-auto w-full p-4 font-sans select-none text-slate-800" dir="rtl">
      
      {/* 1. الترويسة الرئيسية مع شريط التبويبات الفرعية */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-3">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
              👥
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800">
                دليل وبطاقات الموظفين وعقود العمل (Odoo 18 Enterprise)
              </h1>
              <p className="text-xs text-slate-500">
                المنشأة: {activeCompany?.nameAr || activeCompany?.name || 'المنشأة النشطة'} | قانون العمل الكويتي رقم 6 لسنة 2010 وتراخيص وزارة الصحة
              </p>
            </div>
          </div>

          {/* شريط التبويبات الأربعة المتطابق */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 gap-1">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'directory' ? 'bg-white text-purple-900 shadow-sm border border-slate-200' : 'hover:bg-slate-200/60'
              }`}
            >
              <span>📇</span> دليل وبطاقات الموظفين
            </button>

            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'contracts' ? 'bg-white text-purple-900 shadow-sm border border-slate-200' : 'hover:bg-slate-200/60'
              }`}
            >
              <span>📝</span> العقود والرواتب
            </button>

            <button
              onClick={() => setActiveTab('commencement')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'commencement' ? 'bg-white text-purple-900 shadow-sm border border-slate-200' : 'hover:bg-slate-200/60'
              }`}
            >
              <span>🏥</span> إقرارات المباشرة وتراخيص MOH
            </button>
          </div>
        </div>

        {/* 2. شريط الأزرار الفعالة */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 min-w-max">
            {activeTab === 'directory' && (
              <button 
                onClick={handleCreateNewEmployee}
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>+</span>
                <span>تسجيل موظف جديد (hr.employee)</span>
              </button>
            )}

            <button 
              onClick={() => handleTriggerPrint(activeTab === 'directory' ? 'سجل الموظفين الشامل' : activeTab === 'contracts' ? 'سجل عقود العمل' : 'إقرارات مباشرة العمل', { nameAr: activeCompany?.nameAr || activeCompany?.name || 'تقرير المنشأة' })}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>🖨️</span> طباعة الصفحة
            </button>

            <button 
              onClick={exportToExcel}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-emerald-700 border-emerald-300 hover:bg-emerald-50 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>📊</span> تصدير Excel
            </button>

            <button 
              onClick={() => setShowResetConfirmModal(true)}
              className="bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="تصفير ومسح كافة الموظفين والعقود"
            >
              <Trash2 size={14} className="text-rose-600" />
              <span>تصفير وحذف الكل</span>
            </button>
          </div>

          {activeTab === 'directory' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button 
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${viewMode === 'cards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                بطاقات ▦
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                قائمة ☰
              </button>
            </div>
          )}
        </div>

        {activeTab === 'directory' && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
            {/* 1. Odoo Enterprise KPI & Alert Cards Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* Card 1: Active Employees */}
              <div
                onClick={() => setKpiFilter('all')}
                className={`bg-white p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between group ${
                  kpiFilter === 'all'
                    ? 'border-[#714B67] ring-2 ring-[#714B67]/20 bg-gradient-to-br from-white to-purple-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block">إجمالي القوة العاملة (Active)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 font-mono">{activeEmployeesCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">موظف مفعّل</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">جميع الموظفين على رأس عملهم</span>
                </div>
                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
                  kpiFilter === 'all' ? 'bg-[#714B67] text-white shadow-xs' : 'bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-[#714B67]'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Residencies Expiring Soon */}
              <div
                onClick={() => setKpiFilter(prev => prev === 'residency_expiring' ? 'all' : 'residency_expiring')}
                className={`bg-white p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between group ${
                  kpiFilter === 'residency_expiring'
                    ? 'border-amber-500 ring-2 ring-amber-500/30 bg-gradient-to-br from-white to-amber-50/50 scale-[1.01]'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">إقامات تنتهي قريباً</span>
                    {residencyExpiringCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-600 font-mono">{residencyExpiringCount}</span>
                    <span className="text-[10px] text-amber-700/80 font-bold">خلال 60 يوماً</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">لتفادي غرامات ومخالفات الشؤون</span>
                </div>
                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
                  kpiFilter === 'residency_expiring' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: MOH Medical Licenses Expiring Soon */}
              <div
                onClick={() => setKpiFilter(prev => prev === 'moh_expiring' ? 'all' : 'moh_expiring')}
                className={`bg-white p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between group ${
                  kpiFilter === 'moh_expiring'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-gradient-to-br from-white to-indigo-50/50 scale-[1.01]'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">تراخيص MOH تنتهي قريباً</span>
                    {mohExpiringCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-indigo-600 font-mono">{mohExpiringCount}</span>
                    <span className="text-[10px] text-indigo-700/80 font-bold">ترخيص طبي</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">مزاولة المهنة كادر الأطباء والتمريض</span>
                </div>
                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
                  kpiFilter === 'moh_expiring' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                }`}>
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Expired Residencies & Documents */}
              <div
                onClick={() => setKpiFilter(prev => prev === 'expired' ? 'all' : 'expired')}
                className={`bg-white p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between group ${
                  kpiFilter === 'expired'
                    ? 'border-rose-500 ring-2 ring-rose-500/30 bg-gradient-to-br from-white to-rose-50/50 scale-[1.01]'
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">إقامات / مستندات منتهية</span>
                    {expiredDocsCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-rose-600 font-mono">{expiredDocsCount}</span>
                    <span className="text-[10px] text-rose-700/80 font-bold">حالة حرجة</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">تجاوزت تاريخ الصلاحية الفعلي</span>
                </div>
                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
                  kpiFilter === 'expired' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Active Quick Filter Notice Banner */}
            {kpiFilter !== 'all' && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 animate-fadeIn text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">التصفية النشطة:</span>
                  <span className={`px-2.5 py-0.5 rounded-lg font-bold border flex items-center gap-1.5 ${
                    kpiFilter === 'residency_expiring' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    kpiFilter === 'moh_expiring' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                    'bg-rose-100 text-rose-900 border-rose-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    <span>
                      {kpiFilter === 'residency_expiring' && 'عرض الموظفين: إقامات تنتهي قريباً (خلال 60 يوماً)'}
                      {kpiFilter === 'moh_expiring' && 'عرض الموظفين: تراخيص MOH تنتهي قريباً'}
                      {kpiFilter === 'expired' && 'عرض الموظفين: إقامات ومستندات منتهية الصلاحية'}
                    </span>
                  </span>
                  <span className="text-slate-400 font-bold">
                    (المطابق: {filteredEmployees.length} موظف)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setKpiFilter('all')}
                  className="font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <X size={13} />
                  <span>إلغاء الفلتر واظهار الكل</span>
                </button>
              </div>
            )}

            {/* Search Bar & Department Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="relative w-72">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الرقم المدني أو الوظيفة..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <span className="absolute right-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              {['الكل', 'الموارد البشرية', 'الإدارة العليا', 'الأطباء', 'التمريض', 'الأمن والخدمات'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedDept === dept ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>



      {/* 3.1 دليل وبطاقات الموظفين */}
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
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {filteredEmployees.map((emp) => (
                    <div 
                      key={emp.id} 
                      onClick={() => openEmployeeModal(emp)}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition cursor-pointer relative flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl ${emp.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                              {emp.nameAr.slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-xs group-hover:text-purple-900 transition">{emp.nameAr}</h3>
                              <p className="text-[11px] text-slate-500">{emp.jobTitle}</p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {emp.dept}
                                </span>
                                <span className="inline-block bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                  🏢 companyId: {emp.companyId || (emp as any).company_id}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">
                            {emp.id}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-3 font-mono">
                          <div className="flex items-center justify-between">
                            <span>📞 {emp.phone}</span>
                            <span className="text-emerald-700 font-bold">{emp.mohLicense}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {(emp.basicSalary + emp.allowances).toFixed(3)} د.ك
                        </span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEmployeeModal(emp)}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded font-bold transition text-[10px] flex items-center gap-1"
                            title="تعديل وعرض الملف"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={(e) => handleDeleteEmployee(emp.id, emp.nameAr, e)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold transition text-[10px] flex items-center gap-1"
                            title="حذف الموظف"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-3.5">المعرف</th>
                        <th className="p-3.5">اسم الموظف</th>
                        <th className="p-3.5">الرقم المدني</th>
                        <th className="p-3.5">المسمى الوظيفي والقسم</th>
                        <th className="p-3.5">ترخيص وزارة الصحة</th>
                        <th className="p-3.5">الراتب الشامل</th>
                        <th className="p-3.5 text-center">الإجراء والتحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => openEmployeeModal(emp)}>
                          <td className="p-3.5 font-mono text-purple-900 font-bold">{emp.id}</td>
                          <td className="p-3.5 font-bold text-slate-800">{emp.nameAr}</td>
                          <td className="p-3.5 font-mono text-slate-600">{emp.civilId}</td>
                          <td className="p-3.5 text-slate-700">
                            <div>{emp.jobTitle}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-400">{emp.dept}</span>
                              <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded font-mono font-bold">
                                🏢 {emp.companyId || (emp as any).company_id}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-purple-800 font-bold">{emp.mohLicense}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-700">{(emp.basicSalary + emp.allowances).toFixed(3)} د.ك</td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEmployeeModal(emp)}
                                className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1 rounded font-bold transition text-[11px] flex items-center gap-1"
                                title="تعديل وعرض الملف"
                              >
                                ✏️ تعديل
                              </button>
                              <button
                                onClick={(e) => handleDeleteEmployee(emp.id, emp.nameAr, e)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1 rounded font-bold transition text-[11px] flex items-center gap-1"
                                title="حذف الموظف"
                              >
                                🗑️ حذف
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

      {/* 3.3 إقرارات المباشرة وتراخيص MOH */}
      {activeTab === 'commencement' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">إقرارات المباشرة وتراخيص وزارة الصحة (Work Commencement & MOH)</h2>
              <p className="text-[11px] text-emerald-200 mt-0.5">إدارة إقرارات مباشرة العمل، فحص اللياقة الصحية، بصمات الأدلة الجنائية، وتراخيص مزاولة المهنة الرسمية بدولة الكويت</p>
            </div>
            <button
              onClick={handleCreateCommencement}
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
            >
              + إصدار إقرار مباشرة
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3.5">رقم الإقرار</th>
                  <th className="p-3.5">اسم الموظف والرقم المدني</th>
                  <th className="p-3.5">تاريخ المباشرة الفعلي</th>
                  <th className="p-3.5">حالة الفحص والبصمات</th>
                  <th className="p-3.5">ترخيص وزارة الصحة</th>
                  <th className="p-3.5">القسم المشرف</th>
                  <th className="p-3.5 text-center">الإجراء والطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commencements.map((com) => (
                  <tr key={com.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => openCommencementModal(com)}>
                    <td className="p-3.5 font-mono text-emerald-800 font-bold">{com.id}</td>
                    <td className="p-3.5 font-bold text-slate-800">
                      <div>{com.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{com.civilId}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">{com.commencementDate}</td>
                    <td className="p-3.5 text-slate-600">
                      <div className="font-semibold text-emerald-700">{com.healthCheckStatus}</div>
                      <div className="text-[10px] text-slate-400">{com.fingerprintStatus}</div>
                    </td>
                    <td className="p-3.5 font-mono text-purple-700 font-bold">{com.mohLicenseStatus}</td>
                    <td className="p-3.5 text-slate-700">{com.supervisingDept}</td>
                    <td className="p-3.5 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); openCommencementModal(com); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-bold transition text-[11px]"
                      >
                        فتح النموذج 👁️
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleTriggerPrint('إقرار مباشرة العمل الرسمي', com); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-bold transition text-[11px]"
                      >
                        طباعة A4 🖨️
                      </button>
                      <button
                        onClick={(e) => handleDeleteCommencement(com.id, e)}
                        className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold transition text-[11px]"
                        title="حذف الإقرار"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong className="text-slate-500">الاسم:</strong> {printData.nameAr || printData.employeeName || printData.refTitle || 'غير متوفر'}</div>
                    <div><strong className="text-slate-500">المعرف / الرقم:</strong> {printData.id || printData.employeeId || 'N/A'}</div>
                    <div><strong className="text-slate-500">الرقم المدني:</strong> {printData.civilId || '290010112345'}</div>
                    <div><strong className="text-slate-500">المسمى الوظيفي:</strong> {printData.jobTitle || printData.jobPosition || 'غير متوفر'}</div>
                    <div><strong className="text-slate-500">القسم:</strong> {printData.dept || printData.department || 'غير متوفر'}</div>
                    <div><strong className="text-slate-500">تاريخ التعيين / الإصدار:</strong> {printData.hireDate || printData.startDate || printData.commencementDate || '2026-01-01'}</div>
                  </div>
                  <div className="border-t pt-4 mt-4 flex justify-between items-center text-[11px] text-slate-500">
                    <div>معتمد من إدارة الموارد البشرية والشؤون الإدارية (Odoo 18 ERP)</div>
                    <div>تاريخ الطباعة: {new Date().toLocaleDateString('ar-KW')}</div>
                  </div>
                </div>
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
                  safePrintAction(printTitle || 'مستند رسمي');
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

    </div>
  );
}

export default EmployeesApp;
