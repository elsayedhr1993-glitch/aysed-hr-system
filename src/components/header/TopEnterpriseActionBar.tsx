import React, { useState, useEffect, useRef, useMemo } from 'react';
import { parseFlexibleDate, checkDocumentExpiry } from '../../utils/dateUtils';
import { collectCompanyDocumentAlerts, type CompanyDocument } from '../../types/companyDocuments';
import { useTenant } from '../../context/TenantContext';
import { 
  Scan, ArrowRight, Clock, UserCircle, Layers, Shield, Key,
  Settings, Sparkles, Trash2, LogOut, ChevronDown, 
  Building2, Plus, Calculator, Bell, Search, CheckCircle2, 
  AlertTriangle, Maximize2, Minimize2, FileText, Users, 
  Calendar, Check, ArrowUpRight, X, Briefcase, Scale, BarChart3, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getFacilityMasterData, FacilityLicenseData, defaultFacilityData } from '../facility/FacilityLicensingWizardModal';
import { useLang } from '../../lib/i18n';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { GlobalStudioModeToggle } from '../studio/GlobalStudioModeToggle';

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
  onOpenCalculator: (tab?: 'eos' | 'leave' | 'wage') => void;
  onOpenCopilot?: () => void;
  onOpenSentinel?: () => void;
  onOpenLegalBot?: () => void;
  onOpenAnalystBot?: () => void;
  onOpenFacilityWizard?: () => void;
  onOpenCompanyLicenseArchive?: () => void;
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
  onOpenCompanyLicenseArchive,
  showUserMenu,
  setShowUserMenu,
  setShowAvatarModal,
  setDebugMode,
  debugMode,
  logout
}) => {
  const { isActualSuperAdmin, isTenantViewEnabled, setIsTenantViewEnabled } = useTenant();
  const { lang, setLang } = useLang();
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);

  const closeQuickMenu = () => setShowQuickActionsMenu(false);

  const runQuickMenuAction = (fn: () => void) => {
    closeQuickMenu();
    fn();
  };

  type QuickMenuItem = {
    key: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconClass: string;
    labelAr: string;
    labelEn: string;
    onClick: () => void;
  };

  const quickMenuItemClass =
    'w-full flex items-center gap-2.5 px-2.5 py-2 text-xs sm:text-sm text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-start';

  const odooColumnHeaderClass =
    'px-3 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-200 bg-[#f8f9fa] sticky top-0 z-[1]';

  /** العمود الأيمن (RTL): العمليات والسجلات */
  const operationsColumnItems = useMemo((): QuickMenuItem[] => {
    const facilityAction = () => {
      if (onOpenFacilityWizard) onOpenFacilityWizard();
      else if (onOpenCompanyLicenseArchive) onOpenCompanyLicenseArchive();
    };
    return [
      {
        key: 'new_employee',
        icon: Users,
        iconClass: 'text-[#714B67]',
        labelAr: 'موظف جديد',
        labelEn: 'New employee',
        onClick: () => onQuickAction('new_employee'),
      },
      {
        key: 'new_contract',
        icon: Briefcase,
        iconClass: 'text-teal-700',
        labelAr: 'عقد عمل',
        labelEn: 'Employment contract',
        onClick: () => onQuickAction('new_contract'),
      },
      {
        key: 'new_leave',
        icon: Calendar,
        iconClass: 'text-amber-600',
        labelAr: 'طلب إجازة',
        labelEn: 'Leave request',
        onClick: () => onQuickAction('new_leave'),
      },
      {
        key: 'facility_license',
        icon: Award,
        iconClass: 'text-[#714B67]',
        labelAr: 'ترخيص منشأة',
        labelEn: 'Facility license',
        onClick: facilityAction,
      },
    ];
  }, [onQuickAction, onOpenFacilityWizard, onOpenCompanyLicenseArchive]);

  /** العمود الأيسر (RTL): الحاسبات والأدوات */
  const toolsColumnItems = useMemo((): QuickMenuItem[] => {
    const items: QuickMenuItem[] = [
      {
        key: 'calc_eos',
        icon: Scale,
        iconClass: 'text-[#714B67]',
        labelAr: 'مكافأة نهاية الخدمة',
        labelEn: 'End of service (EOS)',
        onClick: () => onOpenCalculator('eos'),
      },
      {
        key: 'calc_leave',
        icon: Calculator,
        iconClass: 'text-amber-600',
        labelAr: 'تسييل الإجازات',
        labelEn: 'Leave encashment',
        onClick: () => onOpenCalculator('leave'),
      },
      {
        key: 'salary_certificate',
        icon: FileText,
        iconClass: 'text-blue-600',
        labelAr: 'استخراج شهادة راتب',
        labelEn: 'Salary certificate',
        onClick: () => onQuickAction('new_letter'),
      },
      {
        key: 'scanner',
        icon: Scan,
        iconClass: 'text-teal-600',
        labelAr: 'ماسح OCR',
        labelEn: 'OCR scanner',
        onClick: () => onQuickAction('scanner'),
      },
    ];
    if (onOpenCopilot) {
      items.push({
        key: 'copilot',
        icon: Sparkles,
        iconClass: 'text-violet-600',
        labelAr: 'مساعد Copilot',
        labelEn: 'Copilot assistant',
        onClick: () => onOpenCopilot(),
      });
    }
    return items;
  }, [onOpenCalculator, onQuickAction, onOpenCopilot]);

  const renderOdooMenuColumn = (titleAr: string, titleEn: string, items: QuickMenuItem[]) => (
    <div className="flex flex-col min-w-0 max-h-[min(17.5rem,55vh)]">
      <div className={odooColumnHeaderClass}>{lang === 'ar' ? titleAr : titleEn}</div>
      <div className="p-1.5 space-y-0.5 overflow-y-auto flex-1">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            onClick={() => runQuickMenuAction(item.onClick)}
            className={quickMenuItemClass}
          >
            <item.icon size={17} className={`shrink-0 ${item.iconClass}`} />
            <span className="truncate font-medium">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
          </button>
        ))}
      </div>
    </div>
  );
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [facilityData, setFacilityData] = useState<FacilityLicenseData>(defaultFacilityData);

  const isDevPreview = typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost'));

  useEffect(() => {
    const loadFacilityData = async () => {
      const companyId = activeCompany?.id || undefined;
      const data = await getFacilityMasterData(companyId);
      setFacilityData(data);
    };
    void loadFacilityData();
  }, [activeCompany?.id]);

  useEffect(() => {
    const handleFacilityUpdated = async () => {
      const companyId = activeCompany?.id || undefined;
      const data = await getFacilityMasterData(companyId);
      setFacilityData(data);
    };
    window.addEventListener('facility_data_updated', handleFacilityUpdated);
    return () => window.removeEventListener('facility_data_updated', handleFacilityUpdated);
  }, [activeCompany?.id]);

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

  // Compute Smart Alerts & Expiries (Civil IDs, Passports, Residencies - All expired + within 45 days)
  const expiringAlerts = useMemo(() => {
    const alerts: any[] = [];

    employees.forEach(emp => {
      const checkExpiry = (dateStr: any, label: string) => {
        if (!dateStr) return;
        const status = checkDocumentExpiry(dateStr, label);
        if (!status.hasDate) return;
        
        // التقاط الوثائق المنتهية دائماً أو التي تنتهي خلال 45 يوماً
        if (status.isExpired || status.isExpiringSoon) {
          alerts.push({
            employeeId: emp.id,
            employeeName: emp.fullNameAr || emp.nameAr || emp.name || 'موظف',
            type: label,
            date: status.rawDate,
            daysRemaining: status.daysRemaining,
            isExpired: status.isExpired,
            badgeText: status.badgeText,
          });
        }
      };

      const civilExp = emp.civilIdExpiry || (emp as any).civilIdExpiryDate || (emp as any).civil_id_expiry || (emp as any).raw_payload?.civilIdExpiry || (emp as any).raw_payload?.civilIdExpiryDate;
      const passExp = emp.passportExpiry || (emp as any).passportExpiryDate || (emp as any).raw_payload?.passportExpiry;
      const resExp = emp.residencyExpiry || (emp as any).residencyExpiryDate || (emp as any).raw_payload?.residencyExpiry;
      const mohExp = emp.mohLicenseExpiry || (emp as any).mohLicenseExpiryDate || (emp as any).raw_payload?.mohLicenseExpiry;

      checkExpiry(civilExp, 'البطاقة المدنية');
      checkExpiry(passExp, 'جواز السفر');
      checkExpiry(resExp, 'الإقامة');
      checkExpiry(mohExp, 'ترخيص مزاولة المهنة (MOH)');
    });

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [employees]);

  const companyLicenseAlerts = useMemo(
    () => collectCompanyDocumentAlerts(documents as CompanyDocument[], activeCompany?.id),
    [documents, activeCompany?.id]
  );

  const facilityLicenseAlert = useMemo(() => {
    if (companyLicenseAlerts.length > 0) return null;
    if (facilityExpiryStatus.minDays >= 999 || !facilityExpiryStatus.nearestLabel) return null;
    if (facilityExpiryStatus.minDays > 90) return null;

    return {
      type: facilityExpiryStatus.nearestLabel,
      daysRemaining: facilityExpiryStatus.minDays,
      isExpired: facilityExpiryStatus.minDays < 0,
    };
  }, [facilityExpiryStatus, companyLicenseAlerts.length]);

  const totalAlertsCount =
    expiringAlerts.length + companyLicenseAlerts.length + (facilityLicenseAlert ? 1 : 0);

  const handlePasswordResetRequest = async () => {
    const userEmail = (user?.email || '').toString().trim();
    if (!userEmail) {
      toast.error('تعذر تحديد بريد المستخدم لإرسال رابط تغيير كلمة المرور.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, userEmail);
      toast.success(`تم إرسال رابط تغيير كلمة المرور إلى ${userEmail}`);
    } catch (err: any) {
      toast.error(err?.message || 'فشل إرسال رابط تغيير كلمة المرور.');
    }
  };

  return (
    <header className="h-12 bg-[#714B67] text-white flex items-center justify-between px-2 sm:px-3 md:px-4 z-40 select-none shadow-md shrink-0 border-b border-white/10 w-full relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🧭 الجانب الأيمن: التنقل وهوية المنشأة */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* زر العودة للرئيسية عند التواجد داخل تطبيق فرعي */}
        {activeApp !== 'switcher' && activeApp !== 'saas_admin' && (
          <button 
            onClick={() => setActiveApp('switcher')} 
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg text-xs font-black transition cursor-pointer border border-white/20 shrink-0 shadow-xs"
            title="العودة لشاشة التطبيقات الرئيسية"
          >
            <ArrowRight size={14} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>
        )}

        {activeApp !== 'switcher' && (
          <button
            onClick={() => setActiveApp('switcher')}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shrink-0 border bg-white/10 hover:bg-white/20 text-white/90 border-white/15"
            title="لوحة التطبيقات"
          >
            <span className="text-sm font-black select-none">▦</span>
            <span className="hidden sm:inline">{lang === 'ar' ? 'التطبيقات' : 'Apps'}</span>
          </button>
        )}

        {/* زر لوحة الإدارة العليا (Super Admin Dashboard) */}
        <GlobalStudioModeToggle />

        {(isSuperAdmin) && (
          <button 
            onClick={() => setActiveApp('saas_admin')} 
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer border shrink-0 ${
              activeApp === 'saas_admin'
                ? 'bg-purple-800 text-amber-300 border-amber-400/50 ring-2 ring-amber-300/30 shadow-inner'
                : 'bg-purple-950/60 hover:bg-purple-900 text-purple-100 border-purple-500/30'
            }`}
            title="لوحة الإدارة العليا والتحكم في النظام"
          >
            <Shield size={13} className="text-amber-400 shrink-0" />
            <span className="hidden md:inline">{lang === 'ar' ? 'الإدارة العليا' : 'Super Admin'}</span>
          </button>
        )}

        {/* 🏢 مبدل المنشآت السريع — Super Admin only (tenant company is bound to profile) */}
        {isSuperAdmin && (
          <div className="relative shrink-0" ref={companyMenuRef}>
            <button
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center gap-1 bg-black/20 hover:bg-black/30 border border-white/15 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer max-w-[120px] sm:max-w-[150px] md:max-w-[180px]"
              title="تبديل المنشأة أو الفرع"
            >
              <Building2 size={14} className="text-amber-300 shrink-0" />
              <span className="truncate font-black text-white text-[11px] sm:text-[12px]">
                {activeCompany?.nameAr || 'اختر منشأة'}
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
        )}

        {/* عنوان الشاشة الحالية - معروض فقط على الشاشات العريضة جداً لتوفير المساحة */}
        <div className="hidden 2xl:flex items-center gap-2 text-white/90 text-xs font-bold border-r border-white/20 pr-2.5 mr-1">
          <span className="text-white/70 font-normal">{lang === 'ar' ? 'المسار:' : 'Path:'}</span>
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
            <span className="text-[11px] truncate font-medium hidden lg:inline">{lang === 'ar' ? 'بحث في الموظفين، العقود، أو التطبيقات...' : 'Search employees, contracts, or apps...'}</span>
            <span className="text-[11px] truncate font-medium lg:hidden">{lang === 'ar' ? 'بحث سريع...' : 'Quick search...'}</span>
          </div>
          <div className="hidden md:flex items-center gap-0.5 text-[9px] font-mono bg-white/20 px-1 py-0.2 rounded text-white/90 border border-white/10 shrink-0">
            Ctrl+K
          </div>
        </button>
      </div>

      {/* ⚡ الجانب الأيسر: الوظائف السريعة، الحاسبة، الإشعارات، والملف الشخصي */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

        {/* 🌐 محول لغة صريح العربية / English */}
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="hidden sm:flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/15 px-2 py-1 rounded-lg text-[11px] font-black transition cursor-pointer shrink-0"
          title="تبديل اللغة بين العربية والإنجليزية"
        >
          <span className="font-mono">{lang === 'ar' ? 'AR' : 'EN'}</span>
          <span className="hidden lg:inline">{lang === 'ar' ? 'العربية' : 'English'}</span>
        </button>

        <div className="relative shrink-0" ref={quickActionsMenuRef}>
          <button
            onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 sm:px-2.5 py-1 rounded-lg text-xs transition cursor-pointer shadow-xs border border-emerald-500/50"
            title="إجراءات سريعة وحاسبات HR"
          >
            <Plus size={14} />
            <span className="hidden md:inline">{lang === 'ar' ? '+ إجراء' : '+ Action'}</span>
          </button>

          {showQuickActionsMenu && (
            <div
              className="absolute top-full end-0 mt-1 w-[min(460px,94vw)] sm:w-[480px] bg-white rounded-md shadow-[0_6px_28px_rgba(15,23,42,0.14)] border border-slate-200 overflow-hidden z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150"
              role="menu"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                {renderOdooMenuColumn('العمليات والسجلات', 'Operations & records', operationsColumnItems)}
                {renderOdooMenuColumn('الحاسبات والأدوات', 'Calculators & tools', toolsColumnItems)}
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
                {companyLicenseAlerts.map((lic) => (
                  <div
                    key={lic.id}
                    onClick={() => {
                      setShowAlertsMenu(false);
                      if (onOpenCompanyLicenseArchive) onOpenCompanyLicenseArchive();
                    }}
                    className="p-2.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-2.5 rounded-xl"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        lic.isExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <Award size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-800 truncate">ترخيص منشأة: {lic.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                            lic.isExpired ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lic.isExpired ? 'منتهي' : `${lic.daysRemaining} يوم`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ينتهي: <strong className="font-mono text-slate-700">{lic.expiryDate}</strong>
                      </p>
                    </div>
                  </div>
                ))}

                {facilityLicenseAlert && (
                  <div
                    onClick={() => {
                      setShowAlertsMenu(false);
                      if (onOpenFacilityWizard) onOpenFacilityWizard();
                    }}
                    className="p-2.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-2.5 rounded-xl"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      facilityLicenseAlert.isExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Award size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-800 truncate">تنبيه تراخيص المنشأة (معالج)</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                          facilityLicenseAlert.isExpired ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {facilityLicenseAlert.isExpired ? 'منتهي' : `${facilityLicenseAlert.daysRemaining} يوم متبقي`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        أقرب ترخيص على الانتهاء: <strong className="text-slate-700">{facilityLicenseAlert.type}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {expiringAlerts.length === 0 && companyLicenseAlerts.length === 0 && !facilityLicenseAlert ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
                    <p className="font-bold text-slate-700">لا توجد مستندات منتهية أو تشرف على الانتهاء</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">تراخيص المنشأة وبطاقات الموظفين وتراخيص MOH سارية</p>
                  </div>
                ) : expiringAlerts.length > 0 ? (
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
                ) : null}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center flex flex-col gap-1">
                {onOpenCompanyLicenseArchive && (
                  <button
                    onClick={() => {
                      setShowAlertsMenu(false);
                      onOpenCompanyLicenseArchive();
                    }}
                    className="text-xs font-bold text-[#714B67] hover:underline cursor-pointer"
                  >
                    أرشيف تراخيص المنشأة
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAlertsMenu(false);
                    setActiveApp('employees');
                  }}
                  className="text-xs font-bold text-slate-600 hover:underline cursor-pointer"
                >
                  شؤون الموظفين والسجلات
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

                <button
                  onClick={async () => {
                    await handlePasswordResetRequest();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 hover:text-[#714B67] transition flex items-center justify-between cursor-pointer rounded-xl group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition">
                      <Key size={15} />
                    </div>
                    <span>تغيير كلمة المرور</span>
                  </div>
                  <span className="text-[10px] text-slate-400">رابط آمن</span>
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

              {isActualSuperAdmin && (
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
              )}
              <div className="p-1.5 space-y-1">
                {isActualSuperAdmin && (
                  <button 
                    onClick={() => { 
                      setIsTenantViewEnabled(!isTenantViewEnabled);
                      setShowUserMenu(false);
                      toast.success(
                        !isTenantViewEnabled 
                          ? '🔔 تم الانتقال لوضع تجربة المشترك (Tenant View) وحجب شاشات السوبر أدمن!' 
                          : '🔔 تم العودة لوضع السوبر أدمن (SaaS Super Admin) بنجاح!'
                      );
                      setActiveApp('switcher');
                    }}
                    className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 transition flex items-center justify-between cursor-pointer rounded-xl group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-100 transition">
                        <Users size={14} />
                      </div>
                      <div>
                        <span className="block font-bold">وضع تجربة المشترك</span>
                        <span className="block text-[9px] text-slate-400 font-normal">إخفاء أدوات السوبر أدمن للتقييم</span>
                      </div>
                    </div>
                    <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition ${isTenantViewEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></div>
                    </div>
                  </button>
                )}
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
