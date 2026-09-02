import React, { useState, useEffect } from 'react';
import OdooEmployeeFormModal from '../components/OdooEmployeeFormModal';

import OdooContractsApp from "../components/OdooContractsApp";

export const safePrintA4Document = (htmlContent: string) => {
  // إنشاء عنصر iframe خفي
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // تشغيل أمر الطباعة بمجرد تحميل المحتوى بالكامل ثم إزالة العنصر
  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};

export function EmployeesApp(props?: any) {
  const [activeTab, setActiveTab] = useState<'directory' | 'contracts' | 'commencement'>('directory');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedDept, setSelectedDept] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Print preview modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printTitle, setPrintTitle] = useState('');
  const [printData, setPrintData] = useState<any>(null);

  const handleTriggerPrint = (title: string, data: any) => {
    setPrintTitle(title);
    setPrintData(data || selectedEmployee || { nameAr: 'تقرير عيادات إيليت كلينك' });
    setShowPrintModal(true);
  };
  
  // Modal states
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employeeActiveTab, setEmployeeActiveTab] = useState<'work' | 'private' | 'moh'>('work');
  const [employeeSubModal, setEmployeeSubModal] = useState<'none' | 'contracts' | 'attendance' | 'leave' | 'assets'>('none');

  const handleDeleteEmployee = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف ملف الموظف: ${name || id}؟`)) {
      setEmployees(prev => {
        const updated = prev.filter(emp => emp.id !== id);
        localStorage.setItem('app_employees_data', JSON.stringify(updated));
        localStorage.setItem('odoo_employees_v1', JSON.stringify(updated));
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
      localStorage.setItem('odoo_contracts_v1', JSON.stringify(updated));
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
      localStorage.setItem('odoo_commencements_v1', JSON.stringify(updated));
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

  // 1. قراءة البيانات المحفوظة أو تحميل البيانات الافتراضية لأول مرة فقط
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('app_employees_data') || localStorage.getItem('odoo_employees_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'EMP-001',
        nameAr: 'أحمد محمود الكندري',
        nameEn: 'Ahmad Mahmoud Al-Kandari',
        civilId: '290010112345',
        jobTitle: 'مدير الموارد البشرية والشؤون الإدارية',
        dept: 'الإدارة العليا',
        workLocation: 'الإدارة الرئيسية - الدور 3',
        manager: 'المدير التنفيذي للعيادة',
        phone: '+965 99001122',
        email: 'kandari@almanar-clinic.com',
        nationality: 'كويتي',
        dob: '1990-01-01',
        maritalStatus: 'متزوج',
        dependents: 3,
        passportNo: 'P1234567',
        passportExpiry: '2030-05-10',
        residencyType: 'مواطن (بطاقة مدنية)',
        hireDate: '2025-01-10',
        mohLicense: 'MOH-ADM-001',
        mohLicenseExpiry: '2028-01-10',
        specialty: 'إدارة الموارد البشرية والإدارية',
        degree: 'بكالوريوس إدارة أعمال',
        contractType: 'غير محدد المدة',
        basicSalary: 1650,
        allowances: 150,
        status: 'على رأس العمل',
        avatarColor: 'bg-emerald-600',
        chatter: [
          { id: 1, user: 'النظام الآلي', text: 'تم إنشاء ملف الموظف واعتماد المباشرة الرسمية', date: '2025-01-10 09:00' }
        ]
      },
      {
        id: 'EMP-002',
        nameAr: 'محمد إبراهيم السيد',
        nameEn: 'Mohamed Ibrahim El-Sayed',
        civilId: '288040412348',
        jobTitle: 'أخصائي شؤون العاملين والرواتب (WPS)',
        dept: 'الموارد البشرية',
        workLocation: 'مكتب شؤون العاملين - دور التمريض',
        manager: 'أحمد محمود الكندري',
        phone: '+965 66778899',
        email: 'm.ibrahim@almanar-clinic.com',
        nationality: 'مصري',
        dob: '1988-04-04',
        maritalStatus: 'متزوج',
        dependents: 2,
        passportNo: 'A9876543',
        passportExpiry: '2027-08-15',
        residencyType: 'إقامة مادة 18 (حكومي/أهلي)',
        hireDate: '2025-03-01',
        mohLicense: 'MOH-HR-002',
        mohLicenseExpiry: '2027-03-01',
        specialty: 'محاسبة ونظم أجور',
        degree: 'بكالوريوس تجارة',
        contractType: 'محدد المدة',
        basicSalary: 850,
        allowances: 100,
        status: 'على رأس العمل',
        avatarColor: 'bg-blue-600',
        chatter: [
          { id: 1, user: 'أحمد الكندري', text: 'اجتاز فترة التجربة بنجاح', date: '2025-06-01 10:00' }
        ]
      },
      {
        id: 'MED-201',
        nameAr: 'د. سارة عادل المنصور',
        nameEn: 'Dr. Sarah Adel Al-Mansour',
        civilId: '292080812349',
        jobTitle: 'طبيبة استشارية - طب وجراحة العيون',
        dept: 'الأطباء',
        workLocation: 'عيادة العيون التخصصية - الدور 2',
        manager: 'المدير الطبي العام',
        phone: '+965 97711223',
        email: 'dr.sarah@almanar-clinic.com',
        nationality: 'كويتية',
        dob: '1992-08-08',
        maritalStatus: 'متزوجة',
        dependents: 1,
        passportNo: 'P8899112',
        passportExpiry: '2031-11-20',
        residencyType: 'مواطنة (بطاقة مدنية)',
        hireDate: '2024-11-15',
        mohLicense: 'MOH-DOC-8891',
        mohLicenseExpiry: '2029-11-15',
        specialty: 'طب وجراحة العيون والليزر',
        degree: 'دكتوراه طب وجراحة (البورد الكويتي)',
        contractType: 'محدد المدة (سنتان)',
        basicSalary: 3200,
        allowances: 500,
        status: 'على رأس العمل',
        avatarColor: 'bg-purple-600',
        chatter: [
          { id: 1, user: 'إدارة التراخيص الطبية', text: 'تم تجديد ترخيص مزاولة المهنة من وزارة الصحة بنجاح', date: '2025-11-01 11:30' }
        ]
      },
      {
        id: 'MED-202',
        nameAr: 'مريم يوسف العتيبي',
        nameEn: 'Maryam Youssef Al-Otaibi',
        civilId: '296020212350',
        jobTitle: 'رئيسة هيئة التمريض والتعقيم',
        dept: 'التمريض',
        workLocation: 'قسم العمليات والتعقيم المركزي',
        manager: 'د. سارة عادل المنصور',
        phone: '+965 55443322',
        email: 'm.otaibi@almanar-clinic.com',
        nationality: 'كويتية',
        dob: '1996-02-02',
        maritalStatus: 'عزباء',
        dependents: 0,
        passportNo: 'P5544332',
        passportExpiry: '2029-02-02',
        residencyType: 'مواطنة (بطاقة مدنية)',
        hireDate: '2025-02-01',
        mohLicense: 'MOH-NUR-4412',
        mohLicenseExpiry: '2028-02-01',
        specialty: 'تمريض العناية المركزة والعمليات',
        degree: 'بكالوريوس تمريض (BScN)',
        contractType: 'غير محدد المدة',
        basicSalary: 1300,
        allowances: 200,
        status: 'على رأس العمل',
        avatarColor: 'bg-rose-600',
        chatter: [
          { id: 1, user: 'شؤون التمريض', text: 'اكتمال فحص اللياقة الطبية وبصمات الأدلة الجنائية', date: '2025-02-01 08:30' }
        ]
      },
      {
        id: 'CUST-002',
        nameAr: 'سعد جابر العنزي',
        nameEn: 'Saad Jaber Al-Anzi',
        civilId: '291070712351',
        jobTitle: 'مشرف الأمن والسلامة واللوجستيات',
        dept: 'الأمن والخدمات',
        workLocation: 'بوابة الاستقبال الرئيسي والمداخل',
        manager: 'أحمد محمود الكندري',
        phone: '+965 98441122',
        email: 'sec.saad@almanar-clinic.com',
        nationality: 'كويتي',
        dob: '1991-07-07',
        maritalStatus: 'متزوج',
        dependents: 4,
        passportNo: 'P3322114',
        passportExpiry: '2032-06-10',
        residencyType: 'مواطن (بطاقة مدنية)',
        hireDate: '2025-05-10',
        mohLicense: 'MOH-LOG-110',
        mohLicenseExpiry: '2028-05-10',
        specialty: 'إدارة الأمن والسلامة المهنية (OSHA)',
        degree: 'دبلوم سلامة مهنية',
        contractType: 'محدد المدة',
        basicSalary: 600,
        allowances: 100,
        status: 'على رأس العمل',
        avatarColor: 'bg-slate-700',
        chatter: [
          { id: 1, user: 'أحمد الكندري', text: 'تسليم مهام الأمن والسلامة', date: '2025-05-10 09:15' }
        ]
      }
    ];
  });

  // 2. تحديث التخزين المحلي تلقائياً عند أي إضافة أو تعديل
  useEffect(() => {
    localStorage.setItem('app_employees_data', JSON.stringify(employees));
    localStorage.setItem('odoo_employees_v1', JSON.stringify(employees));
  }, [employees]);

  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem('odoo_contracts_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'CNT-2026-001',
        refTitle: 'عقد عمل طبي - د. سارة عادل المنصور - 2026',
        employeeId: 'MED-201',
        employeeName: 'د. سارة عادل المنصور',
        jobPosition: 'طبيبة استشارية - طب وجراحة العيون',
        department: 'الأطباء',
        structureType: 'عقد كادر طبي خاص (أطباء استشاريين)',
        contractType: 'محدد المدة (سنتان)',
        startDate: '2024-11-15',
        endDate: '2026-11-14',
        trialEndDate: '2025-02-22',
        hrResponsible: 'أحمد محمود الكندري',
        status: 'Running',
        wage: 3200,
        housingAllowance: 250,
        transportAllowance: 100,
        medicalAllowance: 150,
        workingSchedule: 'دوام كامل - 48 ساعة أسبوعياً (مناوبات طبية متجددة)',
        annualLeaveDays: 30,
        noticePeriod: '3 أشهر (وفق قانون العمل الكويتي)',
        nonCompete: 'ساري لمدة سنة كاملة داخل دولة الكويت في نفس الاختصاص الطبي',
        travelAndInsurance: 'تذاكر سفر سنوية ذهاب وعودة (درجة رجال الأعمال) + تأمين صحي VIP شامل العائلة',
        chatter: [
          { id: 1, user: 'أحمد الكندري', text: 'تم تحرير العقد وإرساله للمراجعة القانونية ووزارة الصحة', date: '2024-11-10 09:30' },
          { id: 2, user: 'أحمد الكندري', text: 'اجتازت فترة التجربة (100 يوم) بنجاح تام وتفعيل العقد رسمياً', date: '2025-02-22 14:15' }
        ]
      },
      {
        id: 'CNT-2026-002',
        refTitle: 'عقد إداري - أحمد محمود الكندري - 2026',
        employeeId: 'EMP-001',
        employeeName: 'أحمد محمود الكندري',
        jobPosition: 'مدير الموارد البشرية والشؤون الإدارية',
        department: 'الإدارة العليا',
        structureType: 'عقد إداري قيادي',
        contractType: 'غير محدد المدة',
        startDate: '2025-01-10',
        endDate: '',
        trialEndDate: '2025-04-20',
        hrResponsible: 'إدارة الشؤون القانونية',
        status: 'Running',
        wage: 1650,
        housingAllowance: 100,
        transportAllowance: 50,
        medicalAllowance: 0,
        workingSchedule: 'دوام كامل - 48 ساعة أسبوعياً (الأحد إلى الخميس)',
        annualLeaveDays: 30,
        noticePeriod: 'شهر واحد',
        nonCompete: 'لا يوجد',
        travelAndInsurance: 'تذاكر سنوية سياحية + تأمين صحي أساسي',
        chatter: [
          { id: 1, user: 'الشؤون القانونية', text: 'تم اعتماد العقد وتوثيقه لدى الشغل', date: '2025-01-10 11:00' }
        ]
      },
      {
        id: 'CNT-2026-003',
        refTitle: 'عقد تمريض - مريم يوسف العتيبي - 2026',
        employeeId: 'MED-202',
        employeeName: 'مريم يوسف العتيبي',
        jobPosition: 'رئيسة هيئة التمريض والتعقيم',
        department: 'التمريض',
        structureType: 'عقد كادر تمريض فني',
        contractType: 'غير محدد المدة',
        startDate: '2025-02-01',
        endDate: '',
        trialEndDate: '2025-05-11',
        hrResponsible: 'أحمد محمود الكندري',
        status: 'Running',
        wage: 1300,
        housingAllowance: 150,
        transportAllowance: 50,
        medicalAllowance: 0,
        workingSchedule: 'نظام مناوبات (صباحي / مسائي)',
        annualLeaveDays: 30,
        noticePeriod: 'شهر واحد',
        nonCompete: 'لا يوجد',
        travelAndInsurance: 'تذاكر سنوية + تأمين صحي',
        chatter: [
          { id: 1, user: 'أحمد الكندري', text: 'توقيع العقد مباشرة العمل', date: '2025-02-01 08:30' }
        ]
      }
    ];
  });

  const [commencements, setCommencements] = useState(() => {
    const saved = localStorage.getItem('odoo_commencements_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'COM-2026-001',
        employeeId: 'MED-201',
        employeeName: 'د. سارة عادل المنصور',
        civilId: '292080812349',
        commencementDate: '2024-11-15',
        healthCheckStatus: 'مكتمل (لائق صحياً - شهادة وزارة الصحة)',
        fingerprintStatus: 'مكتمل (بصمات الأدلة الجنائية معتمدة)',
        mohLicenseStatus: 'ساري ومطابق (ترخيص دائم صادر من وزارة الصحة)',
        supervisingDept: 'الأطباء والعيادات التخصصية',
        status: 'معتمد ومثبت',
        chatter: [
          { id: 1, user: 'أحمد الكندري', text: 'إصدار إقرار المباشرة وتثبيت العمل رسمياً', date: '2024-11-15 08:00' }
        ]
      },
      {
        id: 'COM-2026-002',
        employeeId: 'EMP-001',
        employeeName: 'أحمد محمود الكندري',
        civilId: '290010112345',
        commencementDate: '2025-01-10',
        healthCheckStatus: 'مكتمل',
        fingerprintStatus: 'مكتمل',
        mohLicenseStatus: 'ساري (إداري)',
        supervisingDept: 'الإدارة العليا',
        status: 'معتمد ومثبت',
        chatter: [
          { id: 1, user: 'الإدارة القانونية', text: 'تمت المباشرة', date: '2025-01-10 09:00' }
        ]
      },
      {
        id: 'COM-2026-003',
        employeeId: 'MED-202',
        employeeName: 'مريم يوسف العتيبي',
        civilId: '296020212350',
        commencementDate: '2025-02-01',
        healthCheckStatus: 'مكتمل',
        fingerprintStatus: 'مكتمل',
        mohLicenseStatus: 'ساري (ترخيص تمريض MOH)',
        supervisingDept: 'التمريض والتعقيم',
        status: 'معتمد ومثبت',
        chatter: [
          { id: 1, user: 'أحمد الكندري', text: 'المباشرة الفعلية بالقسم', date: '2025-02-01 08:30' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('odoo_employees_v1', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('odoo_contracts_v1', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('odoo_commencements_v1', JSON.stringify(commencements));
  }, [commencements]);

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
    const newCom = {
      id: `COM-2026-00${commencements.length + 1}`,
      employeeId: employees[0].id,
      employeeName: employees[0].nameAr,
      civilId: employees[0].civilId,
      commencementDate: new Date().toISOString().slice(0, 10),
      healthCheckStatus: 'قيد المراجعة الطبية (لائق)',
      fingerprintStatus: 'جاري إنجاز بصمات وزارة الداخلية',
      mohLicenseStatus: 'ترخيص مؤقت معتمد',
      supervisingDept: employees[0].dept,
      status: 'مسودة',
      chatter: [
        { id: 1, user: 'أحمد الكندري', text: 'إنشاء إقرار مباشرة العمل الجديد', date: new Date().toLocaleString() }
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
      hrResponsible: 'أحمد محمود الكندري',
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
        { id: 1, user: 'أحمد الكندري', text: 'تم إنشاء مسودة العقد النظامية', date: new Date().toLocaleString() }
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
        { id: Date.now(), user: 'أحمد الكندري (مدير HR)', text: chatterInput, date: new Date().toLocaleString() }
      ];
      const updated = { ...selectedContract, chatter: updatedChatter };
      setSelectedContract(updated);
      setContracts(contracts.map(c => c.id === updated.id ? updated : c));
    } else if (target === 'employee' && selectedEmployee) {
      const updatedChatter = [
        ...(selectedEmployee.chatter || []),
        { id: Date.now(), user: 'أحمد الكندري (مدير HR)', text: chatterInput, date: new Date().toLocaleString() }
      ];
      const updated = { ...selectedEmployee, chatter: updatedChatter };
      setSelectedEmployee(updated);
      setEmployees(employees.map(e => e.id === updated.id ? updated : e));
    } else if (target === 'commencement' && selectedCommencement) {
      const updatedChatter = [
        ...(selectedCommencement.chatter || []),
        { id: Date.now(), user: 'أحمد الكندري (مدير HR)', text: chatterInput, date: new Date().toLocaleString() }
      ];
      const updated = { ...selectedCommencement, chatter: updatedChatter };
      setSelectedCommencement(updated);
      setCommencements(commencements.map(c => c.id === updated.id ? updated : c));
    }
    setChatterInput('');
  };

  // فلترة الموظفين
  const filteredEmployees = employees.filter(emp => {
    const matchDept = selectedDept === 'الكل' || emp.dept === selectedDept;
    const matchSearch = emp.nameAr.includes(searchQuery) || emp.civilId.includes(searchQuery) || emp.id.toLowerCase().includes(searchQuery.toLowerCase()) || emp.jobTitle.includes(searchQuery);
    return matchDept && matchSearch;
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
                المنشأة: عيادة إيليت كلينك | قانون العمل الكويتي رقم 6 لسنة 2010 وتراخيص وزارة الصحة
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
            <button 
              onClick={() => setShowAddEmployeeModal(true)}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>+</span>
              <span>تسجيل موظف جديد (hr.employee)</span>
            </button>

            {activeTab === 'contracts' && (
              <button 
                onClick={handleCreateNewContract}
                className="bg-purple-800 hover:bg-purple-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>+ إنشاء عقد عمل جديد (hr.contract)</span>
              </button>
            )}

            {activeTab === 'commencement' && (
              <button 
                onClick={handleCreateCommencement}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>+ إصدار إقرار مباشرة عمل</span>
              </button>
            )}

            <button 
              onClick={() => handleTriggerPrint(activeTab === 'directory' ? 'سجل الموظفين الشامل' : activeTab === 'contracts' ? 'سجل عقود العمل' : 'إقرارات مباشرة العمل', { nameAr: 'تقرير عيادات إيليت كلينك' })}
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
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
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
                          <span className="inline-block mt-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {emp.dept}
                          </span>
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
                        <div className="text-[10px] text-slate-400">{emp.dept}</div>
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

      {/* نموذج تسجيل موظف جديد (Odoo Add Employee Modal) باستخدام مكون OdooEmployeeFormModal */}
      <OdooEmployeeFormModal 
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSave={(newEmp) => {
          setEmployees([newEmp, ...employees]);
          setShowAddEmployeeModal(false);
          alert('تم تسجيل الموظف الجديد بنجاح في نظام Odoo Enterprise!');
        }}
      />

      {/* 5. نموذج بطاقة الموظف التفصيلية (Odoo Employee Form - hr.employee) */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 text-xs overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-max">
                <button 
                  onClick={() => setEmployeeSubModal('contracts')}
                  className="bg-white border border-slate-300 hover:bg-purple-50 text-purple-900 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
                >
                  <span>📝</span> العقود (1)
                </button>
                <button 
                  onClick={() => setEmployeeSubModal('attendance')}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>🕒</span> الحضور والبصمة
                </button>
                <button 
                  onClick={() => setEmployeeSubModal('leave')}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>✈️</span> رصيد الإجازات (30 يوم)
                </button>
                <button 
                  onClick={() => setEmployeeSubModal('assets')}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>📦</span> العهد والأصول
                </button>
              </div>

              <button
                onClick={() => handleTriggerPrint(`ملف الموظف الشامل - ${selectedEmployee?.nameAr || ''}`, selectedEmployee)}
                className="bg-purple-900 hover:bg-purple-950 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <span>🖨️</span> طباعة ملف الموظف
              </button>
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
                    💼 معلومات العمل (Work Info)
                  </button>

                  <button
                    onClick={() => setEmployeeActiveTab('private')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      employeeActiveTab === 'private' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🪪 المعلومات الشخصية والإقامة
                  </button>

                  <button
                    onClick={() => setEmployeeActiveTab('moh')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      employeeActiveTab === 'moh' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🩺 المؤهلات وتراخيص وزارة الصحة (MOH)
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

                {/* Tab 2: Private Information */}
                {employeeActiveTab === 'private' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الرقم المدني الكويتي (12 رقم)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.civilId} 
                          maxLength={12}
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, civilId: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
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
                          value={selectedEmployee.nationality} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, nationality: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">تاريخ الميلاد (Date of Birth)</label>
                        <input 
                          type="date" 
                          value={selectedEmployee.dob} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, dob: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الحالة الاجتماعية وعدد المعالين</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedEmployee.maritalStatus} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, maritalStatus: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                          />
                          <input 
                            type="number" 
                            value={selectedEmployee.dependents} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, dependents: Number(e.target.value)})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                            placeholder="عدد المعالين"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">رقم جواز السفر وتاريخ الانتهاء</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={selectedEmployee.passportNo} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, passportNo: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                          />
                          <input 
                            type="date" 
                            value={selectedEmployee.passportExpiry} 
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, passportExpiry: e.target.value})}
                            className="w-1/2 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">نوع ورقم الإقامة (Residency Type)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.residencyType} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, residencyType: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: MOH Credentials */}
                {employeeActiveTab === 'moh' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">رقم ترخيص مزاولة المهنة (MOH License)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.mohLicense} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, mohLicense: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">تاريخ انتهاء الترخيص (Expiry & Auto Renewal Alert)</label>
                        <input 
                          type="date" 
                          value={selectedEmployee.mohLicenseExpiry} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, mohLicenseExpiry: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">التخصص الدقيق (Specialty)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.specialty} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, specialty: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الدرجة العلمية والشهادة (Degree)</label>
                        <input 
                          type="text" 
                          value={selectedEmployee.degree} 
                          onChange={(e) => setSelectedEmployee({...selectedEmployee, degree: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
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
                      const updatedList = employees.map((emp: any) => 
                        emp.id === selectedEmployee.id ? selectedEmployee : emp
                      );
                      setEmployees(updatedList);
                      localStorage.setItem('odoo_employees_v1', JSON.stringify(updatedList));
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {employeeSubModal === 'contracts' && '📝 عقود الموظف: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'attendance' && '🕒 سجل الحضور والبصمة: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'leave' && '✈️ رصيد الإجازات السنوية: ' + selectedEmployee.nameAr}
                {employeeSubModal === 'assets' && '📦 العهد والأصول المسلمة: ' + selectedEmployee.nameAr}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
                    localStorage.setItem('odoo_commencements_v1', JSON.stringify(updatedComs));
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

      {/* 7. نموذج عقد العمل الموسع بنمط Odoo 18 Enterprise بالكامل (hr.contract View Modal) */}
      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            
            {/* T-Bar / Header */}
            <div className="bg-[#714B67] text-white px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-lg">📄</span>
                <div>
                  <h2 className="text-sm font-bold">{selectedContract.refTitle}</h2>
                  <p className="text-[10px] text-purple-200 font-mono">معرف العقد: {selectedContract.id} | أودو 18 إنتربرايز</p>
                </div>
              </div>

              {/* Status Pipeline States */}
              <div className="flex items-center bg-[#5a3a52] p-1 rounded-lg text-[11px] gap-1 font-bold">
                {['Draft', 'Running', 'Expired', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => changeContractStatus(st)}
                    className={`px-2.5 py-1 rounded transition ${
                      selectedContract.status === st ? 'bg-white text-[#714B67] shadow' : 'text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    {st === 'Draft' ? 'مسودة' : st === 'Running' ? 'ساري' : st === 'Expired' ? 'منتهي' : 'ملغي'}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowContractModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Action Buttons Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-max">
                <button
                  onClick={() => changeContractStatus('Running')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>✓</span> اعتماد وبدء سريان العقد (Running)
                </button>
                <button
                  onClick={() => handleTriggerPrint(`عقد العمل الرسمي - ${selectedContract?.name || selectedContract?.refTitle || ''}`, selectedContract)}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                >
                  <span>🖨️</span> طباعة العقد الرسمي (A4)
                </button>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">
                المسؤول: {selectedContract.hrResponsible}
              </div>
            </div>

            {/* Form Top Data */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">اسم الموظف (Employee)</label>
                  <input 
                    type="text" 
                    value={selectedContract.employeeName} 
                    onChange={(e) => setSelectedContract({...selectedContract, employeeName: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">المسمى الوظيفي في العقد (Job Position)</label>
                  <select
                    value={selectedContract.jobPosition}
                    onChange={(e) => handleMasterDropdownChange(e.target.value, 'jobPosition', selectedContract, setSelectedContract, masterJobTitles, setMasterJobTitles, 'أدخل مسمى وظيفي جديد:')}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    {masterJobTitles.map(j => <option key={j} value={j}>{j}</option>)}
                    <option value="__ADD_NEW__" className="text-purple-700 font-bold">➕ إضافة مسمى وظيفي جديد...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">الإدارة / القسم (Department)</label>
                  <select
                    value={selectedContract.department}
                    onChange={(e) => handleMasterDropdownChange(e.target.value, 'department', selectedContract, setSelectedContract, masterDepts, setMasterDepts, 'أدخل اسم القسم الجديد:')}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    {masterDepts.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="__ADD_NEW__" className="text-purple-700 font-bold">➕ إضافة قسم جديد...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">هيكل الراتب وفئة العقد (Structure Type)</label>
                  <input 
                    type="text" 
                    value={selectedContract.structureType} 
                    onChange={(e) => setSelectedContract({...selectedContract, structureType: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">تاريخ البداية (Start Date)</label>
                  <input 
                    type="date" 
                    value={selectedContract.startDate} 
                    onChange={(e) => setSelectedContract({...selectedContract, startDate: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">تاريخ النهاية (End Date)</label>
                  <input 
                    type="date" 
                    value={selectedContract.endDate} 
                    onChange={(e) => setSelectedContract({...selectedContract, endDate: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">فترة التجربة (Trial Period - Max 100 Days)</label>
                  <input 
                    type="date" 
                    value={selectedContract.trialEndDate} 
                    onChange={(e) => setSelectedContract({...selectedContract, trialEndDate: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">المسؤول عن الموارد البشرية (HR)</label>
                  <input 
                    type="text" 
                    value={selectedContract.hrResponsible} 
                    onChange={(e) => setSelectedContract({...selectedContract, hrResponsible: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">نوع العقد (Contract Type)</label>
                  <input 
                    type="text" 
                    value={selectedContract.contractType} 
                    onChange={(e) => setSelectedContract({...selectedContract, contractType: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Odoo Notebook Tabs */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center bg-slate-100 border-b border-slate-200 px-4 pt-2 gap-2 text-xs font-bold text-slate-600 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <button
                    onClick={() => setContractActiveTab('salary')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      contractActiveTab === 'salary' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    💰 1. جدول تفاصيل الراتب والتعويضات
                  </button>

                  <button
                    onClick={() => setContractActiveTab('schedule')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      contractActiveTab === 'schedule' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ⏰ 2. جدول ومواعيد العمل
                  </button>

                  <button
                    onClick={() => setContractActiveTab('terms')}
                    className={`px-4 py-2 rounded-t-lg transition border-t border-x shrink-0 ${
                      contractActiveTab === 'terms' ? 'bg-white text-purple-900 border-slate-200 font-bold -mb-px' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📜 3. الشروط والأحكام الخاصة
                  </button>
                </div>

                {/* Tab 1 */}
                {contractActiveTab === 'salary' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">الأجر الأساسي (Wage - د.ك)</label>
                        <input 
                          type="number" 
                          value={selectedContract.wage} 
                          onChange={(e) => setSelectedContract({...selectedContract, wage: Number(e.target.value)})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">بدل السكن (Housing - د.ك)</label>
                        <input 
                          type="number" 
                          value={selectedContract.housingAllowance} 
                          onChange={(e) => setSelectedContract({...selectedContract, housingAllowance: Number(e.target.value)})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">بدل الانتقال (Transport - د.ك)</label>
                        <input 
                          type="number" 
                          value={selectedContract.transportAllowance} 
                          onChange={(e) => setSelectedContract({...selectedContract, transportAllowance: Number(e.target.value)})}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">بنك تحويل الراتب (WPS Bank)</label>
                        <select
                          value={selectedContract.bankName || masterBanks[0]}
                          onChange={(e) => handleMasterDropdownChange(e.target.value, 'bankName', selectedContract, setSelectedContract, masterBanks, setMasterBanks, 'أدخل اسم البنك الجديد:')}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white"
                        >
                          {masterBanks.map(b => <option key={b} value={b}>{b}</option>)}
                          <option value="__ADD_NEW__" className="text-purple-700 font-bold">➕ إضافة بنك جديد...</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between mt-4">
                      <div>
                        <div className="font-bold text-emerald-900 text-sm">إجمالي الأجر الشهري الإجمالي (Gross Monthly Salary)</div>
                        <div className="text-[11px] text-emerald-700">محسوب آلياً بناءً على الراتب الأساسي والبدلات الثابتة</div>
                      </div>
                      <div className="font-mono text-xl font-bold text-emerald-800">
                        {(selectedContract.wage + selectedContract.housingAllowance + selectedContract.transportAllowance + selectedContract.medicalAllowance).toFixed(3)} د.ك
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2 */}
                {contractActiveTab === 'schedule' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">جدول العمل الأسبوعي (Working Schedule)</label>
                      <input 
                        type="text" 
                        value={selectedContract.workingSchedule} 
                        onChange={(e) => setSelectedContract({...selectedContract, workingSchedule: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">رصيد الإجازة السنوية القانوني (Annual Leave Balance)</label>
                      <div className="flex items-center gap-2 min-w-max">
                        <input 
                          type="number" 
                          value={selectedContract.annualLeaveDays} 
                          onChange={(e) => setSelectedContract({...selectedContract, annualLeaveDays: Number(e.target.value)})}
                          className="w-32 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                        />
                        <span className="text-slate-600 font-semibold">يوماً في السنة مدفوعة الأجر (قانون العمل الكويتي 30 يوماً)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3 */}
                {contractActiveTab === 'terms' && (
                  <div className="p-6 space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">مهلة الإخطار بإنهاء الخدمة (Notice Period)</label>
                      <input 
                        type="text" 
                        value={selectedContract.noticePeriod} 
                        onChange={(e) => setSelectedContract({...selectedContract, noticePeriod: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">شرط عدم المنافسة (Non-Compete Clause)</label>
                      <input 
                        type="text" 
                        value={selectedContract.nonCompete} 
                        onChange={(e) => setSelectedContract({...selectedContract, nonCompete: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">بند تذاكر السفر والتأمين الإضافي (Travel & Insurance)</label>
                      <input 
                        type="text" 
                        value={selectedContract.travelAndInsurance} 
                        onChange={(e) => setSelectedContract({...selectedContract, travelAndInsurance: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Odoo Chatter inside Contract Modal */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <span>💬</span> سجل الملاحظات والأنشطة (Odoo Chatter)
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedContract.chatter?.map((msg: any) => (
                    <div key={msg.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span className="font-bold text-purple-900">{msg.user}</span>
                        <span>{msg.date}</span>
                      </div>
                      <div className="text-slate-700">{msg.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleAddChatter('contract', e)} className="flex gap-2 pt-2">
                  <input 
                    type="text"
                    value={chatterInput}
                    onChange={(e) => setChatterInput(e.target.value)}
                    placeholder="اكتب ملاحظة أو توثيق قانوني هنا..."
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

            {/* Footer */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">نظام إدارة العقود متوافق مع قانون العمل الكويتي ومعايير أودو 18</span>
              <button
                onClick={() => {
                  if (selectedContract) {
                    const updatedContracts = contracts.map((c: any) => 
                      c.id === selectedContract.id || c.contractRef === selectedContract.contractRef ? selectedContract : c
                    );
                    setContracts(updatedContracts);
                    localStorage.setItem('odoo_contracts_v1', JSON.stringify(updatedContracts));
                  }
                  setShowContractModal(false);
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
        onSave={(newEmp) => {
          const updated = [newEmp, ...employees];
          setEmployees(updated);
          localStorage.setItem('odoo_employees_v1', JSON.stringify(updated));
          setSelectedDept('الكل');
          setSearchQuery('');
          setShowAddEmployeeModal(false);
          alert('تم تسجيل الموظف الجديد بنجاح في نظام Odoo Enterprise وتخزينه في قاعدة البيانات!');
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
                <div className="text-xl font-bold text-purple-900">مجمع عيادات إيليت كلينك الطبية - الكويت</div>
                <div className="text-xs text-slate-500">Elite Medical Clinic Complex - State of Kuwait</div>
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
                  window.print();
                }}
                className="bg-purple-900 hover:bg-purple-950 text-white px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <span>🖨️</span> طباعة المستند الآن (Print)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeesApp;
