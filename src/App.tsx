import React, { useState, useEffect } from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { OdooHierarchyProvider, useOdooHierarchy } from './context/OdooHierarchyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Users, 
  Clock, 
  Calendar, 
  Palmtree, 
  CreditCard, 
  Briefcase, 
  FolderArchive, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Sliders, 
  Building2, 
  ShieldAlert, 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  LogOut, 
  Building,
  KeyRound,
  Phone,
  Layers,
  ArrowRight
} from 'lucide-react';

// استيراد التطبيقات الكاملة الـ 11
import EmployeesApp from './apps/EmployeesApp';
import { OdooAttendanceApp } from './components/OdooAttendanceApp';
import { ShiftsApp } from './apps/ShiftsApp';
import { OdooTimeOffApp } from './components/OdooTimeOffApp';
import { OdooPayrollApp } from './components/OdooPayrollApp';
import { OdooOperationsApp } from './components/OdooOperationsApp';
import { OdooCompanyDocsApp } from './components/OdooCompanyDocsApp';
import { OdooTemplatesApp } from './components/OdooTemplatesApp';
import { OdooPublicHolidaysApp } from './components/OdooPublicHolidaysApp';
import { OdooReportsApp } from './components/OdooReportsApp';
import { OdooSettingsFull } from './components/OdooSettingsFull';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';

type AppId = 
  | 'switcher' 
  | 'employees' 
  | 'attendance' 
  | 'shifts' 
  | 'leaves' 
  | 'payroll' 
  | 'custody' 
  | 'archive' 
  | 'letters' 
  | 'holidays' 
  | 'reports' 
  | 'settings'
  | 'saas_admin';

function MainAppLayout() {
  const { 
    isSuperAdmin, 
    activeCompany, 
    companies, 
    impersonatingCompanyId, 
    impersonateCompany, 
    exitImpersonation,
    addCompany,
    updateCompanyPassword,
    deleteCompany
  } = useTenant();

  const { employees } = useOdooHierarchy();
  const { logout, user } = useAuth();

  const [shifts, setShifts] = useState<any[]>([]);
  const [employeeShifts, setEmployeeShifts] = useState<any[]>([]);
  const [debugMode, setDebugMode] = useState(false);

  // Single-View Controller: يمنع تداخل أي شاشتين نهائياً
  const [activeApp, setActiveApp] = useState<AppId>('switcher');
  const [searchQuery, setSearchQuery] = useState('');

  // نموذج إضافة مشترك جديد
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPamNumber, setNewPamNumber] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // الوقت والتاريخ المباشر لدولة الكويت
  const [kuwaitTime, setKuwaitTime] = useState('');

  useEffect(() => {
    const updateKuwaitTime = () => {
      const now = new Date();
      setKuwaitTime(now.toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Kuwait', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      }));
    };
    updateKuwaitTime();
    const interval = setInterval(updateKuwaitTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const appsList = [
    { id: 'employees', name: 'الموظفون والعقود', subtitle: 'Employees & Contracts', icon: Users, color: 'bg-rose-500' },
    { id: 'attendance', name: 'الحضور والبصمة', subtitle: 'Attendance & Biometrics', icon: Clock, color: 'bg-indigo-600' },
    { id: 'shifts', name: 'تخطيط الشفتات', subtitle: 'Shifts & Planning', icon: Calendar, color: 'bg-amber-600' },
    { id: 'leaves', name: 'الإجازات والغياب', subtitle: 'Time Off & Leaves', icon: Palmtree, color: 'bg-emerald-600' },
    { id: 'payroll', name: 'الرواتب و WPS', subtitle: 'Payroll & Wages Protection', icon: CreditCard, color: 'bg-green-600' },
    { id: 'custody', name: 'العمليات ونهاية الخدمة', subtitle: 'Operations & EOS', icon: Briefcase, color: 'bg-orange-500' },
    { id: 'archive', name: 'أرشيف المستندات', subtitle: 'Documents Archive', icon: FolderArchive, color: 'bg-amber-500' },
    { id: 'letters', name: 'النماذج والخطابات', subtitle: 'Templates & Letters', icon: FileText, color: 'bg-sky-600' },
    { id: 'holidays', name: 'العطلات الرسمية', subtitle: 'Kuwait Official Holidays', icon: Sparkles, color: 'bg-purple-600' },
    { id: 'reports', name: 'لوحة القيادة والتقارير', subtitle: 'Executive Dashboard', icon: BarChart3, color: 'bg-blue-600' },
    { id: 'settings', name: 'الإعدادات والمشتركين', subtitle: 'Settings & SaaS Tenants', icon: Sliders, color: 'bg-slate-700' },
  ];

  const filteredApps = appsList.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActiveAppTitle = () => {
    switch (activeApp) {
      case 'switcher': return 'التطبيقات الرئيسية (App Launcher)';
      case 'employees': return 'شؤون الموظفين والعقود (Employees & Contracts)';
      case 'attendance': return 'الحضور وسجلات البصمة (Attendance)';
      case 'shifts': return 'تخطيط جداول الشفتات (Shifts Planning)';
      case 'leaves': return 'إدارة الإجازات والأرصدة (Time Off)';
      case 'payroll': return 'الرواتب وملف حماية الأجور (Payroll & WPS)';
      case 'custody': return 'العهد والعمليات ونهاية الخدمة (Custody & EOS)';
      case 'archive': return 'الأرشيف والمستندات الرسمية (Documents)';
      case 'letters': return 'النماذج والخطابات الرسمية (Templates)';
      case 'holidays': return 'العطلات الرسمية والتقويم (Kuwait Holidays)';
      case 'reports': return 'لوحة القيادة والتقارير الإحصائية (Reports)';
      case 'settings': return 'الإعدادات العامة وإدارة المشتركين (SaaS Settings)';
      default: return 'نظام Aysed S HR 2026';
    }
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden bg-slate-100 dir-rtl text-right text-slate-800" dir="rtl">
      <Toaster position="top-center" reverseOrder={false} />

      {/* شريط تنبيه الدخول كمسؤول (Strict Impersonation Banner) */}
      {impersonatingCompanyId && (
        <div className="h-9 bg-amber-400 text-slate-950 text-xs px-4 font-bold flex items-center justify-between shrink-0 shadow-md border-b border-amber-500 z-50 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping inline-block" />
            <span className="bg-slate-950 text-amber-300 text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase">
              وضع الدخول كمسؤول (Impersonation Mode)
            </span>
            <span className="text-slate-950 font-bold">
              أنت تتصفح وتدير شركة: <strong className="underline decoration-2 font-black">{activeCompany?.nameAr || 'الشركة المشتركة'}</strong>
            </span>
            <span className="bg-slate-950/15 text-slate-950 text-[11px] px-2 py-0.5 rounded font-mono font-bold">
              ملف الشؤون: {activeCompany?.pamFileNumber || '---'}
            </span>
          </div>

          <button 
            onClick={() => {
              exitImpersonation();
              toast.success('تم إنهاء وضع المحاكاة والعودة للوحة السوبر أدمن المركزية');
            }} 
            className="bg-slate-950 hover:bg-black text-amber-300 hover:text-white px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <LogOut size={12} />
            <span>إنهاء المعاينة والعودة للسوبر أدمن ✕</span>
          </button>
        </div>
      )}

      {/* الشريط العلوي النحيف الموحد (Odoo Slim Navbar) */}
      <header className="h-11 bg-[#714B67] text-white flex items-center justify-between px-4 z-40 select-none shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveApp('switcher')} 
            className={`p-1.5 hover:bg-white/20 rounded-md transition text-lg font-bold flex items-center justify-center cursor-pointer ${
              activeApp === 'switcher' ? 'bg-white/25 shadow-inner' : ''
            }`}
            title="العودة لشبكة التطبيقات الرئيسية"
          >
            <span className="leading-none text-xl">▦</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wide bg-white/10 px-2.5 py-1 rounded text-amber-200">
              Aysed S HR 2026
            </span>
            <span className="text-white/40 font-light">|</span>
            <span className="text-xs font-semibold text-white/90 truncate max-w-xs md:max-w-md">
              {getActiveAppTitle()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* توقيت الكويت */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded text-[11px] font-mono text-amber-200 border border-white/10">
            <Clock size={12} className="text-amber-300" />
            <span>الكويت: {kuwaitTime}</span>
          </div>

          {/* شارة المنشأة أو السوبر أدمن */}
          <div className={`px-3 py-1 rounded border text-xs font-bold flex items-center gap-1.5 ${
            impersonatingCompanyId 
              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black' 
              : 'bg-white/15 text-white border-white/20'
          }`}>
            <Building size={13} />
            <span className="truncate max-w-[160px]">
              {activeCompany ? activeCompany.nameAr : 'النظام المركزي (سوبر أدمن)'}
            </span>
          </div>

          {/* زر تبديل وضع السوبر أدمن المباشر */}
          <button 
            onClick={() => setActiveApp('settings')}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
              activeApp === 'settings' 
                ? 'bg-white text-[#714B67] shadow-xs' 
                : 'bg-black/20 hover:bg-black/30 text-purple-200'
            }`}
          >
            <Layers size={13} />
            <span>بوابة المشتركين SaaS</span>
          </button>

          {/* زر وضع المطور في الهيدر */}
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              debugMode 
                ? 'bg-amber-400 text-slate-950 shadow-sm animate-pulse' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="تفعيل/تعطيل وضع المطور والأدوات التقنية"
          >
            <span>🐞</span>
            <span>{debugMode ? 'وضع المطور نشط' : 'وضع المطور'}</span>
          </button>

          {/* تسجيل الخروج */}
          <button 
            onClick={() => {
              if (impersonatingCompanyId) {
                exitImpersonation();
              }
              logout();
              toast.success('تم تسجيل الخروج بنجاح');
            }}
            className="hover:bg-rose-600/80 transition text-xs font-bold bg-black/25 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* حاوية العرض الصارمة المانعة للتداخل (Strict Single-View Canvas) */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* الحالة 1: شاشة مبدل التطبيقات والأيقونات فقط (Odoo App Launcher) */}
        {activeApp === 'switcher' && (
          <div className="flex-1 bg-gradient-to-b from-slate-900 via-[#111827] to-slate-950 flex flex-col items-center p-6 md:p-10 overflow-y-auto w-full">
            
            {/* شريط البحث المباشر */}
            <div className="w-full max-w-md my-4 relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث فوري في التطبيقات الـ 11..." 
                className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-center backdrop-blur-md shadow-lg"
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            </div>

            {/* شبكة الأيقونات الـ 11 المتناسقة */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto px-4 mt-4">
              {filteredApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <div 
                    key={app.id} 
                    onClick={() => {
                      setActiveApp(app.id as AppId);
                      setSearchQuery('');
                    }}
                    className="flex flex-col items-center cursor-pointer group w-28 text-center"
                  >
                    <div className={`w-20 h-20 md:w-22 md:h-22 ${app.color} rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl group-hover:scale-110 group-hover:shadow-2xl group-active:scale-95 transition-all duration-200 border border-white/20`}>
                      <IconComponent size={36} />
                    </div>
                    <span className="text-xs md:text-sm text-slate-100 mt-3 text-center font-bold leading-tight group-hover:text-amber-300 transition-colors">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight font-sans">
                      {app.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* بطاقة معلومات النظام في الأسفل */}
            <div className="mt-auto pt-8 text-center text-slate-500 text-xs">
              <p>نظام Aysed S HR 2026 • متوافق 100% مع قانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010</p>
              <p className="mt-1 font-mono text-[11px] text-slate-600">Strict Multi-Tenant SaaS Isolation Engine</p>
            </div>
          </div>
        )}

        {/* الحالة 2: شؤون الموظفين والعقود (Employees Directory & Contracts) */}
        {activeApp === 'employees' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full">
            <EmployeesApp />
          </main>
        )}

        {/* الحالة 3: الحضور والبصمة (Attendance) */}
        {activeApp === 'attendance' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooAttendanceApp />
          </main>
        )}

        {/* الحالة 4: تخطيط الشفتات (Shifts) */}
        {activeApp === 'shifts' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <ShiftsApp 
              shifts={shifts}
              employeeShifts={employeeShifts}
              employees={employees as any}
              activeCompany={activeCompany || { id: 'default', nameAr: 'الشركة الرئيسية', nameEn: 'Main Co', email: '', phone: '', status: 'active', currency: 'KWD' }}
              onSaveShift={(s) => setShifts(prev => [...prev.filter(x => x.id !== s.id), s])}
              onDeleteShift={(id) => setShifts(prev => prev.filter(x => x.id !== id))}
              onAssignShift={(asg) => setEmployeeShifts(prev => [...prev.filter(x => x.id !== asg.id), asg])}
              onRemoveAssignment={(id) => setEmployeeShifts(prev => prev.filter(x => x.id !== id))}
            />
          </main>
        )}

        {/* الحالة 5: الإجازات والغياب (Leaves) */}
        {activeApp === 'leaves' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooTimeOffApp />
          </main>
        )}

        {/* الحالة 6: الرواتب و WPS (Payroll) */}
        {activeApp === 'payroll' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooPayrollApp />
          </main>
        )}

        {/* الحالة 7: العمليات والعهد ونهاية الخدمة (Custody & EOS) */}
        {activeApp === 'custody' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooOperationsApp />
          </main>
        )}

        {/* الحالة 8: أرشيف المستندات (Documents) */}
        {activeApp === 'archive' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooCompanyDocsApp />
          </main>
        )}

        {/* الحالة 9: النماذج والخطابات الرسمية (Templates) */}
        {activeApp === 'letters' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooTemplatesApp />
          </main>
        )}

        {/* الحالة 10: العطلات الرسمية (Kuwait Holidays) */}
        {activeApp === 'holidays' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooPublicHolidaysApp />
          </main>
        )}

        {/* الحالة 11: لوحة القيادة والتقارير (Reports Dashboard) */}
        {activeApp === 'reports' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooReportsApp />
          </main>
        )}

        {/* الحالة 12: شاشة لوحة تحكم السوبر أدمن وإدارة المشتركين (SaaS Settings) */}
        {activeApp === 'settings' && (
          <main className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* ترويسة إدارة المشتركين */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="text-[#714B67]" size={24} />
                    بوابة السوبر أدمن وإدارة الشركات المشتركة (Tenants Portal)
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    إدارة التراخيص السحابية، كلمات المرور، والدخول الفوري كمسؤول (Impersonation)
                  </p>
                </div>

                {isSuperAdmin && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>+ إضافة شركة ومشترك جديد</span>
                  </button>
                )}
              </div>

              {/* جدول المشتركين الكامل */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">قائمة الشركات المشتركة المرخصة ({companies.length})</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    العزل السحابي الصارم نشط 🛡️
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100/70 text-slate-700 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-3.5">اسم المنشأة / الشركة</th>
                        <th className="p-3.5">اسم المستخدم</th>
                        <th className="p-3.5">كلمة المرور المؤقتة</th>
                        <th className="p-3.5">ملف الشؤون (PAM)</th>
                        <th className="p-3.5">الهاتف</th>
                        <th className="p-3.5">تاريخ الإنشاء</th>
                        <th className="p-3.5 text-center">الإجراءات والتحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companies.map((comp) => {
                        const isCurrentActive = impersonatingCompanyId === comp.id;
                        return (
                          <tr key={comp.id} className={`hover:bg-slate-50 transition ${isCurrentActive ? 'bg-amber-50/80 font-medium' : ''}`}>
                            <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#714B67] flex items-center justify-center font-bold text-xs shrink-0">
                                {comp.nameAr.charAt(0)}
                              </div>
                              <div>
                                <div>{comp.nameAr}</div>
                                <div className="text-[10px] text-slate-400 font-normal">{comp.nameEn}</div>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-slate-700 font-semibold">{comp.adminUsername}</td>
                            <td className="p-3.5">
                              <input 
                                type="text" 
                                defaultValue={comp.adminPassword} 
                                onBlur={(e) => {
                                  updateCompanyPassword(comp.id, e.target.value);
                                  toast.success(`تم تحديث كلمة المرور لـ ${comp.nameAr}`);
                                }}
                                className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs w-36 focus:outline-none focus:border-[#714B67] font-mono bg-slate-50"
                              />
                            </td>
                            <td className="p-3.5 text-slate-600 font-mono">{comp.pamFileNumber || '---'}</td>
                            <td className="p-3.5 text-slate-600 font-mono">{comp.contactPhone || '---'}</td>
                            <td className="p-3.5 text-slate-500 font-mono">{comp.createdAt}</td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => {
                                    impersonateCompany(comp.id);
                                    setActiveApp('employees');
                                    toast.success(`تم الدخول بصفة مسؤول لشركة: ${comp.nameAr}`, { icon: '🛡️' });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1 text-xs cursor-pointer shadow-2xs ${
                                    isCurrentActive 
                                      ? 'bg-amber-500 text-slate-950 font-black' 
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  <span>{isCurrentActive ? '✓ الجلسة نشطة' : 'دخول كمسؤول'}</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من حذف شركة (${comp.nameAr}) نهائياً؟`)) {
                                      deleteCompany(comp.id);
                                      toast.success(`تم حذف الشركة`);
                                    }
                                  }}
                                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
                                  title="حذف المشترك"
                                >
                                  <Trash2 size={14} />
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

              {/* قسم الإعدادات العامة الكاملة للنظام */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Sliders size={18} className="text-[#714B67]" />
                  الإعدادات الفنية والمالية للنظام
                </h3>
                <OdooSettingsFull />
              </div>

            </div>

            {/* Modal إضافة مشترك جديد */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 animate-in fade-in zoom-in duration-150">
                  <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="text-[#714B67]" size={20} />
                      إضافة منشأة ومشترك جديد
                    </h3>
                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="text-slate-400 hover:text-slate-700 text-lg p-1"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-3.5 text-xs text-right">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">اسم المنشأة / المركز الطبي *</label>
                      <input 
                        type="text" 
                        value={newCompName}
                        onChange={(e) => setNewCompName(e.target.value)}
                        placeholder="مثال: مركز العاصمة الطبي التخصصي" 
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-[#714B67]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">اسم مستخدم المسؤول (Admin Username) *</label>
                      <input 
                        type="text" 
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="مثال: admin_capital" 
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-[#714B67] font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">كلمة المرور الافتراضية *</label>
                      <input 
                        type="text" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="e.g. Capital2026@" 
                        className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-[#714B67] font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ملف الشؤون (PAM)</label>
                        <input 
                          type="text" 
                          value={newPamNumber}
                          onChange={(e) => setNewPamNumber(e.target.value)}
                          placeholder="PAM-10293" 
                          className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-[#714B67] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">هاتف التواصل</label>
                        <input 
                          type="text" 
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="96590000000" 
                          className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-[#714B67] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={() => {
                        if (!newCompName.trim() || !newUsername.trim() || !newPassword.trim()) {
                          toast.error('يرجى تعبئة الحقول الإلزامية');
                          return;
                        }
                        addCompany({
                          nameAr: newCompName,
                          nameEn: newCompName,
                          adminUsername: newUsername,
                          adminPassword: newPassword,
                          contactPhone: newPhone || '96590000000',
                          pamFileNumber: newPamNumber || 'PAM-000',
                          commercialReg: 'CR-1000',
                          mohLicense: 'MOH-000',
                          iban: 'KW0000000000000000000000',
                          bankName: 'بنك الكويت الوطني'
                        });
                        toast.success(`تم إنشاء وتفعيل شركة (${newCompName}) بنجاح`);
                        setShowAddModal(false);
                        setNewCompName('');
                        setNewUsername('');
                        setNewPassword('');
                        setNewPamNumber('');
                        setNewPhone('');
                      }}
                      className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      إنشاء وتفعيل المنشأة
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <TenantProvider>
      <OdooHierarchyProvider>
        <AuthProvider>
          <MainAppLayout />
        </AuthProvider>
      </OdooHierarchyProvider>
    </TenantProvider>
  );
}
