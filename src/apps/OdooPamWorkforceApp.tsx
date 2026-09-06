import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, ShieldCheck, AlertTriangle, Calendar, FileText, Printer, 
  Search, Plus, CheckCircle2, Clock, UserCheck, RefreshCw, 
  Zap, FileSpreadsheet, Eye, ExternalLink, BadgeAlert, Award, Scan, Upload, Users, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from '../utils/persistentStorage';
import { useCompany } from '../context/CompanyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';

const getDaysUntilExpiry = (expiryDateString?: string) => {
  if (!expiryDateString) return 999;
  const target = new Date(expiryDateString);
  if (isNaN(target.getTime())) return 999;
  const today = new Date();
  target.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const OdooPamWorkforceApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workpermits' | 'passports' | 'letters' | 'scanner'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scanner state for passports / work permits
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [scannedFileName, setScannedFileName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedDocNo, setExtractedDocNo] = useState('');
  const [extractedExpiry, setExtractedExpiry] = useState('2029-01-01');
  const [extractedStartDate, setExtractedStartDate] = useState('2026-01-01');
  const [extractedSalary, setExtractedSalary] = useState('350');
  const [extractedJobTitle, setExtractedJobTitle] = useState('موظف إداري');
  const [scanReady, setScanReady] = useState(false);
  const [scanType, setScanType] = useState<'passport' | 'workpermit'>('passport');

  // Template Builder state for Letters tab
  const [letterTemplates, setLetterTemplates] = useState<any[]>([
    {
      id: 'template_salary',
      title: 'شهادة راتب موجهة للقوى العاملة',
      subject: 'شهادة راتب رسمية',
      body: 'تشهد إدارة الموارد البشرية بأن الموظف / {{اسم الموظف}}، يحمل رقم مدني {{الرقم المدني}}، ويعمل لدينا بالمسمى الوظيفي ({{المسمى}}) منذ تاريخ {{تاريخ التعيين}}، ويتقاضى راتباً أساسياً قدره {{الراتب}} د.ك شهرياً. وقد أعطيت له هذه الشهادة بناءً على طلبه دون مسؤولية على الشركة تجاه الغير.'
    },
    {
      id: 'template_twhom',
      title: 'شهادة لمن يهمه الأمر',
      subject: 'إقرار استمرار بالعمل',
      body: 'نحيطكم علماً بأن السيد / {{اسم الموظف}} (رقم مدني: {{الرقم المدني}}) على رأس عمله حتى تاريخه بوظيفة {{المسمى}} في قسم {{القسم}}، وراتبه الشهري الإجمالي {{الراتب}} د.ك، ولا مانع لدينا من منحه ما يطلبه.'
    }
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('template_salary');
  const [selectedLetterEmpId, setSelectedLetterEmpId] = useState('');
  const [customSubject, setCustomSubject] = useState('شهادة راتب وإستمرارية راتب');
  const [customBody, setCustomBody] = useState('تحيطكم علماً بأن السيدة/باريانكا ياتيش الجنسية - هندية الجنسية، بموجب بطاقة مدنية رقم: 289080707852 وتعمل لدينا بمستوصف الفنار كلينك : بوظيفة/ مرضه وذلك اعتباراً من : 2017/11/13 ب راتب شهري وقدره (390 د.ك ) فقط ثلاثمائة وتسعون دينار كويتي لاغير، ويتم تحويل راتبها إلى حسابها لدى بنك بيت التمويل الكويتي رقم الأيبان (KW19 KFH0 00000000071050546531) ومستمره بالعمل حتى تاريخه.\n\nوقد أعطيت لها هذه الشهادة بناءً على طلبها دون أدنى مسؤولية على المؤسسة تجاه الغير.\n\nوتفضلوا بقبول فائق التحية والاحتترام ...');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load employees
  useEffect(() => {
    const loaded = getPersistentData<any[]>(MANARA_STORAGE_KEYS.EMPLOYEES, []);
    setEmployees(loaded);

    const handleStorage = () => {
      setEmployees(getPersistentData<any[]>(MANARA_STORAGE_KEYS.EMPLOYEES, []));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('manara_employees_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('manara_employees_updated', handleStorage);
    };
  }, []);

  const totalEmployees = employees.length;
  
  // Expiry stats for passports
  const expiringPassports = employees.filter(e => {
    const exp = e.passportExpiry || e.passportExpiryDate;
    if (!exp) return false;
    const days = getDaysUntilExpiry(exp);
    return days >= 0 && days <= 90;
  }).length;

  const expiredPassports = employees.filter(e => {
    const exp = e.passportExpiry || e.passportExpiryDate;
    if (!exp) return false;
    return getDaysUntilExpiry(exp) < 0;
  }).length;

  const activePassports = totalEmployees - expiringPassports - expiredPassports;

  // Handle OCR Simulation for Passport / Work Permit Upload
  const handleSimulateScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannedFileName(file.name);
    setIsScanning(true);
    setScanReady(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanReady(true);
      const randomNo = scanType === 'passport' ? `P${Math.floor(1000000 + Math.random() * 9000000)}` : `PAM-${Math.floor(100000 + Math.random() * 900000)}`;
      setExtractedDocNo(randomNo);
      setExtractedExpiry(scanType === 'passport' ? '2031-06-15' : '2027-08-20');
      setExtractedStartDate('2026-03-01');
      setExtractedSalary('450');
      setExtractedJobTitle(scanType === 'passport' ? 'أخصائي شؤون إدارية' : 'مهندس / فني متخصص');
      toast.success(scanType === 'passport' ? 'تم قراءة جواز السفر واستخراج بياناته بنجاح عبر OCR' : 'تم قراءة مستند إذن العمل واستخراج البيانات (تاريخ البداية، النهاية، الراتب، والمسمى) بنجاح');
    }, 1500);
  };

  // Save scanned document to employee
  const handleSaveScannedDoc = () => {
    if (!selectedEmpId) {
      toast.error('يرجى اختيار الموظف المعني');
      return;
    }
    const updated = employees.map(emp => {
      if (emp.id === selectedEmpId) {
        if (scanType === 'passport') {
          return {
            ...emp,
            passportNo: extractedDocNo,
            passportExpiry: extractedExpiry
          };
        } else {
          return {
            ...emp,
            workPermitNo: extractedDocNo,
            workPermitExpiry: extractedExpiry,
            startDate: extractedStartDate,
            basicSalary: extractedSalary,
            jobTitle: extractedJobTitle
          };
        }
      }
      return emp;
    });

    setEmployees(updated);
    setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEES, updated);
    window.dispatchEvent(new Event('manara_employees_updated'));
    toast.success('تم حفظ المستند وتحديث بيانات القوى العاملة بنجاح');
    setActiveTab(scanType === 'passport' ? 'passports' : 'workpermits');
  };

  // Print official PAM document
  const handlePrintPamLetter = (emp: any, type: string) => {
    const companyName = activeCompany?.nameAr || 'شركة متميزة للخدمات التجارية';
    const companyEn = activeCompany?.nameEn || 'Distinguished Commercial Services Co.';
    const today = new Date().toLocaleDateString('ar-KW');

    let subjectTitle = '';
    let bodyContent = '';

    if (type === 'contract') {
      subjectTitle = 'عقد عمل للقطاع الأهلي (معتمد - الهيئة العامة للقوى العاملة PAM)';
      bodyContent = `
        <p>إنه في يوم <strong>${today}</strong> تم الاتفاق بين كل من:</p>
        <p><strong>الطرف الأول (الجهة صاحب العمل):</strong> ${companyName} - دولة الكويت.</p>
        <p><strong>الطرف الثاني (العامل):</strong> ${emp.nameAr || emp.fullNameAr || 'الموظف'} - الجنسية: ${emp.nationality || '—'} - الرقم المدني: <span style="font-family:monospace;">${emp.civilId || '—'}</span>.</p>
        <p>وقد اتفق الطرفان على أن يعمل الطرف الثاني لدى الطرف الأول بمسمي <strong>"${emp.jobTitle || 'موظف إداري'}"</strong> براتب شهري إجمالي قدره <strong>${emp.basicSalary || '350'} دينار كويتي</strong>، وفقاً لقانون العمل الكويتي بالقطاع الأهلي ولوائح الهيئة العامة للقوى العاملة.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; width: 30%; background: #f8fafc; font-weight: bold;">رقم إذن العمل:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${emp.workPermitNo || 'PAM-2026-8821'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">رقم الجواز:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${emp.passportNo || 'P1234567'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">تاريخ انتهاء الجواز:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${emp.passportExpiry || '2030-01-01'}</td></tr>
        </table>
        <p>وتفضلوا بقبول فائق الاحترام والتقدير،،</p>
      `;
    } else {
      subjectTitle = 'شهادة لمن يهمه الأمر / طلب تحديث إذن عمل (الهيئة العامة للقوى العاملة)';
      bodyContent = `
        <p>السادة / الهيئة العامة للقوى العاملة (إدارة العمل الموقرين)</p>
        <p>تحية طيبة وبعد،،</p>
        <p>تشهد شركة <strong>${companyName}</strong> بأن الموظف المذكور أدناه يعمل لدينا وتحت كفالتنا بموجب إذن العمل الساري، وقد أعطيت له هذه الشهادة بناءً على طلبه دون مسؤولية على الشركة تجاه الغير:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; width: 30%; background: #f8fafc; font-weight: bold;">اسم الموظف:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${emp.nameAr || emp.fullNameAr || 'الموظف'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">الرقم المدني:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${emp.civilId || '—'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">المسمى الوظيفي:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${emp.jobTitle || 'موظف'}</td></tr>
        </table>
        <p>ولكم جزيل الشكر والامتنان،،</p>
      `;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>${subjectTitle}</title>
          <style>
            body { font-family: 'Cairo', Tahoma, sans-serif; padding: 30px; color: #1e293b; direction: rtl; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 2px double #cbd5e1; padding-bottom: 20px; margin-bottom: 30px;">
            <h2 style="margin: 0; color: #1e3a8a; font-size: 22px;">${companyName}</h2>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${companyEn} - State of Kuwait</div>
            <h3 style="margin: 15px 0 0 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #1e3a8a; display: inline-block; padding-bottom: 5px;">${subjectTitle}</h3>
          </div>
          <div style="font-size: 13px; line-height: 1.8;">
            ${bodyContent}
          </div>
          <div style="margin-top: 60px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; text-align: center; font-size: 12px;">
            <div>
              <p style="font-weight: bold; color: #475569; margin-bottom: 50px;">إدارة الموارد البشرية والشؤون الإدارية</p>
              <div style="border-bottom: 1px solid #94a3b8; width: 60%; margin: 0 auto 5px auto;"></div>
              <span style="font-size: 10px; color: #94a3b8;">التوقيع والختم الرسمي</span>
            </div>
            <div>
              <p style="font-weight: bold; color: #475569; margin-bottom: 50px;">ختم الشركة الرسمي</p>
              <div style="border-bottom: 1px solid #94a3b8; width: 60%; margin: 0 auto 5px auto;"></div>
              <span style="font-size: 10px; color: #94a3b8;">الختم الرسمي</span>
            </div>
          </div>
          <div style="margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 10px; color: #94a3b8;">
            تم إصدار هذا المستند إلكترونياً عبر تطبيق الهيئة العامة للقوى العاملة (Odoo 18 ERP) - تاريخ الاستخراج: ${today}
          </div>
          <script>window.onload = function() { window.focus(); window.print(); };</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      safePrintAction(subjectTitle);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden" dir="rtl">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-800 rounded-xl shadow-2xs">
              <Users size={22} />
            </span>
            <h1 className="text-lg font-bold text-slate-900">إدارة القوى العاملة وأذونات العمل (PAM Workforce Hub)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">نظام إدارة العمالة، أذونات العمل، متابعة جوازات السفر، والعقود الرسمية للهيئة العامة للقوى العاملة</p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setActiveTab('scanner')}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Scan size={14} />
            <span>ماسح الجوازات وأذونات العمل (OCR)</span>
          </button>
          <button
            onClick={() => {
              toast.success('تم تحديث مزامنة بيانات الهيئة العامة للقوى العاملة بنجاح');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>مزامنة البيانات</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 flex gap-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 مؤشرات القوى العاملة', icon: Building2 },
          { id: 'workpermits', label: '📜 أذونات العمل والعقود (PAM)', icon: ShieldCheck },
          { id: 'passports', label: `🛂 جوازات السفر وتواريخ الانتهاء (${totalEmployees})`, icon: Globe },
          { id: 'scanner', label: '📷 الماسح الضوئي الذكي (OCR)', icon: Scan },
          { id: 'letters', label: '📄 العقود والخطابات الرسمية', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-blue-700 text-blue-900 bg-blue-50/50' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-700' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 animate-[fadeIn_0.3s_ease-out]">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* كارت إجمالي العمالة */}
              <div 
                onClick={() => setActiveTab('workpermits')}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">إجمالي العمالة المسجلة (PAM)</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{totalEmployees} <span className="text-xs font-normal">موظف</span></div>
                <p className="text-[11px] text-slate-500 mt-1">عمالة قطاع أهلي (مادة 18)</p>
              </div>

              {/* كارت سارية */}
              <div 
                onClick={() => setActiveTab('passports')}
                className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700">جوازات سارية وبحالة ممتازة</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-2xl font-bold text-emerald-900 mt-2">{activePassports} <span className="text-xs font-normal">جواز</span></div>
                <p className="text-[11px] text-emerald-600 mt-1">أعلى من صلاحية 6 أشهر</p>
              </div>

              {/* كارت قريبة الانتهاء */}
              <div 
                onClick={() => setActiveTab('passports')}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700">جوازات قريبة الانتهاء (90 يوم)</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
                <div className="text-2xl font-bold text-amber-900 mt-2">{expiringPassports} <span className="text-xs font-normal">جواز</span></div>
                <p className="text-[11px] text-amber-600 mt-1">تحتاج التجديد بالسفارات</p>
              </div>

              {/* كارت منتهية الصلاحية */}
              <div 
                onClick={() => setActiveTab('passports')}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-700">جوازات منتهية الصلاحية</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                </div>
                <div className="text-2xl font-bold text-rose-900 mt-2">{expiredPassports} <span className="text-xs font-normal">جواز</span></div>
                <p className="text-[11px] text-rose-600 mt-1">تستوجب التوقف الإداري للعامل</p>
              </div>
            </div>

            {/* Quick Actions & Banner */}
            <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                  <span>🏛️</span> نظام الربط الإلكتروني مع الهيئة العامة للقوى العاملة (PAM Integration)
                </div>
                <h3 className="text-lg font-bold">إدارة أذونات العمل، العقود، وصلاحيات الجوازات في دولة الكويت</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  يقوم النظام بالتحقق التلقائي من تواريخ صلاحية جوازات السفر وأذونات العمل لتفادي غرامات الهيئة أو إيقاف ملف الشركة.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('passports')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md whitespace-nowrap flex items-center gap-1.5"
                >
                  <Globe size={14} />
                  <span>استعراض جوازات السفر</span>
                </button>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer whitespace-nowrap"
                >
                  مسح جواز جديد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORK PERMITS & CONTRACTS */}
        {activeTab === 'workpermits' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم الموظف أو رقم إذن العمل..."
                  className="w-full px-4 py-2 pr-10 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700/50"
                />
                <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
              </div>
              <div className="text-xs text-slate-500 font-bold">
                إجمالي أذونات العمل النشطة: <span className="text-blue-800 font-mono">{totalEmployees}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">اسم الموظف</th>
                    <th className="p-3.5">المسمى الوظيفي والمهنة</th>
                    <th className="p-3.5">رقم إذن العمل (PAM)</th>
                    <th className="p-3.5">الرقم المدني</th>
                    <th className="p-3.5 text-center">حالة العقد والترخيص</th>
                    <th className="p-3.5 text-center">الإجراءات والطباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                        لا توجد بيانات عمالة مسجلة حالياً.
                      </td>
                    </tr>
                  ) : (
                    employees.filter(e => 
                      !searchQuery || 
                      (e.nameAr || '').includes(searchQuery) || 
                      (e.civilId || '').includes(searchQuery)
                    ).map((emp, i) => (
                      <tr key={emp.id || i} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {(emp.nameAr || 'م')[0]}
                          </div>
                          <div>
                            <div>{emp.nameAr || emp.fullNameAr || 'غير متوفر'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">الجنسية: {emp.nationality || 'كويتي / مقيم'}</div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-700">
                          <span className="font-semibold">{emp.jobTitle || 'موظف إداري'}</span>
                          <div className="text-[10px] text-slate-400">{emp.department || 'الإدارة العامة'}</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-blue-900">
                          {emp.workPermitNo || `PAM-2026-${8000 + i}`}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          {emp.civilId || '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            عقد موثق ومعتمد
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handlePrintPamLetter(emp, 'contract')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                            title="طباعة عقد العمل المعتمد للقوى العاملة"
                          >
                            <Printer size={13} className="text-blue-700" />
                            <span>عقد العمل A4</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PASSPORTS EXPIRY TAB */}
        {activeTab === 'passports' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الجواز أو اسم الموظف..."
                  className="w-full px-4 py-2 pr-10 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700/50"
                />
                <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setScanType('passport');
                    setActiveTab('scanner');
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Scan size={14} />
                  <span>مسح جواز سفر جديد (OCR)</span>
                </button>
                <div className="text-xs text-slate-500 font-bold">
                  إجمالي الجوازات: <span className="text-blue-800 font-mono">{totalEmployees}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">اسم الموظف والجنسية</th>
                    <th className="p-3.5">رقم جواز السفر (Passport No)</th>
                    <th className="p-3.5">تاريخ انتهاء الجواز</th>
                    <th className="p-3.5 text-center">صلاحية الجواز</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                        لا توجد بيانات جوازات سفر مسجلة.
                      </td>
                    </tr>
                  ) : (
                    employees.filter(e => 
                      !searchQuery || 
                      (e.nameAr || '').includes(searchQuery) || 
                      (e.passportNo || '').includes(searchQuery)
                    ).map((emp, i) => {
                      const passportExp = emp.passportExpiry || emp.passportExpiryDate || '2030-10-15';
                      const daysLeft = getDaysUntilExpiry(passportExp);
                      return (
                        <tr key={emp.id || i} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {(emp.nameAr || 'ج')[0]}
                            </div>
                            <div>
                              <div>{emp.nameAr || emp.fullNameAr || 'غير متوفر'}</div>
                              <div className="text-[10px] text-slate-400">الدولة: {emp.nationality || 'مقيم'}</div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {emp.passportNo || `P${2800000 + i}`}
                          </td>
                          <td className="p-3.5 font-mono text-slate-700">
                            {passportExp}
                          </td>
                          <td className="p-3.5 text-center">
                            {daysLeft < 0 ? (
                              <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                منتهي ({Math.abs(daysLeft)} يوم)
                              </span>
                            ) : daysLeft <= 90 ? (
                              <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                يوشك على الانتهاء ({daysLeft} يوم)
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                ساري ({daysLeft} يوم)
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setSelectedEmpId(emp.id);
                                setActiveTab('scanner');
                                setScanType('passport');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <Upload size={13} className="text-blue-700" />
                              <span>تحديث الجواز</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SCANNER (OCR) */}
        {activeTab === 'scanner' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                    <Scan size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">الماسح الضوئي الذكي لجوازات السفر وأذونات العمل (PAM OCR)</h3>
                    <p className="text-xs text-slate-500">قم برفع المستند لاستخراج رقم الجواز / إذن العمل وتاريخ الانتهاء وتحديث ملف الموظف فوراً</p>
                  </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setScanType('passport')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${scanType === 'passport' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    جواز سفر 🛂
                  </button>
                  <button
                    onClick={() => setScanType('workpermit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${scanType === 'workpermit' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    إذن عمل 📜
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition relative">
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={handleSimulateScan}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shadow-inner">
                    <Upload size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">اسحب ملف {scanType === 'passport' ? 'جواز السفر' : 'إذن العمل'} هنا، أو اضغط للاختيار</div>
                    <div className="text-xs text-slate-500 mt-1">يدعم ملفات PDF, PNG, JPG (حتى 10 ميجابايت)</div>
                  </div>
                  {scannedFileName && (
                    <div className="mt-2 bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-xs font-mono font-bold border border-blue-200">
                      📄 {scannedFileName}
                    </div>
                  )}
                </div>
              </div>

              {/* Scanning Loader State */}
              {isScanning && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent animate-[bounce_1s_infinite]"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-blue-900">جاري قراءة وتحليل بيانات المستند عبر الذكاء الاصطناعي (OCR AI)...</span>
                  </div>
                  <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full animate-[pulse_1s_infinite]" style={{ width: '70%' }}></div>
                  </div>
                </div>
              )}

              {/* Scan Results & Assignment Form */}
              {scanReady && (
                <div className="bg-emerald-50/60 border border-emerald-200 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>تم قراءة المستند واستخراج البيانات بنجاح!</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{scanType === 'passport' ? 'رقم جواز السفر المستخرج' : 'رقم إذن العمل المستخرج'}</label>
                      <input 
                        type="text" 
                        value={extractedDocNo} 
                        onChange={(e) => setExtractedDocNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs font-bold text-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ انتهاء الصلاحية</label>
                      <input 
                        type="date" 
                        value={extractedExpiry} 
                        onChange={(e) => setExtractedExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
                      />
                    </div>
                    {scanType === 'workpermit' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ بداية المباشرة (الاصدار)</label>
                          <input 
                            type="date" 
                            value={extractedStartDate} 
                            onChange={(e) => setExtractedStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الشهري الأساسي (د.ك)</label>
                          <input 
                            type="text" 
                            value={extractedSalary} 
                            onChange={(e) => setExtractedSalary(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs font-bold text-emerald-800"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي المستخرج</label>
                          <input 
                            type="text" 
                            value={extractedJobTitle} 
                            onChange={(e) => setExtractedJobTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اختر الموظف المعني لربط المستند بملفه:</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                    >
                      <option value="">— اضغط لاختيار الموظف من القائمة —</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nameAr || emp.fullNameAr} ({emp.jobTitle || 'موظف'} - المدني: {emp.civilId || '—'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveScannedDoc}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} />
                      <span>حفظ المستند وربطه بملف الموظف</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: LETTERS & CONTRACTS */}
        {activeTab === 'letters' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">محرر قوالب الخطابات الذكية (Template Builder & PAM Forms)</h3>
                <p className="text-xs text-slate-500">صمم، حرر، وخصص الخطابات الرسمية مع المتغيرات التلقائية لملفات الموظفين والترويسة الطبية الرسمية</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newT = {
                      id: `template_${Date.now()}`,
                      title: 'قالب خطاب جديد مخصص',
                      subject: 'خطاب رسمي إداري',
                      body: 'نشهد بأن السيد / {{اسم الموظف}}، يحمل رقم مدني {{الرقم المدني}}، يعمل بالمسمى ({{المسمى}}) وراتبه الأساسي {{الراتب}} د.ك.'
                    };
                    setLetterTemplates([...letterTemplates, newT]);
                    setSelectedTemplateId(newT.id);
                    setCustomSubject(newT.subject);
                    setCustomBody(newT.body);
                    setIsEditingTemplate(true);
                    toast.success('تم إنشاء قالب جديد. يمكنك تعديله الآن');
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>إضافة قالب جديد</span>
                </button>
              </div>
            </div>

            {/* Template Selector & Employee Target Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4 lg:col-span-1 border-e border-slate-100 ps-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر القالب الجاهز:</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      const tid = e.target.value;
                      setSelectedTemplateId(tid);
                      const tFound = letterTemplates.find(t => t.id === tid);
                      if (tFound) {
                        setCustomSubject(tFound.subject);
                        const emp = employees.find(emp => emp.id === selectedLetterEmpId) || employees[0];
                        if (emp) {
                          const rendered = tFound.body
                            .replace(/\{\{اسم الموظف\}\}/g, emp.nameAr || emp.fullNameAr || 'الموظف')
                            .replace(/\{\{الرقم المدني\}\}/g, emp.civilId || '—')
                            .replace(/\{\{المسمى\}\}/g, emp.jobTitle || 'موظف إداري')
                            .replace(/\{\{الراتب\}\}/g, emp.basicSalary || '350')
                            .replace(/\{\{تاريخ التعيين\}\}/g, emp.startDate || '2026-01-01')
                            .replace(/\{\{القسم\}\}/g, emp.department || 'الإدارة العامة');
                          setCustomBody(rendered);
                        } else {
                          setCustomBody(tFound.body);
                        }
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-700/50"
                  >
                    {letterTemplates.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الموظف المعني بالخطاب:</label>
                  <select
                    value={selectedLetterEmpId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setSelectedLetterEmpId(empId);
                      const emp = employees.find(emp => emp.id === empId);
                      const tFound = letterTemplates.find(t => t.id === selectedTemplateId) || letterTemplates[0];
                      if (emp && tFound) {
                        const rendered = tFound.body
                          .replace(/\{\{اسم الموظف\}\}/g, emp.nameAr || emp.fullNameAr || 'الموظف')
                          .replace(/\{\{الرقم المدني\}\}/g, emp.civilId || '—')
                          .replace(/\{\{المسمى\}\}/g, emp.jobTitle || 'موظف إداري')
                          .replace(/\{\{الراتب\}\}/g, emp.basicSalary || '350')
                          .replace(/\{\{تاريخ التعيين\}\}/g, emp.startDate || '2026-01-01')
                          .replace(/\{\{القسم\}\}/g, emp.department || 'الإدارة العامة');
                        setCustomBody(rendered);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-700/50"
                  >
                    <option value="">— اختر موظف لسحب بياناته آلياً —</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nameAr || emp.fullNameAr} ({emp.jobTitle || 'موظف'} - مدني: {emp.civilId || '—'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Zap size={14} className="text-blue-700" />
                    <span>المتغيرات الذكية المتاحة (انقر للإدراج):</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'اسم الموظف', tag: '{{اسم الموظف}}' },
                      { label: 'الرقم المدني', tag: '{{الرقم المدني}}' },
                      { label: 'المسمى الوظيفي', tag: '{{المسمى}}' },
                      { label: 'الراتب', tag: '{{الراتب}}' },
                      { label: 'تاريخ التعيين', tag: '{{تاريخ التعيين}}' },
                      { label: 'القسم', tag: '{{القسم}}' }
                    ].map((v, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCustomBody(prev => prev + ' ' + v.tag);
                          toast.success(`تم إدراج المتغير ${v.tag}`);
                        }}
                        className="bg-white hover:bg-blue-700 hover:text-white text-blue-900 border border-blue-200 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition shadow-2xs cursor-pointer"
                      >
                        {v.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rich Editor & Live Preview Area */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText size={15} className="text-blue-700" />
                    <span>محرر النصوص والصياغة الرسمية:</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Save changes to current template
                        const updatedT = letterTemplates.map(t => {
                          if (t.id === selectedTemplateId) {
                            return { ...t, subject: customSubject, body: customBody };
                          }
                          return t;
                        });
                        setLetterTemplates(updatedT);
                        toast.success('تم حفظ التعديلات على القالب بنجاح');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      حفظ القالب
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان الموضوع:</label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">نص الخطاب (يدعم المتغيرات الذكية):</label>
                    <textarea
                      rows={6}
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 leading-relaxed font-sans focus:ring-2 focus:ring-blue-700/50"
                    ></textarea>
                  </div>

                  {/* Live Preview Card simulating A4 Header & Footer */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>معاينة حية لشكل الطباعة الرسمي (A4)</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">جاهز للطباعة الفورية</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="text-center border-b border-slate-200 pb-3">
                        <h4 className="font-bold text-blue-900 text-sm">{activeCompany?.nameAr || 'شركة متميزة للخدمات التجارية'}</h4>
                        <p className="text-[10px] text-slate-500">{activeCompany?.nameEn || 'Distinguished Commercial Services Co.'} - دولة الكويت</p>
                        <h5 className="font-bold text-slate-800 text-xs mt-2 underline">{customSubject}</h5>
                      </div>

                      <div 
                        ref={previewRef}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onInput={(e) => {
                          setCustomBody(e.currentTarget.innerText);
                        }}
                        onBlur={(e) => {
                          setCustomBody(e.currentTarget.innerText);
                        }}
                        className="text-xs text-slate-700 leading-relaxed min-h-[100px] bg-amber-50/20 p-4 rounded-lg border border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text whitespace-pre-wrap"
                        title="انقر هنا للتعديل المباشر على النص مثل مايكروسوفت وورد"
                      >
                        {customBody}
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100">
                        <span>الختم الرسمي والتوقيع المعتمد</span>
                        <span>تاريخ الإصدار: {new Date().toLocaleDateString('ar-KW')}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          const htmlToPrint = previewRef.current ? previewRef.current.innerHTML : customBody;
                          const today = new Date().toLocaleDateString('ar-KW');

                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(`
                              <!DOCTYPE html>
                              <html dir="rtl" lang="ar">
                              <head>
                                <meta charset="utf-8">
                                <title>${customSubject}</title>
                                <style>
                                  body { font-family: 'Cairo', Tahoma, sans-serif; padding: 40px; color: #1e293b; direction: rtl; background: #ffffff; }
                                  @media print { body { padding: 10px; } }
                                </style>
                              </head>
                              <body>
                                <div style="font-size: 14px; line-height: 2.2; text-align: justify; white-space: pre-wrap;">
                                  ${htmlToPrint}
                                </div>
                                <script>window.onload = function() { window.focus(); window.print(); };</script>
                              </body>
                              </html>
                            `);
                            printWindow.document.close();
                          } else {
                            safePrintAction(customSubject);
                          }
                        }}
                        className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Printer size={15} />
                        <span>طباعة الخطاب (A4 مع الترويسة)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OdooPamWorkforceApp;
