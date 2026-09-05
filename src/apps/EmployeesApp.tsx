import React, { useState, useEffect } from 'react';
import { Users, Clock, Stethoscope, AlertTriangle, X, FileText, Printer, Calendar, RefreshCw, DollarSign, CheckCircle2, Building2, Briefcase, ExternalLink } from 'lucide-react';
import OdooEmployeeFormModal from '../components/OdooEmployeeFormModal';
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

  const handleDeleteEmployee = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف ملف الموظف: ${name || id} من قاعدة البيانات؟`)) {
      await TenantDatabaseService.deleteEmployee(id, currentCompanyId);
      setEmployees(prev => {
        const updated = prev.filter(emp => emp.id !== id);
        if (currentCompanyId) {
          localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(updated));
        }
        return updated;
      });
      if (selectedEmployee && String(selectedEmployee.id) === String(id)) {
        setShowEmployeeModal(false);
        setSelectedEmployee(null);
      }
    }
  };

  const handleDeleteContract = (contractId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا العقد نهائياً من سجلات النظام؟')) {
      const updated = contracts.filter((c: any) => c.id !== contractId);
      setContracts(updated);
      if (selectedContract && selectedContract.id === contractId) {
        setShowContractModal(false);
        setSelectedContract(null);
      }
      alert('تم حذف العقد بنجاح.');
    }
  };

  const handleDeleteCommencement = (comId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف إقرار المباشرة هذا نهائياً؟')) {
      const updated = commencements.filter((c: any) => c.id !== comId);
      setCommencements(updated);
      if (selectedCommencement && selectedCommencement.id === comId) {
        setShowCommencementModal(false);
        setSelectedCommencement(null);
      }
      alert('تم حذف إقرار المباشرة بنجاح.');
    }
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

  // فتح نموذج الموظف (hr.employee)
  const openEmployeeModal = (emp: any) => {
    setSelectedEmployee(emp);
    setShowEmployeeModal(true);
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
                onClick={() => setShowAddEmployeeModal(true)}
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
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


      {/* 5. نموذج بطاقة الموظف التفصيلية (Odoo Employee Form - hr.employee) */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            
            {/* T-Bar / Header */}
            <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${selectedEmployee.avatarColor} text-white flex items-center justify-center font-bold text-base shadow`}>
                  {selectedEmployee.nameAr.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 min-w-max">
                    <h2 className="text-base font-bold">{selectedEmployee.nameAr}</h2>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">{selectedEmployee.id}</span>
                  </div>
                  <p className="text-xs text-purple-200">{selectedEmployee.jobTitle} | {selectedEmployee.dept}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowEmployeeModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Smart Buttons Header */}
            <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between gap-4 text-xs overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {/* Contracts & PAM Button */}
                <button 
                  onClick={() => setEmployeeActiveTab('contract_pam')}
                  className={`border h-12 px-3 rounded shadow-sm transition flex items-center gap-3 whitespace-nowrap shrink-0 min-w-[130px] ${
                    employeeActiveTab === 'contract_pam'
                      ? 'bg-purple-50 border-purple-400 text-purple-900 ring-2 ring-purple-200'
                      : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="عرض وإدارة عقد العمل ونموذج القوى العاملة والتجديد"
                >
                  <span className="text-xl text-purple-700">📜</span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-slate-900 text-sm">عقد PAM</span>
                    <span className="text-[10px] text-purple-700 font-bold">عقد العمل والتجديد</span>
                  </div>
                </button>

                {/* Attendance Button */}
                <button 
                  onClick={() => setEmployeeSubModal('attendance')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 h-12 px-3 rounded shadow-sm transition flex items-center gap-3 whitespace-nowrap shrink-0 min-w-[120px]"
                >
                  <span className="text-xl text-emerald-600">🕒</span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-slate-900 text-sm">98%</span>
                    <span className="text-[10px] text-slate-500 font-bold">الحضور (Attendance)</span>
                  </div>
                </button>

                {/* Leave Button */}
                <button 
                  onClick={() => setEmployeeSubModal('leave')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 h-12 px-3 rounded shadow-sm transition flex items-center gap-3 whitespace-nowrap shrink-0 min-w-[120px]"
                >
                  <span className="text-xl text-blue-600">✈️</span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-slate-900 text-sm">30 يوم</span>
                    <span className="text-[10px] text-slate-500 font-bold">الإجازات (Time Off)</span>
                  </div>
                </button>

                {/* Payslips Button */}
                <button 
                  onClick={() => setEmployeeSubModal('payslips')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 h-12 px-3 rounded shadow-sm transition flex items-center gap-3 whitespace-nowrap shrink-0 min-w-[120px]"
                >
                  <span className="text-xl text-amber-600">💰</span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-slate-900 text-sm">12</span>
                    <span className="text-[10px] text-slate-500 font-bold">الرواتب (Payslips)</span>
                  </div>
                </button>

                {/* Documents Button */}
                <button 
                  onClick={() => setEmployeeSubModal('documents')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 h-12 px-3 rounded shadow-sm transition flex items-center gap-3 whitespace-nowrap shrink-0 min-w-[120px]"
                >
                  <span className="text-xl text-rose-600">📂</span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-slate-900 text-sm">5</span>
                    <span className="text-[10px] text-slate-500 font-bold">المستندات (Documents)</span>
                  </div>
                </button>

                {/* Assets Button */}
                <button 
                  onClick={() => setEmployeeSubModal('assets')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 h-12 px-3 rounded shadow-sm transition flex items-center gap-3 whitespace-nowrap shrink-0 min-w-[120px]"
                >
                  <span className="text-xl text-indigo-600">📦</span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-slate-900 text-sm">2</span>
                    <span className="text-[10px] text-slate-500 font-bold">العهد (Equipments)</span>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPamContractModal(true)}
                  className="bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-[#714B67]/40 h-12 px-3.5 rounded shadow-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  title="إصدار عقد العمل الحكومي الرسمي (نموذج 2 - القوى العاملة PAM)"
                >
                  <span className="text-base">🏛️</span>
                  <span>عقد القوى العاملة (PAM 2)</span>
                </button>

                <button
                  onClick={() => handleTriggerPrint(`ملف الموظف الشامل - ${selectedEmployee?.nameAr || ''}`, selectedEmployee)}
                  className="bg-purple-900 hover:bg-purple-950 text-white h-12 px-4 rounded shadow-sm font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span className="text-lg">🖨️</span> طباعة الملف
                </button>
              </div>
            </div>

            {/* Notebook Sub-tabs */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center bg-slate-100 border-b border-slate-200 px-4 pt-2 gap-2 text-xs font-bold text-slate-600 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <button
                    onClick={() => setEmployeeActiveTab('work')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      employeeActiveTab === 'work' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    💼 معلومات العمل (Work Information)
                  </button>

                  <button
                    onClick={() => setEmployeeActiveTab('contract_pam')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      employeeActiveTab === 'contract_pam' ? 'bg-white text-purple-900 border-slate-200 font-black -mb-px shadow-sm' : 'bg-slate-100 border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📜 عقد العمل والقوى العاملة (PAM & Contracts)
                  </button>

                  <button
                    onClick={() => setEmployeeActiveTab('private')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      employeeActiveTab === 'private' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🪪 المعلومات الخاصة / الشخصية (Private Information)
                  </button>

                  <button
                    onClick={() => setEmployeeActiveTab('hr')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      employeeActiveTab === 'hr' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ⚙️ إعدادات الموارد البشرية (HR Settings)
                  </button>

                  <button
                    onClick={() => setEmployeeActiveTab('resume')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      employeeActiveTab === 'resume' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🎓 السيرة الذاتية والمهارات (Resume & Skills)
                  </button>
                </div>

                {/* Tab 1: Work Information */}
                {employeeActiveTab === 'work' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">المسمى الوظيفي (Job Position)</label>
                        <select
                          value={selectedEmployee.jobTitle}
                          onChange={(e) => handleMasterDropdownChange(e.target.value, 'jobTitle', selectedEmployee, setSelectedEmployee, masterJobTitles, setMasterJobTitles, 'أدخل المسمى الوظيفي الجديد:')}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          {masterJobTitles.map(j => <option key={j} value={j}>{j}</option>)}
                          <option value="__ADD_NEW__" className="text-purple-700 font-bold">➕ إضافة مسمى وظيفي جديد...</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">موقع العمل / العيادة (Work Location)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.workLocation} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, workLocation: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الإدارة / القسم (Department)</label>
                        <select
                          value={selectedEmployee.dept}
                          onChange={(e) => handleMasterDropdownChange(e.target.value, 'dept', selectedEmployee, setSelectedEmployee, masterDepts, setMasterDepts, 'أدخل اسم القسم الجديد:')}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          {masterDepts.map(d => <option key={d} value={d}>{d}</option>)}
                          <option value="__ADD_NEW__" className="text-purple-700 font-bold">➕ إضافة قسم جديد...</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">المدير المباشر (Coach / Manager)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.manager} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, manager: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">البريد الإلكتروني الرسمي (Work Email)</label>
                        <input 
                          type="email" 
                          value={selectedEmployee.email} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">رقم هاتف العمل (Work Phone)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.phone} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, phone: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">تاريخ المباشرة والتعيين</label>
                        <input 
                          type="date" 
                          value={selectedEmployee.hireDate} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, hireDate: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Contracts & PAM 2 Official Forms (تبويب عقد العمل والقوى العاملة وتجديد العقود) */}
                {employeeActiveTab === 'contract_pam' && (
                  <div className="p-6 space-y-6 text-xs animate-fade-in">
                    
                    {/* Header Action Banner */}
                    <div className="bg-gradient-to-r from-[#714B67]/10 via-purple-50 to-indigo-50 border border-[#714B67]/20 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#714B67] text-white rounded-xl shadow-sm">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">عقد العمل الرسمي ونموذج الهيئة العامة للقوى العاملة (PAM 2)</h4>
                          <p className="text-[11px] text-slate-600 font-medium">
                            إدارة عقود العمل وتجديدها فورياً وطباعة نموذج (2) المعتمد للقطاع الأهلي الكويتي
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Renew Contract 1 Year Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const currentEnd = selectedEmployee.contractEndDate || selectedEmployee.endDate || new Date().toISOString().slice(0, 10);
                            const nextEnd = new Date(currentEnd);
                            nextEnd.setFullYear(nextEnd.getFullYear() + 1);
                            const newEndDateStr = nextEnd.toISOString().slice(0, 10);
                            
                            const updated = {
                              ...selectedEmployee,
                              contractStatus: 'ساري',
                              contractEndDate: newEndDateStr,
                              endDate: newEndDateStr,
                              contractStartDate: selectedEmployee.contractStartDate || selectedEmployee.startDate || new Date().toISOString().slice(0, 10),
                              contractRef: selectedEmployee.contractRef || `KW-CNT-${selectedEmployee.id || '01'}-${new Date().getFullYear()}`
                            };
                            setSelectedEmployee(updated);
                            alert(`تم تجديد عقد الموظف بنجاح حتى تاريخ: ${newEndDateStr}`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <RefreshCw size={14} />
                          <span>تجديد العقد (+سنة)</span>
                        </button>

                        {/* Open PAM 2 Form */}
                        <button
                          type="button"
                          onClick={() => setShowPamContractModal(true)}
                          className="bg-[#714B67] hover:bg-[#593951] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition"
                        >
                          <ExternalLink size={14} />
                          <span>فتح وتوليد نموذج PAM 2 PDF</span>
                        </button>

                        {/* Print Contract */}
                        <button
                          type="button"
                          onClick={() => handleTriggerPrint(`عقد عمل كويتي رسمي - ${selectedEmployee?.nameAr || selectedEmployee?.name || ''}`, selectedEmployee)}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Printer size={14} />
                          <span>طباعة عقد العمل A4</span>
                        </button>
                      </div>
                    </div>

                    {/* Contract Details Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Contract Reference */}
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">مرجع العقد (Contract Reference)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.contractRef || `KW-CNT-${selectedEmployee.id || '01'}-2026`} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, contractRef: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="KW-CNT-001-2026"
                        />
                      </div>

                      {/* Contract Status */}
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">حالة العقد (Contract Status)</label>
                        <select
                          value={selectedEmployee.contractStatus || 'ساري'}
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, contractStatus: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="ساري">ساري (Running / Active)</option>
                          <option value="قيد التجديد">قيد التجديد (To Renew)</option>
                          <option value="فترة تجربة">فترة تجربة (Probation)</option>
                          <option value="منتهي">منتهي (Expired)</option>
                          <option value="ملغي">ملغي (Cancelled)</option>
                        </select>
                      </div>

                      {/* Contract Type */}
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">نوع العقد (Contract Type)</label>
                        <select
                          value={selectedEmployee.contractType || 'محدد المدة'}
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, contractType: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="محدد المدة">محدد المدة (Fixed-Term)</option>
                          <option value="غير محدد المدة">غير محدد المدة (Indefinite)</option>
                          <option value="عقد تدريب / تأهيل">عقد تدريب / تأهيل (Internship)</option>
                        </select>
                      </div>

                      {/* Start Date */}
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">تاريخ بداية العقد (Start Date)</label>
                        <input 
                          type="date" 
                          value={selectedEmployee.contractStartDate || selectedEmployee.startDate || selectedEmployee.hireDate || ''} 
                          onChange={(e) => setSelectedEmployee({
                            ...selectedEmployee, 
                            contractStartDate: e.target.value,
                            startDate: e.target.value
                          })}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">تاريخ نهاية العقد (End Date)</label>
                        <input 
                          type="date" 
                          value={selectedEmployee.contractEndDate || selectedEmployee.endDate || ''} 
                          onChange={(e) => setSelectedEmployee({
                            ...selectedEmployee, 
                            contractEndDate: e.target.value,
                            endDate: e.target.value
                          })}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      {/* Probation Period */}
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">فترة التجربة (Probation Days)</label>
                        <input 
                          type="number" 
                          value={selectedEmployee.probationDays || '100'} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, probationDays: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="100 يوماً (المادة 24)"
                        />
                      </div>

                    </div>

                    {/* Salary and Allowances Package */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <DollarSign size={15} className="text-emerald-600" />
                          <span>حزمة الأجور والبدلات الشهرية (د.ك)</span>
                        </span>
                        <div className="text-emerald-800 font-black text-sm font-mono">
                          الإجمالي: {(
                            (parseFloat(selectedEmployee.basicSalary || selectedEmployee.salary || 0)) +
                            (parseFloat(selectedEmployee.housingAllowance || 0)) +
                            (parseFloat(selectedEmployee.transportAllowance || 0)) +
                            (parseFloat(selectedEmployee.medicalAllowance || 0))
                          ).toFixed(3)} د.ك
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">الراتب الأساسي</label>
                          <input 
                            type="number" 
                            step="0.001"
                            value={selectedEmployee.basicSalary ?? selectedEmployee.salary ?? '0.000'} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, basicSalary: parseFloat(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">بدل السكن</label>
                          <input 
                            type="number" 
                            step="0.001"
                            value={selectedEmployee.housingAllowance ?? '0.000'} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, housingAllowance: parseFloat(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">بدل الانتقال</label>
                          <input 
                            type="number" 
                            step="0.001"
                            value={selectedEmployee.transportAllowance ?? '0.000'} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, transportAllowance: parseFloat(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">بدل طبي / أخرى</label>
                          <input 
                            type="number" 
                            step="0.001"
                            value={selectedEmployee.medicalAllowance ?? '0.000'} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, medicalAllowance: parseFloat(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PAM Form 2 Preview Box */}
                    <div className="bg-white border-2 border-dashed border-[#714B67]/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-black text-slate-900">
                          <span className="bg-[#714B67] text-white text-[10px] px-2 py-0.5 rounded font-mono">PAM-FORM-2</span>
                          <span>نموذج عقد العمل الأهلي الموحد (الهيئة العامة للقوى العاملة)</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          مطابق لاشتراطات مكاتب العمل وتصاريح وإقامات الشؤون (مادة 18) مع كامل التواقيع والبيانات الرسمية.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPamContractModal(true)}
                        className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shrink-0 cursor-pointer transition"
                      >
                        <ExternalLink size={15} />
                        <span>فتح نموذج (2) وتنزيل PDF</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* Tab 2: Private Information */}
                {employeeActiveTab === 'private' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الرقم المدني الكويتي وتاريخ الانتهاء</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedEmployee.civilId || ''} 
                            maxLength={12}
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, civilId: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="12 رقماً"
                          />
                          <input 
                            type="date" 
                            value={selectedEmployee.civilIdExpiry || ''} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, civilIdExpiry: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            title="تاريخ انتهاء البطاقة المدنية"
                          />
                        </div>
                        <div className="mt-1 text-[11px]">
                          {validateKuwaitCivilId(selectedEmployee.civilId) ? (
                            <span className="text-emerald-700 font-bold">✓ الرقم المدني مطابق لقانون MOD 11 الكويتي</span>
                          ) : (
                            <span className="text-rose-600 font-bold">⚠️ تنبيه: الرقم المدني يجب أن يكون 12 رقماً صحيحاً</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الجنسية (Nationality)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.nationality || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, nationality: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">تاريخ الميلاد (Date of Birth)</label>
                        <input 
                          type="date" 
                          value={selectedEmployee.dob || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, dob: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">النوع (Gender)</label>
                        <select 
                          value={selectedEmployee.gender || 'ذكر - Male'} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, gender: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="ذكر - Male">ذكر (Male)</option>
                          <option value="أنثى - Female">أنثى (Female)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الحالة الاجتماعية وعدد المعالين</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedEmployee.maritalStatus || ''} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, maritalStatus: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="متزوج"
                          />
                          <input 
                            type="number" 
                            value={selectedEmployee.dependents || 0} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, dependents: Number(e.target.value)})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="المعالين"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">فصيلة الدم (Blood Type)</label>
                        <select 
                          value={selectedEmployee.bloodType || 'O+'} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, bloodType: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">رقم جواز السفر وتاريخ الانتهاء</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedEmployee.passportNo || ''} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, passportNo: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="رقم الجواز"
                          />
                          <input 
                            type="date" 
                            value={selectedEmployee.passportExpiry || ''} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, passportExpiry: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">نوع الإقامة وتاريخ الانتهاء</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedEmployee.residencyType || ''} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, residencyType: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="مادة 18"
                          />
                          <input 
                            type="date" 
                            value={selectedEmployee.residencyExpiry || ''} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, residencyExpiry: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">اسم البنك (Bank Name)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.bankName || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, bankName: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="بنك الكويت الوطني (NBK)"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">رقم الآيبان (IBAN)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.iban || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, iban: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="أدخل رقم الآيبان الحقيقي (IBAN)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: HR Settings */}
                {employeeActiveTab === 'hr' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">نوع الموظف (Employee Type)</label>
                        <select 
                          value={selectedEmployee.employeeType || 'employee'} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, employeeType: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="employee">موظف (Employee)</option>
                          <option value="student">متدرب / طالب (Student)</option>
                          <option value="contractor">مقاول (Contractor)</option>
                          <option value="freelance">مستقل (Freelancer)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">المستخدم المرتبط (Related User)</label>
                        <input 
                          type="text" 
                          placeholder="ربط بحساب مستخدم..."
                          value={selectedEmployee.relatedUser || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, relatedUser: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">رقم تعريف البصمة (Badge ID)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.badgeId || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, badgeId: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الرقم السري للحضور (PIN Code)</label>
                        <input 
                          type="password" 
                          value={selectedEmployee.pinCode || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, pinCode: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      
                      <div className="md:col-span-2 pt-4 border-t border-slate-100">
                        <h5 className="font-bold text-slate-700 mb-3">تراخيص وزارة الصحة (MOH Credentials) - خاص بالكادر الطبي</h5>
                      </div>
                      
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">رقم ترخيص مزاولة المهنة (MOH License)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.mohLicense || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, mohLicense: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">تاريخ انتهاء الترخيص (Expiry Date)</label>
                        <input 
                          type="date" 
                          value={selectedEmployee.mohLicenseExpiry || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, mohLicenseExpiry: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Resume & Skills */}
                {employeeActiveTab === 'resume' && (
                  <div className="p-6 space-y-6 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الدرجة العلمية والشهادة (Degree)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.degree || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, degree: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">التخصص الدقيق (Specialty)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.specialty || ''} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, specialty: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-700">السيرة الذاتية (Resume Lines)</h5>
                        <button className="text-purple-600 hover:text-purple-800 font-bold transition">➕ إضافة خبرة جديدة</button>
                      </div>
                      <div className="text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        لا توجد بيانات سيرة ذاتية مسجلة حالياً
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-700">المهارات (Skills)</h5>
                        <button className="text-purple-600 hover:text-purple-800 font-bold transition">➕ إضافة مهارة جديدة</button>
                      </div>
                      <div className="text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        لا توجد مهارات مسجلة حالياً
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Odoo Chatter inside Employee Modal */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <span>💬</span> سجل الملاحظات والأنشطة (Odoo Chatter)
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedEmployee.chatter?.map((msg: any) => (
                    <div key={msg.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span className="font-bold text-purple-900">{msg.user}</span>
                        <span>{msg.date}</span>
                      </div>
                      <div className="text-slate-700">{msg.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleAddChatter('employee', e)} className="flex gap-2 pt-2">
                  <input 
                    type="text"
                    value={chatterInput}
                    onChange={(e) => setChatterInput(e.target.value)}
                    placeholder="اكتب ملاحظة أو توثيق إداري هنا..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                  >
                    إرسال وسجل
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => handleDeleteEmployee(selectedEmployee.id, selectedEmployee.nameAr)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>🗑️</span> حذف الموظف نهائياً
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedEmployee) {
                      const expiryVal = selectedEmployee.civilIdExpiry || selectedEmployee.civilIdExpiryDate || selectedEmployee.civil_id_expiry || '';
                      const updatedEmp = {
                        ...selectedEmployee,
                        civilIdExpiry: expiryVal,
                        civilIdExpiryDate: expiryVal,
                        civil_id_expiry: expiryVal,
                        fullNameAr: selectedEmployee.nameAr || selectedEmployee.fullNameAr || selectedEmployee.name,
                        fullNameEn: selectedEmployee.nameEn || selectedEmployee.fullNameEn,
                        department: selectedEmployee.dept || selectedEmployee.department,
                        joinDate: selectedEmployee.hireDate || selectedEmployee.joinDate,
                        mohLicenseNo: selectedEmployee.mohLicense || selectedEmployee.mohLicenseNo
                      };
                      const updatedList = employees.map((emp: any) => 
                        emp.id === selectedEmployee.id ? updatedEmp : emp
                      );
                      setEmployees(updatedList);
                      if (currentCompanyId) {
                        localStorage.setItem(`odoo_employees_v1_${currentCompanyId}`, JSON.stringify(updatedList));
                      }
                      TenantDatabaseService.saveEmployee(updatedEmp as any, currentCompanyId);
                    }
                    alert('تم حفظ كافة التعديلات على ملف الموظف بنجاح.');
                    setShowEmployeeModal(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  💾 حفظ التغييرات (Save)
                </button>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Employee Sub-Modals (Contracts, Attendance, Leave Balance, Assets) */}
      {employeeSubModal !== 'none' && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {employeeSubModal === 'contracts' && '📝 عقود الموظف: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'attendance' && '🕒 سجل الحضور والبصمة: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'leave' && '✈️ رصيد الإجازات السنوية: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'assets' && '📦 العهد والأصول المسلمة: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'payslips' && '💰 كشوف المرتبات: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'documents' && '📂 المستندات المرفقة: ' + selectedEmployee.nameAr}
              </h3>
              <button 
                onClick={() => setEmployeeSubModal('none')}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              {employeeSubModal === 'contracts' && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between font-bold text-purple-900">
                    <span>رقم العقد: CNT-{selectedEmployee.id}-2026</span>
                    <span className="text-emerald-700">ساري ومصادق</span>
                  </div>
                  <div>المسمى الوظيفي: {selectedEmployee.jobTitle}</div>
                  <div>الراتب الأساسي: {selectedEmployee.basicSalary} د.ك + بدل طبيعة عمل: {selectedEmployee.allowances} د.ك</div>
                  <div>النوع: عقد كادر أهلي / محدد المدة</div>
                </div>
              )}

              {employeeSubModal === 'attendance' && (
                <div className="space-y-2">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center">
                    <span>📅 اليوم: حضور في الموعد (08:00 صباحاً)</span>
                    <span className="text-emerald-700 font-bold">بصمة معتمدة ✓</span>
                  </div>
                  <div className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                    <span>📅 الأمس: حضور (07:55 ص) - انصراف (04:05 م)</span>
                    <span className="text-slate-600 font-bold">8 ساعات</span>
                  </div>
                </div>
              )}

              {employeeSubModal === 'leave' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-blue-900">30 يوم</div>
                    <div className="text-[11px] text-slate-600">رصيد الإجازات السنوية المستحق</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-amber-900">15 يوم</div>
                    <div className="text-[11px] text-slate-600">إجازة مرضية متبقية</div>
                  </div>
                </div>
              )}

              {employeeSubModal === 'assets' && (
                <div className="space-y-2">
                  <div className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                    <span>💻 جهاز حاسب آلي محمول (Dell Latitude)</span>
                    <span className="text-purple-800 font-bold">مسلم بحالة ممتازة</span>
                  </div>
                  <div className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                    <span>🩺 سماعة طبية ومعدات فحص عيادة</span>
                    <span className="text-purple-800 font-bold">عهدة شخصية</span>
                  </div>
                </div>
              )}

              {employeeSubModal === 'payslips' && (
                <div className="space-y-2">
                  <div className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">راتب شهر أغسطس 2026</div>
                      <div className="text-[10px] text-slate-500">تم التحويل إلى بنك الكويت الوطني</div>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">تم الدفع</span>
                  </div>
                  <div className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">راتب شهر يوليو 2026</div>
                      <div className="text-[10px] text-slate-500">تم التحويل إلى بنك الكويت الوطني</div>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">تم الدفع</span>
                  </div>
                </div>
              )}

              {employeeSubModal === 'documents' && (
                <div className="space-y-2">
                  <div className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 text-lg">📄</span>
                      <div>
                        <div className="font-bold text-slate-800">صورة البطاقة المدنية</div>
                        <div className="text-[10px] text-slate-500">تاريخ الرفع: 01-09-2026</div>
                      </div>
                    </div>
                    <button className="text-blue-600 font-bold hover:underline text-xs">عرض</button>
                  </div>
                  <div className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-lg">📄</span>
                      <div>
                        <div className="font-bold text-slate-800">ترخيص مزاولة المهنة</div>
                        <div className="text-[10px] text-slate-500">تاريخ الرفع: 15-08-2026</div>
                      </div>
                    </div>
                    <button className="text-blue-600 font-bold hover:underline text-xs">عرض</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEmployeeSubModal('none')}
                className="bg-purple-900 hover:bg-purple-950 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

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


      {/* Odoo Employee Form Modal */}
      <OdooEmployeeFormModal 
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        existingEmployees={employees}
        activeCompanyId={currentCompanyId}
        onSave={async (newEmp) => {
          const activeCompanyId = currentCompanyId;
          const civilId = (newEmp.civil_id_number || newEmp.civilId || newEmp.civil_id || '').trim();

          // 1. منع التكرار برقم البطاقة المدنية (Unique Civil ID)
          if (civilId) {
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

          // 2. إدراج companyId إجبارياً في الـ Payload
          const payload = {
            ...newEmp,
            companyId: activeCompanyId, // الربط الصارم بالشركة النشطة
            civil_id_number: civilId,
            civilId: civilId,
            fullNameAr: newEmp.nameAr || newEmp.fullNameAr,
            fullNameEn: newEmp.nameEn || newEmp.fullNameEn,
            department: newEmp.dept || newEmp.department,
            joinDate: newEmp.hireDate || newEmp.joinDate,
            mohLicenseNo: newEmp.mohLicense || newEmp.mohLicenseNo,
            createdAt: new Date().toISOString()
          };

          await TenantDatabaseService.saveEmployee(payload as any, activeCompanyId);

          const updated = [payload, ...employees];
          setEmployees(updated);
          if (activeCompanyId) {
            localStorage.setItem(`odoo_employees_v1_${activeCompanyId}`, JSON.stringify(updated));
          }
          setSelectedDept('الكل');
          setSearchQuery('');
          setShowAddEmployeeModal(false);
          alert('تم تسجيل الموظف الجديد بنجاح وتخزينه حياً في قاعدة بيانات Firebase!');
        }}
      />

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

    </div>
  );
}

export default EmployeesApp;
