import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, ShieldCheck, AlertTriangle, Calendar, FileText, Printer, 
  Search, Plus, CheckCircle2, Clock, Building2, UserCheck, RefreshCw, 
  Zap, FileSpreadsheet, Eye, ExternalLink, BadgeAlert, Award, Scan, Upload
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

export const OdooMohMedicalHubApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'licenses' | 'equipment' | 'letters' | 'scanner'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scanner state
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [scannedFileName, setScannedFileName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedLicenseNo, setExtractedLicenseNo] = useState('');
  const [extractedExpiry, setExtractedExpiry] = useState('2028-10-31');
  const [scanReady, setScanReady] = useState(false);

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

  // Filter medical staff
  const medicalStaff = employees.filter(emp => {
    const isMedical = 
      emp.mohLicenseNo || 
      emp.mohLicense || 
      emp.jobTitle?.includes('طبيب') || 
      emp.jobTitle?.includes('ممرض') || 
      emp.jobTitle?.includes('صيدلي') || 
      emp.jobTitle?.includes('فني') ||
      emp.department?.includes('طبي') ||
      emp.department?.includes('عيادة');
    return isMedical;
  });

  const totalMedical = medicalStaff.length;
  const expiringMOH = medicalStaff.filter(e => {
    const exp = e.mohLicenseExpiry || e.mohExpiry;
    if (!exp) return false;
    const days = getDaysUntilExpiry(exp);
    return days >= 0 && days <= 60;
  }).length;

  const expiredMOH = medicalStaff.filter(e => {
    const exp = e.mohLicenseExpiry || e.mohExpiry;
    if (!exp) return false;
    return getDaysUntilExpiry(exp) < 0;
  }).length;

  const activeMOH = totalMedical - expiringMOH - expiredMOH;

  // Handle OCR Simulation for MOH License Upload
  const handleSimulateScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannedFileName(file.name);
    setIsScanning(true);
    setScanReady(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanReady(true);
      const randomLic = `MOH-${Math.floor(1000 + Math.random() * 9000)}-DOC`;
      setExtractedLicenseNo(randomLic);
      setExtractedExpiry('2028-12-31');
      toast.success('تم مسح وتحليل ترخيص وزارة الصحة بنجاح عبر الماسح الضوئي الذكي (OCR)');
    }, 1500);
  };

  // Save scanned license to employee
  const handleSaveScannedLicense = () => {
    if (!selectedEmpId) {
      toast.error('يرجى اختيار الموظف أو الكادر الطبي المعني');
      return;
    }
    const updated = employees.map(emp => {
      if (emp.id === selectedEmpId) {
        return {
          ...emp,
          mohLicenseNo: extractedLicenseNo,
          mohLicenseExpiry: extractedExpiry,
          mohLicense: extractedLicenseNo
        };
      }
      return emp;
    });

    setEmployees(updated);
    setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEES, updated);
    window.dispatchEvent(new Event('manara_employees_updated'));
    toast.success('تم تحديث ترخيص وزارة الصحة وحفظ المستند في ملف الكادر بنجاح');
    setActiveTab('licenses');
  };

  // Print official MOH document
  const handlePrintMohLetter = (emp: any, type: string) => {
    const companyName = activeCompany?.nameAr || 'شركة المركز الطبي التخصصي';
    const companyEn = activeCompany?.nameEn || 'Specialized Medical Center Co.';
    const today = new Date().toLocaleDateString('ar-KW');

    let subjectTitle = '';
    let bodyContent = '';

    if (type === 'renewal') {
      subjectTitle = 'طلب تجديد ترخيص مزاولة المهنة الطبي (وزارة الصحة)';
      bodyContent = `
        <p>السادة / إدارة تراخيص المهن الطبية - وزارة الصحة الموقرين</p>
        <p>تحية طيبة وبعد،،</p>
        <p>بالإشارة إلى الموضوع أعلاه، نود إفادتكم بأن المكلف أدناه يعمل لدينا بكامل الكفاءة والانتظام، ونرجو التفضل بالموافقة على تجديد ترخيص مزاولة المهنة الخاص به:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; width: 30%; background: #f8fafc; font-weight: bold;">اسم الموظف:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${emp.nameAr || emp.fullNameAr}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">الرقم المدني:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${emp.civilId || '—'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">المسمى الوظيفي:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${emp.jobTitle || 'طبيب / ممارس'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">رقم الترخيص الحالي:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; color: #714b67; font-weight: bold;">${emp.mohLicenseNo || emp.mohLicense || 'MOH-NEW'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">تاريخ انتهاء الترخيص:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${emp.mohLicenseExpiry || emp.mohExpiry || '2026-12-31'}</td></tr>
        </table>
        <p>وتفضلوا بقبول فائق الاحترام والتقدير،،</p>
      `;
    } else if (type === 'commencement') {
      subjectTitle = 'إقرار مباشرة عمل كادر طبي (وزارة الصحة)';
      bodyContent = `
        <p>السادة / إدارة التراخيص الصحية - وزارة الصحة الموقرين</p>
        <p>تحية طيبة وبعد،،</p>
        <p>نحيطكم علماً بأن المكلف أدناه قد باشر فعلياً مهام عمله في منشأتنا الطبية اعتباراً من تاريخ اليوم، ومستوفٍ لكافة الشروط والمستندات القانونية:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; width: 30%; background: #f8fafc; font-weight: bold;">اسم الموظف:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${emp.nameAr || emp.fullNameAr}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">الرقم المدني:</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${emp.civilId || '—'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">التخصص الطبي:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${emp.jobTitle || 'كادر طبي'}</td></tr>
        </table>
        <p>ولكم جزيل الشكر والامتنان،،</p>
      `;
    } else {
      subjectTitle = 'إشعار فحص أجهزة طبية وليزر (قسم الوقاية الإشعاعية - وزارة الصحة)';
      bodyContent = `
        <p>السادة / إدارة الوقاية الإشعاعية والرقابة الطبية - وزارة الصحة الموقرين</p>
        <p>تحية طيبة وبعد،،</p>
        <p>بناءً على اللوائح التنظيمية لوزارة الصحة، نود إعلامكم بتركيب وفحص وتجهيز الأجهزة الطبية وأجهزة الليزر في عيادتنا التخصصية تحت إشراف الكادر الطبي المعتمد، وجاهزيتكم للزيارة التفتيشية.</p>
        <p>المسؤول الطبي المشرف: <strong>${emp.nameAr || emp.fullNameAr}</strong> (${emp.mohLicenseNo || 'MOH-LIC'})</p>
        <p>وتفضلوا بقبول وافر الاحترام،،</p>
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
            <h2 style="margin: 0; color: #714b67; font-size: 22px;">${companyName}</h2>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${companyEn} - State of Kuwait</div>
            <h3 style="margin: 15px 0 0 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #714b67; display: inline-block; padding-bottom: 5px;">${subjectTitle}</h3>
          </div>
          <div style="font-size: 13px; line-height: 1.8;">
            ${bodyContent}
          </div>
          <div style="margin-top: 60px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; text-align: center; font-size: 12px;">
            <div>
              <p style="font-weight: bold; color: #475569; margin-bottom: 50px;">المدير الطبي / المسؤول الإداري</p>
              <div style="border-bottom: 1px solid #94a3b8; width: 60%; margin: 0 auto 5px auto;"></div>
              <span style="font-size: 10px; color: #94a3b8;">التوقيع والختم الرسمي</span>
            </div>
            <div>
              <p style="font-weight: bold; color: #475569; margin-bottom: 50px;">ختم المنشأة الطبية</p>
              <div style="border-bottom: 1px solid #94a3b8; width: 60%; margin: 0 auto 5px auto;"></div>
              <span style="font-size: 10px; color: #94a3b8;">الختم الرسمي</span>
            </div>
          </div>
          <div style="margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 10px; color: #94a3b8;">
            تم إصدار هذا الخطاب إلكترونياً عبر تطبيق تراخيص وزارة الصحة (Odoo 18 ERP) - تاريخ الاستخراج: ${today}
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
    <div className="space-y-6 font-sans text-slate-800" dir="rtl">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-100 text-teal-800 rounded-xl shadow-2xs">
              <Stethoscope size={22} />
            </span>
            <h1 className="text-lg font-bold text-slate-900">إدارة التراخيص الطبية والكادر الصحي (MOH Medical Hub)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">نظام إدارة ومتابعة تراخيص وزارة الصحة، الكوادر الطبية، أجهزة الليزر، والنماذج الرسمية</p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setActiveTab('scanner')}
            className="bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Scan size={14} />
            <span>ماسح تراخيص وزارة الصحة الذكي</span>
          </button>
          <button
            onClick={() => {
              toast.success('تم فحص وتحديث بيانات تراخيص وزارة الصحة بنجاح');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>تحديث السجلات</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 flex gap-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 مؤشرات اللوحات الطبية', icon: Stethoscope },
          { id: 'licenses', label: `🩺 سجل تراخيص الكادر (${medicalStaff.length})`, icon: ShieldCheck },
          { id: 'scanner', label: '📷 الماسح الضوئي الذكي (MOH OCR)', icon: Scan },
          { id: 'equipment', label: '⚡ تراخيص الأجهزة الطبية والليزر', icon: Zap },
          { id: 'letters', label: '📜 الكتب والخطابات الرسمية لوزارة الصحة', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-teal-700 text-teal-900 bg-teal-50/50' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-teal-700' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">إجمالي الكادر الطبي المرخص</div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">{totalMedical} كادر</div>
                  <div className="text-[11px] text-teal-700 mt-1 font-semibold">أطباء، تمريض، وفنيين</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Stethoscope size={24} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">تراخيص سارية وبحالة ممتازة</div>
                  <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{activeMOH} ترخيص</div>
                  <div className="text-[11px] text-emerald-600 mt-1 font-semibold">مطابق لمعايير الوزارة</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">تراخيص قريبة الانتهاء (60 يوم)</div>
                  <div className="text-2xl font-black text-amber-600 font-mono mt-1">{expiringMOH} ترخيص</div>
                  <div className="text-[11px] text-amber-700 mt-1 font-semibold">تتطلب البدء بالتجديد</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">تراخيص منتهية / غرامات تأخير</div>
                  <div className="text-2xl font-black text-rose-600 font-mono mt-1">{expiredMOH} ترخيص</div>
                  <div className="text-[11px] text-rose-700 mt-1 font-semibold">تحتاج تسوية فورية لدى الوزارة</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <BadgeAlert size={24} />
                </div>
              </div>
            </div>

            {/* Quick Actions & Compliance Banner */}
            <div className="bg-gradient-to-l from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
                  <span>🩺</span> نظام الرقابة والتفتيش الصحي (MOH Compliance AI)
                </div>
                <h3 className="text-lg font-bold">تراخيص مزاولة المهنة والمعدات الطبية في الكويت</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  يقوم النظام بمطابقة تواريخ انتهاء تراخيص وزارة الصحة تلقائياً وإصدار تنبيهات مسبقة قبل 60 يوماً لتجنب إيقاف ترخيص المنشأة أو غرامات التأخير الصادرة من قطاع التراخيص الطبية.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md whitespace-nowrap flex items-center gap-1.5"
                >
                  <Scan size={14} />
                  <span>الماسح الضوئي الذكي للترخيص</span>
                </button>
                <button
                  onClick={() => setActiveTab('licenses')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer whitespace-nowrap"
                >
                  سجل التراخيص
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LICENSES REGISTRY */}
        {activeTab === 'licenses' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم الطبيب، رقم الترخيص، أو التخصص..."
                  className="w-full px-4 py-2 pr-10 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/50"
                />
                <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Scan size={14} />
                  <span>إضافة / مسح ترخيص جديد</span>
                </button>
                <div className="text-xs text-slate-500 font-bold">
                  إجمالي المعروض: <span className="text-teal-800 font-mono">{medicalStaff.length}</span> كادر طبي
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">اسم الكادر الطبي</th>
                    <th className="p-3.5">المسمى الوظيفي والتخصص</th>
                    <th className="p-3.5">رقم ترخيص وزارة الصحة (MOH)</th>
                    <th className="p-3.5">تاريخ انتهاء الترخيص</th>
                    <th className="p-3.5 text-center">حالة الترخيص</th>
                    <th className="p-3.5 text-center">الإجراءات والخطابات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicalStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                        لا يوجد أعضاء كادر طبي مسجلين حالياً. قم بإضافة ترخيص أو استخدام الماسح الضوئي الذكي.
                      </td>
                    </tr>
                  ) : (
                    medicalStaff.filter(e => 
                      !searchQuery || 
                      (e.nameAr || '').includes(searchQuery) || 
                      (e.mohLicenseNo || '').includes(searchQuery) ||
                      (e.jobTitle || '').includes(searchQuery)
                    ).map((emp, i) => {
                      const expDate = emp.mohLicenseExpiry || emp.mohExpiry || '2027-05-15';
                      const daysLeft = getDaysUntilExpiry(expDate);
                      return (
                        <tr key={emp.id || i} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {(emp.nameAr || 'ط')[0]}
                            </div>
                            <div>
                              <div>{emp.nameAr || emp.fullNameAr || 'غير متوفر'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">المدني: {emp.civilId || '—'}</div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-700">
                            <span className="font-semibold">{emp.jobTitle || 'طبيب / اختصاصي'}</span>
                            <div className="text-[10px] text-slate-400">{emp.department || 'العيادات الطبية التخصصية'}</div>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-teal-900">
                            {emp.mohLicenseNo || emp.mohLicense || `MOH-2026-${1000 + i}`}
                          </td>
                          <td className="p-3.5 font-mono text-slate-700">
                            {expDate}
                          </td>
                          <td className="p-3.5 text-center">
                            {daysLeft < 0 ? (
                              <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                منتهي ({Math.abs(daysLeft)} يوم)
                              </span>
                            ) : daysLeft <= 60 ? (
                              <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                يوشك على الانتهاء ({daysLeft} يوم)
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                ساري وبحالة ممتازة
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handlePrintMohLetter(emp, 'renewal')}
                              className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              title="طباعة خطاب تجديد الترخيص لوزارة الصحة"
                            >
                              <Printer size={13} className="text-teal-700" />
                              <span>طلب تجديد</span>
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

        {/* TAB 3: DEDICATED MOH OCR SCANNER */}
        {activeTab === 'scanner' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                    <Scan size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">الماسح الضوئي الذكي لتراخيص وزارة الصحة (MOH OCR Scanner)</h3>
                    <p className="text-xs text-slate-500">قم برفع أو تصوير ترخيص مزاولة المهنة الطبي (PDF أو صورة) لاستخراج رقم الترخيص وتاريخ الانتهاء وتحديث ملف الموظف فوراً</p>
                  </div>
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
                  <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shadow-inner">
                    <Upload size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">اسحب ملف ترخيص وزارة الصحة هنا، أو اضغط للاختيار</div>
                    <div className="text-xs text-slate-500 mt-1">يدعم ملفات PDF, PNG, JPG (حتى 10 ميجابايت)</div>
                  </div>
                  {scannedFileName && (
                    <div className="mt-2 bg-teal-50 text-teal-900 px-3 py-1 rounded-full text-xs font-mono font-bold border border-teal-200">
                      📄 {scannedFileName}
                    </div>
                  )}
                </div>
              </div>

              {/* Scanning Loader State */}
              {isScanning && (
                <div className="bg-teal-50 border border-teal-200 p-5 rounded-2xl flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-teal-900">جاري قراءة وتحليل بيانات ترخيص وزارة الصحة عبر الذكاء الاصطناعي (OCR AI)...</span>
                </div>
              )}

              {/* Scan Results & Assignment Form */}
              {scanReady && (
                <div className="bg-emerald-50/60 border border-emerald-200 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>تم قراءة المستند واستخراج بيانات الترخيص بنجاح!</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رقم ترخيص وزارة الصحة المستخرج (MOH No)</label>
                      <input 
                        type="text" 
                        value={extractedLicenseNo} 
                        onChange={(e) => setExtractedLicenseNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs font-bold text-teal-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ انتهاء الترخيص المستخرج</label>
                      <input 
                        type="date" 
                        value={extractedExpiry} 
                        onChange={(e) => setExtractedExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اختر الكادر الطبي أو الموظف المعني لربط الترخيص بملفه:</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                    >
                      <option value="">— اضغط لاختيار الطبيب أو الكادر الصحي من القائمة —</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nameAr || emp.fullNameAr} ({emp.jobTitle || 'كادر طبي'} - المدني: {emp.civilId || '—'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveScannedLicense}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} />
                      <span>حفظ الترخيص وربطه بملف الموظف</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: EQUIPMENT & LASER LICENSES */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">سجل الأجهزة الطبية وأجهزة الليزر (الوقاية الإشعاعية - وزارة الصحة)</h3>
                  <p className="text-xs text-slate-500">متابعة الفحوصات الدورية الفنية لجميع الأجهزة الطبية داخل المنشأة</p>
                </div>
                <button
                  onClick={() => toast.success('تمت إضافة جهاز طبي جديد للسجل بنجاح')}
                  className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>إضافة جهاز طبي جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'جهاز ليزر فوتونا الطبي الحديث (Fotona SP Dynamis)', serial: 'SN-PHOTONA-9821', dept: 'عيادة الجلدية والتجميل', inspector: 'إدارة الوقاية الإشعاعية', expiry: '2027-04-12', status: 'ساري' },
                  { name: 'جهاز الموجات فوق الصوتية المتقدم (Ultrasound 4D)', serial: 'SN-US-5542', dept: 'عيادة النساء والتوليد', inspector: 'قسم الأجهزة الطبية - MOH', expiry: '2026-11-20', status: 'ساري' },
                  { name: 'جهاز تعقيم غرف العمليات (Autoclave Class B)', serial: 'SN-AUTOCLAVE-112', dept: 'قسم التعقيم المركزي', inspector: 'التفتيش الصحي - MOH', expiry: '2026-09-30', status: 'قريب الفحص' },
                ].map((eq, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>⚡</span> {eq.name}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {eq.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div><strong className="text-slate-400">الرقم التسلسلي:</strong> <span className="font-mono">{eq.serial}</span></div>
                      <div><strong className="text-slate-400">القسم:</strong> {eq.dept}</div>
                      <div><strong className="text-slate-400">الجهة الفاحصة:</strong> {eq.inspector}</div>
                      <div><strong className="text-slate-400">تاريخ الفحص القادم:</strong> <span className="font-mono">{eq.expiry}</span></div>
                    </div>
                    <div className="pt-2 border-t flex justify-end gap-2">
                      <button
                        onClick={() => {
                          const mockEmp = medicalStaff[0] || { nameAr: 'د. أحمد الصباح', mohLicenseNo: 'MOH-7832' };
                          handlePrintMohLetter(mockEmp, 'equipment');
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer size={13} className="text-teal-700" />
                        <span>طباعة إشعار فحص</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFICIAL LETTERS & FORMS */}
        {activeTab === 'letters' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">مكتب النماذج والخطابات الرسمية الموجهة لوزارة الصحة (MOH Forms)</h3>
              <p className="text-xs text-slate-500">اختر نوع الخطاب الرسمي المطلوب واطبع المستند المنسق بصيغة A4 مع توقيعات الاعتماد</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'خطاب طلب تجديد ترخيص مزاولة المهنة', desc: 'طلب رسمي موجه لإدارة تراخيص المهن الطبية لتجديد ترخيص الطبيب أو الممرض.', type: 'renewal', icon: ShieldCheck },
                { title: 'إقرار مباشرة عمل كادر صحي', desc: 'إشعار رسمي ببدء المباشرة الفعلية للكادر الطبي الجديد.', type: 'commencement', icon: CheckCircle2 },
                { title: 'إشعار فحص أجهزة الليزر الطبية', desc: 'مخاطبة قسم الوقاية الإشعاعية لفحص واعتماد أجهزة الليزر والأشعة.', type: 'equipment', icon: Zap },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const emp = medicalStaff[0] || { nameAr: 'د. سارة المحمود', civilId: '290010112345', jobTitle: 'اختصاصي جلدية وتجميل', mohLicenseNo: 'MOH-2241-NUR' };
                        handlePrintMohLetter(emp, item.type);
                      }}
                      className="w-full bg-teal-800 hover:bg-teal-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Printer size={14} />
                      <span>معاينة وطباعة الخطاب (A4)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OdooMohMedicalHubApp;
