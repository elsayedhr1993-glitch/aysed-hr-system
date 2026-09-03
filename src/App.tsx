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
  Briefcase, Package, 
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
  UserCircle,
  Settings,
  Shield,
  KeyRound,
  Phone,
  Layers,
  ArrowRight,
  Scan,
  Upload
} from 'lucide-react';

// استيراد التطبيقات الكاملة الـ 11
import EmployeesApp from './apps/EmployeesApp';
import { OdooAttendanceApp } from './components/OdooAttendanceApp';
import { OdooPlanningApp } from './components/OdooPlanningApp';
import { OdooTimeOffApp } from './components/OdooTimeOffApp';
import { OdooPayrollApp } from './components/OdooPayrollApp';
import { OdooOperationsApp } from './components/OdooOperationsApp';
import { OdooCompanyDocsApp } from './components/OdooCompanyDocsApp';
import { OdooTemplatesApp } from './components/OdooTemplatesApp';
import { OdooPublicHolidaysApp } from './components/OdooPublicHolidaysApp';
import { OdooReportsApp } from './components/OdooReportsApp';
import { OdooSettingsFull } from './components/OdooSettingsFull';
import { ScannerApp } from './apps/ScannerApp';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { OdooDebugMenu } from './components/OdooDebugMenu';
import OdooLoginPage from './components/OdooLoginPage';

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
  | 'saas_admin'
  | 'scanner';

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

  const { employees, addEmployee } = useOdooHierarchy();

  const { logout, user, isLoading } = useAuth();


  const [shifts, setShifts] = useState<any[]>([]);
  const [employeeShifts, setEmployeeShifts] = useState<any[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // User Avatar & Profile state
  const [userAvatar, setUserAvatar] = useState<string>(
    localStorage.getItem('aysed_user_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  // Single-View Controller: يمنع تداخل أي شاشتين نهائياً
  const [activeApp, setActiveApp] = useState<AppId>('switcher');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);

  const handleSaveDocument = (doc: any) => {
    setDocuments(prev => [doc, ...prev]);
    toast.success('تم حفظ المستند في الأرشيف بنجاح');
  };
  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.success('تم حذف المستند');
  };
  const [employeeNotifications, setEmployeeNotifications] = useState<any[]>([]);

  const handleAutoAddEmpFromOCR = (empData: any, docType?: string) => {
    const newEmpId = `emp-${Date.now()}`;
    const newEmp = {
      id: newEmpId,
      name: empData.fullNameAr || empData.fullName || 'موظف جديد مستخرج بالذكاء الاصطناعي',
      civilId: empData.civilId || '',
      passportNo: empData.passportNo || '',
      jobTitle: empData.profession || empData.jobTitle || 'موظف معتمد',
      department: 'الإدارة العامة',
      basicSalary: 1000,
      housingAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      status: 'ACTIVE',
      joinDate: new Date().toISOString().split('T')[0],
      nationality: empData.nationality || 'الكويت',
      birthDate: empData.birthDate || empData.dob || '1990-01-01',
      expiryDate: empData.expiryDate || '2027-01-01'
    };

    if (addEmployee) {
      addEmployee(newEmp as any);
    }

    if (empData.expiryDate) {
      setEmployeeNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `تنبيه تجديد مستند (${docType || 'البطاقة المدنية'})`,
          message: `المستند الخاص بالموظف ${newEmp.name} ينتهي في تاريخ ${empData.expiryDate}. يرجى اتخاذ الإجراء اللازم.`,
          date: empData.expiryDate,
          type: 'warning',
          read: false
        },
        ...prev
      ]);
    }

    toast.success(`تم إنشاء ملف الموظف وترحيل بيانات ${docType || 'المستند'} بنجاح`);
    return newEmpId;
  };

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
    { id: 'employees', name: 'شؤون الموظفين', subtitle: 'Employees Directory', icon: Users, color: 'bg-rose-500' },
    { id: 'attendance', name: 'الحضور والانصراف', subtitle: 'Time & Attendance', icon: Clock, color: 'bg-indigo-600' },
    { id: 'shifts', name: 'جداول الشفتات', subtitle: 'Shifts & Rosters', icon: Calendar, color: 'bg-amber-600' },
    { id: 'leaves', name: 'الإجازات والغياب', subtitle: 'Time Off & Leaves', icon: Palmtree, color: 'bg-emerald-600' },
    { id: 'payroll', name: 'الرواتب وحماية الأجور', subtitle: 'Payroll & WPS', icon: CreditCard, color: 'bg-green-600' },
    { id: 'custody', name: 'العهد والممتلكات', subtitle: 'Assets & Custodies', icon: Package, color: 'bg-orange-500' },
    { id: 'archive', name: 'أرشيف المستندات', subtitle: 'Documents Archive', icon: FolderArchive, color: 'bg-amber-500' },
    { id: 'scanner', name: 'الماسح الضوئي الذكي', subtitle: 'Document Scanner OCR', icon: Scan, color: 'bg-teal-600' },
    { id: 'letters', name: 'النماذج والخطابات', subtitle: 'Templates & Letters', icon: FileText, color: 'bg-sky-600' },
    { id: 'holidays', name: 'العطلات الرسمية', subtitle: 'Public Holidays', icon: Sparkles, color: 'bg-purple-600' },
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
      case 'employees': return 'شؤون الموظفين (Employees Directory)';
      case 'attendance': return 'الحضور والانصراف (Time & Attendance)';
      case 'shifts': return 'جداول الشفتات (Shifts & Rosters)';
      case 'leaves': return 'الإجازات والغياب (Time Off & Leaves)';
      case 'payroll': return 'الرواتب وحماية الأجور (Payroll & WPS)';
      case 'custody': return 'العهد والممتلكات (Assets & Custodies)';
      case 'archive': return 'أرشيف المستندات (Documents Archive)';
      case 'scanner': return 'الماسح الضوئي الذكي (Odoo Document Scanner)';
      case 'letters': return 'النماذج والخطابات (Templates & Letters)';
      case 'holidays': return 'العطلات الرسمية (Public Holidays)';
      case 'reports': return 'لوحة القيادة والتقارير (Executive Dashboard)';
      case 'settings': return 'الإعدادات والمشتركين (Settings & SaaS Tenants)';
      default: return 'نظام Aysed S HR 2026';
    }
  };

  // Authentication Guard (Gateway)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center font-sans">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#714B67] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">جاري التحقق من الهوية...</p>
      </div>
    );
  }

  if (!user) {
    return <OdooLoginPage />;
  }

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

            {/* الشريط العلوي النحيف الموحد (Odoo Enterprise Navbar) */}
      <header className="h-12 bg-[#714B67] text-white flex items-center justify-between px-4 z-40 select-none shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {activeApp !== 'switcher' && (
            <button 
              onClick={() => setActiveApp('switcher')} 
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer"
              title="العودة للرئيسية"
            >
              <ArrowRight size={14} />
              <span>الرئيسية</span>
            </button>
          )}

          <button 
            onClick={() => setActiveApp('switcher')} 
            className={`p-1.5 hover:bg-white/20 rounded-md transition text-lg font-bold flex items-center justify-center cursor-pointer ${
              activeApp === 'switcher' ? 'bg-white/25 shadow-inner' : ''
            }`}
            title="العودة لشبكة التطبيقات الرئيسية"
          >
            <span className="leading-none text-xl">▦</span>
          </button>

          <button 
            onClick={() => setActiveApp('scanner')} 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer shadow-xs ${
              activeApp === 'scanner' ? 'bg-teal-700 text-white ring-2 ring-white/50' : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
            title="الماسح الضوئي الذكي (Odoo Document Scanner)"
          >
            <Scan size={14} />
            <span>الماسح الضوئي</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
              {activeApp === 'switcher' ? 'Aysed HR S 2026' : getActiveAppTitle()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* توقيت الكويت */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-mono text-white/90">
            <Clock size={14} className="text-white/70" />
            <span>{kuwaitTime}</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-lg transition cursor-pointer"
            >
              <div className="relative">
                <img 
                  src={userAvatar} 
                  alt="Admin Avatar" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/80 shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#714B67]" title="متصل الآن"></span>
              </div>
              <div className="text-right hidden md:block">
                <span className="block text-xs font-bold text-white truncate max-w-[100px]">السيد (Admin)</span>
                <span className="block text-[10px] text-white/80 truncate max-w-[100px]">{activeCompany ? activeCompany.nameAr : 'النظام المركزي'}</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-slate-800 dir-rtl">
                <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-br from-purple-50 to-slate-50 flex items-center gap-3">
                  <img 
                    src={userAvatar} 
                    alt="User Avatar" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#714B67] shadow-sm shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">السيد (المدير العام)</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'elsayedhr1993@gmail.com'}</p>
                    <span className="inline-block mt-1 text-[9px] bg-purple-100 text-[#714B67] font-bold px-2 py-0.5 rounded-full">
                      {activeCompany ? activeCompany.nameAr : 'Super Admin'}
                    </span>
                  </div>
                </div>

                <div className="p-1">
                  <button 
                    onClick={() => {
                      setNewAvatarUrl(userAvatar);
                      setShowAvatarModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition flex items-center gap-2.5 cursor-pointer rounded-xl"
                  >
                    <UserCircle size={15} className="text-[#714B67]" /> تعديل الصورة الشخصية
                  </button>
                </div>

                <div className="h-px bg-slate-100 my-1"></div>
                
                {isSuperAdmin && (
                  <>
                    <button 
                      onClick={() => { setActiveApp('settings'); setShowUserMenu(false); }}
                      className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition flex items-center gap-2.5 cursor-pointer rounded-xl"
                    >
                      <Layers size={15} className="text-[#714B67]" /> بوابة المشتركين (SaaS)
                    </button>
                    <button 
                      onClick={() => { setActiveApp('saas_admin'); setShowUserMenu(false); }}
                      className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition flex items-center gap-2.5 cursor-pointer rounded-xl"
                    >
                      <Shield size={15} className="text-[#714B67]" /> لوحة التحكم المركزية
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                  </>
                )}

                <button 
                  onClick={() => { setDebugMode(!debugMode); setShowUserMenu(false); }}
                  className="w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition flex items-center gap-2.5 cursor-pointer rounded-xl"
                >
                  <Settings size={15} className="text-slate-500" /> 
                  <span>وضع المطور التقني</span>
                  {debugMode && <span className="mr-auto w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>

                <div className="h-px bg-slate-100 my-1"></div>
                
                <button 
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full text-right px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2.5 cursor-pointer rounded-xl"
                >
                  <LogOut size={15} className="text-rose-500" /> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {debugMode && <OdooDebugMenu />}
      {/* حاوية العرض الصارمة المانعة للتداخل (Strict Single-View Canvas) */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* الحالة 1: شاشة مبدل التطبيقات والأيقونات فقط (Odoo App Launcher) */}
        {activeApp === 'switcher' && (
          <div className="flex-1 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex flex-col items-center overflow-y-auto w-full relative">
            
            {/* شريط البحث المباشر */}
            <div className="w-full max-w-md my-4 relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث فوري في التطبيقات الـ 11..." 
                className="w-full px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/50 text-center shadow-sm transition-shadow hover:shadow-md"
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            </div>

            {/* شبكة الأيقونات الـ 11 المتناسقة (Odoo Enterprise Design) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-6 gap-y-10 max-w-5xl mx-auto px-4 mt-8 justify-items-center">
              {filteredApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <button 
                    key={app.id} 
                    onClick={() => {
                      setActiveApp(app.id as AppId);
                      setSearchQuery('');
                    }}
                    className="flex flex-col items-center cursor-pointer group focus:outline-none w-[90px] sm:w-[100px]"
                  >
                    <div className={`relative w-[76px] h-[76px] sm:w-[86px] sm:h-[86px] ${app.color} rounded-2xl flex items-center justify-center shadow-md shadow-black/5 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 bg-gradient-to-br from-white/10 to-black/10 ring-1 ring-black/5`}>
                      <IconComponent className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-700 group-hover:text-slate-900 text-xs sm:text-[13px] text-center leading-tight tracking-wide">
                      {app.name}
                    </h3>
                  </button>
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

        {/* الحالة 2: الموظفون (Employees Directory & Contracts) */}
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
            <OdooPlanningApp />
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

        {/* الحالة 7: المعدات والعهد (Equipments & Custody) */}
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

        {/* الحالة المحورية: الماسح الضوئي الذكي (Scanner App) */}
        {activeApp === 'scanner' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <ScannerApp
              documents={documents}
              employees={employees as any}
              activeCompany={activeCompany}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
              onAutoAddEmpFromOCR={handleAutoAddEmpFromOCR}
              onNavigateToApp={(app) => setActiveApp(app)}
            />
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
                                    toast.success(`أنت الآن تتصفح بيانات شركة ${comp.nameAr}`);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm border border-transparent cursor-pointer ${
                                    isCurrentActive 
                                      ? 'bg-amber-500 text-slate-950 font-black' 
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  <span>{isCurrentActive ? '✓ الجلسة نشطة' : 'دخول كمسؤول'}</span>
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (confirm(`هل أنت متأكد من حذف شركة (${comp.nameAr}) نهائياً؟`)) {
                                      const deletePromise = deleteCompany(comp.id);
                                      toast.promise(deletePromise, {
                                        loading: 'جاري حذف الشركة...',
                                        success: `تم حذف الشركة بنجاح`,
                                        error: (err) => `فشل حذف الشركة: ${err.message}`
                                      });
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
              <div className="mt-8">
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

        {/* الحالة 13: السوبر أدمن */}
        {activeApp === 'saas_admin' && (
          <main className="flex-1 overflow-y-auto w-full">
            <SuperAdminDashboard />
          </main>
        )}
      </div>

      {/* نافذة تعديل الصورة الشخصية (Avatar Update Modal) */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 dir-rtl" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-[#714B67]" />
                تحديث الصورة الشخصية وصورة الحساب
              </h3>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center space-y-3">
                <img 
                  src={newAvatarUrl || userAvatar} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#714B67]/20 shadow-md"
                />
                <p className="text-xs text-slate-500">معاينة صورتك الشخصية في شريط النظام العلوي</p>
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-700 mb-1.5">اختر صورة من جهازك (Upload File)</label>
                <label className="border-2 border-dashed border-slate-300 hover:border-[#714B67] bg-slate-50 hover:bg-slate-100/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xs mb-2 border border-slate-200">
                    <Upload className="w-6 h-6 text-[#714B67]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">اختر صورة من جهازك</span>
                  <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (يتم الحفظ محلياً كـ Base64)</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64Str = reader.result as string;
                        setNewAvatarUrl(base64Str);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    if (newAvatarUrl.trim()) {
                      setUserAvatar(newAvatarUrl);
                      localStorage.setItem('aysed_user_avatar', newAvatarUrl);
                      toast.success('تم تحديث وحفظ الصورة الشخصية محلياً بنجاح');
                      setShowAvatarModal(false);
                    } else {
                      toast.error('يرجى اختيار صورة أولاً');
                    }
                  }}
                  className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  حفظ الصورة الجديدة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <OdooHierarchyProvider>
          <MainAppLayout />
        </OdooHierarchyProvider>
      </TenantProvider>
    </AuthProvider>
  );
}
