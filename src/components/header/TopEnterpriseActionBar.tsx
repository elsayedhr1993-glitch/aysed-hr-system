import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Scan, ArrowRight, Clock, UserCircle, Layers, Shield, 
  Settings, Sparkles, Trash2, LogOut, ChevronDown, 
  Building2, Plus, Calculator, Bell, Search, CheckCircle2, 
  AlertTriangle, Maximize2, Minimize2, FileText, Users, 
  Calendar, Check, ArrowUpRight, X, Briefcase, Scale, BarChart3, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getFacilityMasterData, FacilityLicenseData } from '../facility/FacilityLicensingWizardModal';

interface TopEnterpriseActionBarProps {
  activeApp: string;
  setActiveApp: (app: any) => void;
  getActiveAppTitle: () => string;
  kuwaitTime: string;
  user: any;
  userAvatar: string;
  setUserAvatar: (url: string) => void;
  isSuperAdmin: boolean;
  activeCompany: any;
  companies: any[];
  impersonatingCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
  onAddNewCompany: () => void;
  employees: any[];
  documents: any[];
  onQuickAction: (action: string, payload?: any) => void;
  onOpenSpotlight: () => void;
  onOpenCalculator: () => void;
  onOpenCopilot?: () => void;
  onOpenSentinel?: () => void;
  onOpenLegalBot?: () => void;
  onOpenAnalystBot?: () => void;
  onOpenFacilityWizard?: () => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  setShowAvatarModal: (show: boolean) => void;
  setDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
  debugMode: boolean;
  logout: () => void;
}

export const TopEnterpriseActionBar: React.FC<TopEnterpriseActionBarProps> = ({
  activeApp,
  setActiveApp,
  getActiveAppTitle,
  kuwaitTime,
  user,
  userAvatar,
  isSuperAdmin,
  activeCompany,
  companies = [],
  impersonatingCompanyId,
  onSelectCompany,
  onAddNewCompany,
  employees = [],
  documents = [],
  onQuickAction,
  onOpenSpotlight,
  onOpenCalculator,
  onOpenCopilot,
  onOpenSentinel,
  onOpenLegalBot,
  onOpenAnalystBot,
  onOpenFacilityWizard,
  showUserMenu,
  setShowUserMenu,
  setShowAvatarModal,
  setDebugMode,
  debugMode,
  logout
}) => {
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [facilityData, setFacilityData] = useState<FacilityLicenseData>(() => getFacilityMasterData());

  useEffect(() => {
    const handleFacilityUpdated = () => {
      setFacilityData(getFacilityMasterData());
    };
    window.addEventListener('facility_data_updated', handleFacilityUpdated);
    return () => window.removeEventListener('facility_data_updated', handleFacilityUpdated);
  }, []);

  const facilityExpiryStatus = useMemo(() => {
    const now = new Date();
    const expiries = [
      { label: 'ترخيص الصحة MOH', date: facilityData.mohExpiryDate },
      { label: 'ترخيص الإطفاء KFF', date: facilityData.kffExpiryDate },
      { label: 'ترخيص البلدية', date: facilityData.baladiyaExpiryDate }
    ].filter(item => Boolean(item.date));

    let minDays = 999;
    let nearestLabel = '';

    expiries.forEach(exp => {
      const d = new Date(exp.date);
      if (!isNaN(d.getTime())) {
        const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < minDays) {
          minDays = diffDays;
          nearestLabel = exp.label;
        }
      }
    });

    return { minDays, nearestLabel };
  }, [facilityData]);

  const companyMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsMenuRef = useRef<HTMLDivElement>(null);
  const alertsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (companyMenuRef.current && !companyMenuRef.current.contains(target)) {
        setShowCompanyMenu(false);
      }
      if (quickActionsMenuRef.current && !quickActionsMenuRef.current.contains(target)) {
        setShowQuickActionsMenu(false);
      }
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(target)) {
        setShowAlertsMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCompanyMenu(false);
        setShowQuickActionsMenu(false);
        setShowAlertsMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowUserMenu]);

  // Handle Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Monitor fullscreen change events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Compute Smart Alerts & Expiries (Civil IDs, Passports, Residencies within 45 days)
  const expiringAlerts = useMemo(() => {
    const now = new Date();
    const alerts: any[] = [];

    employees.forEach(emp => {
      const checkExpiry = (dateStr: string | undefined, label: string) => {
        if (!dateStr) return;
        const exp = new Date(dateStr);
        if (isNaN(exp.getTime())) return;
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 45 && diffDays >= -30) {
          alerts.push({
            employeeId: emp.id,
            employeeName: emp.fullNameAr || emp.nameAr || emp.name || 'موظف',
            type: label,
            date: dateStr,
            daysRemaining: diffDays,
            isExpired: diffDays < 0
          });
        }
      };

      checkExpiry(emp.civilIdExpiry || emp.civilIdExpiryDate, 'البطاقة المدنية');
      checkExpiry(emp.passportExpiry || emp.passportExpiryDate, 'جواز السفر');
      checkExpiry(emp.residencyExpiry || emp.residencyExpiryDate, 'الإقامة');
      checkExpiry(emp.mohLicenseExpiry || emp.mohLicenseExpiryDate, 'ترخيص مزاولة المهنة (MOH)');
    });

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [employees]);

  const totalAlertsCount = expiringAlerts.length;

  return (
    <header className="h-12 bg-[#714B67] text-white flex items-center justify-between px-2 sm:px-3 md:px-4 z-40 select-none shadow-md shrink-0 border-b border-white/10 dir-rtl w-full relative" dir="rtl">
      
      {/* 🧭 الجانب الأيمن: التنقل وهوية المنشأة */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* زر العودة للرئيسية عند التواجد داخل تطبيق */}
        {activeApp !== 'switcher' && (
          <button 
            onClick={() => setActiveApp('switcher')} 
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2 py-1 rounded-lg text-xs font-black transition cursor-pointer border border-white/10 shrink-0"
            title="العودة لشاشة التطبيقات الرئيسية"
          >
            <ArrowRight size={14} />
            <span className="hidden sm:inline">الرئيسية</span>
          </button>
        )}

        {/* زر مبدل التطبيقات الرئيسي ▦ */}
        <button 
          onClick={() => setActiveApp('switcher')} 
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer shrink-0 ${
            activeApp === 'switcher' 
              ? 'bg-white/30 text-white ring-2 ring-white/40 shadow-inner' 
              : 'hover:bg-white/20 text-white/90 hover:text-white'
          }`}
          title="شبكة التطبيقات الـ 16 (App Launcher)"
        >
          <span className="text-lg font-black leading-none select-none">▦</span>
        </button>

        {/* زر الماسح الضوئي الذكي OCR */}
        <button 
          onClick={() => setActiveApp('scanner')} 
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shadow-xs border shrink-0 ${
            activeApp === 'scanner' 
              ? 'bg-teal-700 text-white border-white/40 ring-2 ring-white/30' 
              : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-500/50'
          }`}
          title="الماسح الضوئي الذكي للبطاقات المدنية والجوازات (OCR)"
        >
          <Scan size={14} />
          <span className="hidden xl:inline">الماسح الضوئي</span>
        </button>

        {/* 🏢 مبدل المنشآت السريع (Quick Company Switcher Popover) */}
        <div className="relative shrink-0" ref={companyMenuRef}>
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="flex items-center gap-1 bg-black/20 hover:bg-black/30 border border-white/15 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer max-w-[120px] sm:max-w-[150px] md:max-w-[180px]"
            title="تبديل المنشأة أو الفرع"
          >
            <Building2 size={14} className="text-amber-300 shrink-0" />
            <span className="truncate font-black text-white text-[11px] sm:text-[12px]">
              {activeCompany?.nameAr || 'النظام المركزي'}
            </span>
            <ChevronDown size={13} className="text-white/70 shrink-0 transition-transform duration-200" />
          </button>

          {/* قائمة الشركات المنسدلة */}
          {showCompanyMenu && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden py-1.5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-slate-800 block">المنشآت والشركات المرخصة</span>
                  <span className="text-[10px] text-slate-500">اختر منشأة للتبديل الفوري دون تسجيل خروج</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-[#714B67] font-bold px-2 py-0.5 rounded-full font-mono">
                  {companies.length} شركات
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-100">
                {companies.map(comp => {
                  const isActive = activeCompany?.id === comp.id || impersonatingCompanyId === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        onSelectCompany(comp.id);
                        setShowCompanyMenu(false);
                      }}
                      className={`w-full text-right p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                        isActive ? 'bg-purple-50 text-[#714B67] font-black' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isActive ? 'bg-[#714B67] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {comp.nameAr?.charAt(0) || 'ش'}
                        </div>
                        <div className="truncate">
                          <p className="text-xs truncate font-bold">{comp.nameAr}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">PAM: {comp.pamFileNumber || '---'}</p>
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                          <Check size={12} /> نشطة
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isSuperAdmin && (
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => {
                      setShowCompanyMenu(false);
                      onAddNewCompany();
                    }}
                    className="w-full bg-[#714B67] hover:bg-[#5a3a52] text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    <span>+ إضافة منشأة ومشترك جديد</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* عنوان الشاشة الحالية - معروض فقط على الشاشات العريضة جداً لتوفير المساحة */}
        <div className="hidden 2xl:flex items-center gap-2 text-white/90 text-xs font-bold border-r border-white/20 pr-2.5 mr-1">
          <span className="text-white/70 font-normal">المسار:</span>
          <span className="text-white font-black truncate max-w-[200px]">{getActiveAppTitle()}</span>
        </div>

      </div>

      {/* 🔍 المنتصف: شريط البحث الشامل Spotlight Search */}
      <div className="flex-1 min-w-[100px] max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-xs mx-1.5 sm:mx-2">
        <button
          onClick={onOpenSpotlight}
          className="w-full bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/35 rounded-lg px-2.5 py-1 flex items-center justify-between text-white/80 hover:text-white transition shadow-xs cursor-pointer group"
          title="البحث الشامل في النظام (Ctrl + K)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search size={13} className="text-white/70 group-hover:text-white shrink-0" />
            <span className="text-[11px] truncate font-medium hidden lg:inline">بحث في الموظفين، العقود، أو التطبيقات...</span>
            <span className="text-[11px] truncate font-medium lg:hidden">بحث سريع...</span>
          </div>
          <div className="hidden md:flex items-center gap-0.5 text-[9px] font-mono bg-white/20 px-1 py-0.2 rounded text-white/90 border border-white/10 shrink-0">
            Ctrl+K
          </div>
        </button>
      </div>

      {/* ⚡ الجانب الأيسر: الوظائف السريعة، الحاسبة، الإشعارات، والملف الشخصي */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

        {/* ⚡ زر الإجراءات السريعة المنبثقة (+ إجراء سريع) */}
        <div className="relative shrink-0" ref={quickActionsMenuRef}>
          <button
            onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 sm:px-2.5 py-1 rounded-lg text-xs transition cursor-pointer shadow-xs border border-emerald-500/50"
            title="قائمة الإجراءات السريعة الفورية"
          >
            <Plus size={14} />
            <span className="hidden xl:inline">إجراء سريع</span>
          </button>

          {showQuickActionsMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden py-1.5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="font-black text-xs text-slate-800">إجراءات وإدخالات فورية</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  بنقرة واحدة
                </span>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowQuickActionsMenu(false);
                    onQuickAction('new_employee');
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#714B67] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <Users size={16} className="text-[#714B67]" />
                  <div>
                    <span className="block font-bold">تسجيل وتعيين موظف جديد</span>
                    <span className="block text-[10px] text-slate-400 font-normal">إضافة بطاقة موظف جديدة بالمنشأة</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActionsMenu(false);
                    onQuickAction('new_contract');
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#714B67] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText size={16} className="text-teal-600" />
                  <div>
                    <span className="block font-bold">إصدار أو تجديد عقد عمل</span>
                    <span className="block text-[10px] text-slate-400 font-normal">عقود القوى العاملة والقطاع الأهلي</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActionsMenu(false);
                    onQuickAction('new_leave');
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#714B67] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <Calendar size={16} className="text-amber-600" />
                  <div>
                    <span className="block font-bold">تقديم طلب إجازة سريع</span>
                    <span className="block text-[10px] text-slate-400 font-normal">تسجيل إجازة سنوية أو مرضية فورية</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActionsMenu(false);
                    onQuickAction('new_letter');
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#714B67] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText size={16} className="text-blue-600" />
                  <div>
                    <span className="block font-bold">استخراج شهادة راتب / خطاب</span>
                    <span className="block text-[10px] text-slate-400 font-normal">توليد كتب لمن يهمه الأمر والسفارات</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActionsMenu(false);
                    onQuickAction('attendance_movement');
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#714B67] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <Clock size={16} className="text-indigo-600" />
                  <div>
                    <span className="block font-bold">تسجيل استئذان / حركة دوام</span>
                    <span className="block text-[10px] text-slate-400 font-normal">عذر طبي أو خروج مؤقت</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActionsMenu(false);
                    if (onOpenFacilityWizard) onOpenFacilityWizard();
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-[#714B67] hover:bg-purple-50 rounded-xl transition flex items-center gap-2.5 cursor-pointer bg-purple-50/50 border border-purple-100"
                >
                  <Award size={16} className="text-[#714B67]" />
                  <div>
                    <span className="block font-bold">تثبيت وتهيئة تراخيص المنشأة</span>
                    <span className="block text-[10px] text-purple-600 font-normal">تثبيت السجل التجاري، MOH، الإطفاء والبلدية</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActionsMenu(false);
                    onQuickAction('scanner');
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#714B67] rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                >
                  <Scan size={16} className="text-teal-600" />
                  <div>
                    <span className="block font-bold">مسح مستند ذكي (OCR)</span>
                    <span className="block text-[10px] text-slate-400 font-normal">استخراج البيانات التلقائي من الكاميرا</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🏢 شارة تراخيص المنشأة والعد التنازلي (Facility License Countdown Badge) */}
        <button
          onClick={() => {
            if (onOpenFacilityWizard) onOpenFacilityWizard();
          }}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer border shadow-xs shrink-0 ${
            facilityExpiryStatus.minDays <= 30
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 animate-pulse'
              : facilityExpiryStatus.minDays <= 90
              ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-400'
              : 'bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 border-emerald-600/60'
          }`}
          title="معالج ورادار تراخيص المنشأة (Facility Licensing Countdown)"
        >
          <Award size={14} className="text-amber-300 shrink-0" />
          <span className="hidden lg:inline text-[11px]">تراخيص المنشأة:</span>
          <span className="font-mono text-[11px] font-black">
            {facilityExpiryStatus.minDays < 999 ? `${facilityExpiryStatus.minDays} يوم` : 'سارية'}
          </span>
        </button>

        {/* 🧮 حاسبة قانون العمل ونهاية الخدمة السريعة */}
        <button
          onClick={onOpenCalculator}
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center transition cursor-pointer text-white shrink-0 hidden sm:flex"
          title="حاسبة قانون العمل الكويتي ومكافأة نهاية الخدمة السريعة"
        >
          <Calculator size={15} />
        </button>

        {/* 🛡️ الحارس الذكي للامتثال */}
        <button
          onClick={onOpenSentinel}
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center transition cursor-pointer text-white shrink-0 relative"
          title="الحارس الذكي للامتثال الرقابي (Compliance Sentinel)"
        >
          <Shield size={15} className="text-amber-400" />
        </button>

        {/* ⚖️ المستشار القانوني وقارئ العقود */}
        <button
          onClick={onOpenLegalBot}
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center transition cursor-pointer text-white shrink-0 group relative"
          title="المستشار القانوني وقارئ العقود (Legal & Document OCR Bot)"
        >
          <Scale size={15} className="text-blue-300 group-hover:scale-110 transition-transform" />
        </button>

        {/* 📊 محلل البيانات واستراتيجي الرواتب */}
        <button
          onClick={onOpenAnalystBot}
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center transition cursor-pointer text-white shrink-0 group relative"
          title="محلل البيانات واستراتيجي الرواتب (Data & Payroll Analyst Bot)"
        >
          <BarChart3 size={15} className="text-emerald-300 group-hover:scale-110 transition-transform" />
        </button>

        {/* ✨ المساعد الذكي */}
        <button
          onClick={onOpenCopilot}
          className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center transition cursor-pointer text-white shrink-0 group"
          title="مساعد الذكاء الاصطناعي (AI Copilot)"
        >
          <Sparkles size={15} className="text-amber-300 group-hover:animate-pulse" />
        </button>

        {/* ⚙️ زر إعدادات المنظومة وبيانات المنشأة */}
        <button
          onClick={() => setActiveApp(activeApp === 'settings' ? 'switcher' : 'settings')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer shrink-0 ${
            activeApp === 'settings'
              ? 'bg-white text-[#714B67] shadow-sm font-bold ring-2 ring-white/40'
              : 'bg-white/15 hover:bg-white/25 border border-white/15 text-white'
          }`}
          title="إعدادات المنظومة وبيانات المنشأة (Settings)"
        >
          <Settings size={15} className={activeApp === 'settings' ? 'animate-spin-slow' : ''} />
        </button>

        {/* 🔔 مركز التنبيهات الذكية والاستحقاقات */}
        <div className="relative shrink-0" ref={alertsMenuRef}>
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center transition cursor-pointer text-white relative shrink-0"
            title="مركز الإشعارات والتنبيهات الذكية"
          >
            <Bell size={15} />
          </button>

          {showAlertsMenu && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden py-1 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#714B67]" />
                  <span className="font-black text-xs text-slate-800">مركز التنبيهات والامتثال</span>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                  {totalAlertsCount} تنبيه عاجل
                </span>
              </div>

              {/* Status banner */}
              <div className="p-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  المزامنة السحابية نشطة (Live Cloud Sync)
                </span>
                <span className="font-mono text-[10px] text-emerald-700">Online</span>
              </div>

              {/* Expiry alerts list */}
              <div className="max-h-64 overflow-y-auto p-1 divide-y divide-slate-100">
                {expiringAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
                    <p className="font-bold text-slate-700">لا توجد مستندات منتهية أو تشرف على الانتهاء</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">جميع البطاقات المدنية والإقامات وتراخيص MOH سارية</p>
                  </div>
                ) : (
                  expiringAlerts.map((alert, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setShowAlertsMenu(false);
                        setActiveApp('employees');
                      }}
                      className="p-2.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-2.5 rounded-xl"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.isExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <AlertTriangle size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-800 truncate">{alert.employeeName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                            alert.isExpired ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {alert.isExpired ? 'منتهي' : `${alert.daysRemaining} يوم متبقي`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          انتهاء {alert.type} بتاريخ: <strong className="font-mono text-slate-700">{alert.date}</strong>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    setShowAlertsMenu(false);
                    setActiveApp('employees');
                  }}
                  className="text-xs font-bold text-[#714B67] hover:underline cursor-pointer"
                >
                  فتح شؤون الموظفين ومراجعة السجلات الكاملة
                </button>
              </div>
            </div>
          )}
        </div>

        {/* زر وضع ملء الشاشة ⛶ */}
        <button
          onClick={handleToggleFullscreen}
          className="hidden sm:flex w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 items-center justify-center transition cursor-pointer text-white shrink-0"
          title={isFullscreen ? 'إنهاء وضع ملء الشاشة' : 'وضع ملء الشاشة (Full-Screen)'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {/* توقيت الكويت اللحظي */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-white/90 bg-white/10 rounded-lg border border-white/10 shrink-0">
          <Clock size={12} className="text-white/70" />
          <span>{kuwaitTime}</span>
        </div>

        {/* 👤 الملف الشخصي وقائمة المستخدم (User Profile Menu) */}
        <div className="relative shrink-0" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1 hover:bg-white/15 px-1 sm:px-1.5 py-0.5 rounded-lg transition cursor-pointer border border-transparent hover:border-white/15 shrink-0"
            title="الملف الشخصي وإعدادات الحساب"
          >
            <div className="relative shrink-0">
              <img 
                src={userAvatar} 
                alt="Admin Avatar" 
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full object-cover border-2 border-white/90 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-[#714B67]" title="متصل الآن بالسحابة"></span>
            </div>
            <div className="text-right hidden xl:block shrink-0">
              <span className="block text-[11px] font-black text-white truncate max-w-[80px]">
                {isSuperAdmin ? 'السيد' : 'المسؤول'}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <>
              {/* Backdrop overlay for click outside */}
              <div 
                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
                onClick={() => setShowUserMenu(false)}
              ></div>

              <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 w-80 max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 py-1 z-[150] animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 dir-rtl">
              {/* بطاقة معلومات الحساب */}
              <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-br from-purple-50/80 via-slate-50 to-white flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    src={userAvatar} 
                    alt="User Avatar" 
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#714B67] shadow-sm shrink-0"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="نشط الآن"></span>
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {isSuperAdmin ? 'السيد (المدير العام)' : 'حساب المسؤول'}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email || 'elsayedhr1993@gmail.com'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center text-[9px] bg-purple-100 text-[#714B67] font-bold px-2 py-0.5 rounded-md">
                      {isSuperAdmin ? 'مدير النظام (Super Admin)' : 'مدير الموارد البشرية'}
                    </span>
                  </div>
                </div>
              </div>

              {/* قسم الملف الشخصي */}
              <div className="p-1.5">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الملف الشخصي والحساب</p>
                
                <button 
                  onClick={() => {
                    setShowAvatarModal(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 hover:text-[#714B67] transition flex items-center justify-between cursor-pointer rounded-xl group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#714B67] flex items-center justify-center group-hover:bg-purple-100 transition">
                      <UserCircle size={15} />
                    </div>
                    <span>تعديل الصورة الشخصية</span>
                  </div>
                  <span className="text-[10px] text-slate-400">تغيير</span>
                </button>
              </div>

              {/* قسم الإدارة المركزية للـ Super Admin */}
              {isSuperAdmin && (
                <>
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <div className="p-1.5">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">الإدارة المركزية (SaaS)</p>

                    <button 
                      onClick={() => { 
                        setActiveApp('saas_admin'); 
                        setShowUserMenu(false); 
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 hover:text-[#714B67] transition flex items-center justify-between cursor-pointer rounded-xl group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition">
                          <Shield size={15} />
                        </div>
                        <span>لوحة التحكم المركزية والشركات</span>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">SaaS</span>
                    </button>

                    <button 
                      onClick={() => { 
                        setActiveApp('audit'); 
                        setShowUserMenu(false); 
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 hover:text-[#714B67] transition flex items-center justify-between cursor-pointer rounded-xl group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition">
                          <Layers size={15} />
                        </div>
                        <span>سجل الرقابة وتتبع العمليات</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Audit</span>
                    </button>
                  </div>
                </>
              )}

              {/* خيارات المطور والتشخيص التقني */}
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              <div className="p-1.5">
                <button 
                  onClick={() => { 
                    setDebugMode(!debugMode); 
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 transition flex items-center justify-between cursor-pointer rounded-xl group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition">
                      <Sparkles size={14} />
                    </div>
                    <span>وضع المطور والتشخيص</span>
                  </div>
                  <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition ${debugMode ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}>
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></div>
                  </div>
                </button>
              </div>

              {/* تسجيل الخروج */}
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="p-1.5">
                <button 
                  onClick={() => { 
                    logout(); 
                    setShowUserMenu(false); 
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition flex items-center gap-2.5 cursor-pointer rounded-xl"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <LogOut size={15} />
                  </div>
                  <span>تسجيل الخروج الآمن</span>
                </button>
              </div>
            </div>
          </>
        )}
        </div>

      </div>

    </header>
  );
};

export default TopEnterpriseActionBar;
