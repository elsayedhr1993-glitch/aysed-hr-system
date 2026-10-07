import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, FileSignature, Calendar, Clock, 
  Banknote, Scale, FolderKanban, Zap, Building2, Sparkles, Scan,
  Briefcase, FileText, ShieldCheck, ArrowUpRight, BarChart3, Search,
  Layers, LayoutGrid
} from 'lucide-react';
import { ActiveApp, Company } from '../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLang } from '../lib/i18n';
import { useEffectiveTenantCompanyId } from '../hooks/useEffectiveTenantCompanyId';
import { isQueryableTenantCompanyId } from '../utils/tenantCompanyId';
import { useAuth } from '../context/AuthContext';
import {
  CompanySetupOnboardingBanner,
  type CompanySetupStepAction,
} from './onboarding/CompanySetupOnboardingBanner';
import { useRegisterReorderGroup, useUiStudio } from '../context/UiStudioContext';
import { UiStudioTarget } from './studio/UiStudioTarget';
import { pickUiLabel, sortByUiOrder } from '../utils/uiOverrideUtils';

interface OdooAppLauncherProps {
  onSelectApp: (app: ActiveApp) => void;
  onOpenCompanyDocuments?: () => void;
  onOpenComplianceTree?: () => void;
  onCompanySetupAction?: (action: CompanySetupStepAction) => void;
  currentUserEmail?: string;
  currentUserRole?: string;
  activeCompany?: Company;
  stats: {
    employeesCount: number;
    candidatesCount: number;
    contractsCount: number;
    leavesPendingCount: number;
    documentsCount: number;
    automationsCount: number;
    custodiesCount?: number;
    templatesCount?: number;
    auditLogsCount?: number;
    shiftsCount?: number;
    totalSalariesThisMonth?: number;
    onLeaveToday?: number;
    absenceRate?: number;
    lateArrivalsCount?: number;
    saturdayAbsencesCount?: number;
    leaveCostKwd?: number;
  };
}

export const OdooAppLauncher: React.FC<OdooAppLauncherProps> = ({ 
  onSelectApp,
  onOpenCompanyDocuments,
  onOpenComplianceTree,
  onCompanySetupAction,
  currentUserEmail = '', 
  currentUserRole = '', 
  activeCompany, 
  stats 
}) => {
  const { lang } = useLang();
  const { resolveElement, overridesDoc } = useUiStudio();
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserEmail.toLowerCase() === 'admin@aysed.com'.toLowerCase() || currentUserEmail.toLowerCase() === 'elsayedhr1993@gmail.com'.toLowerCase();
  const companyDisplayName = lang === 'ar' ? (activeCompany?.nameAr || activeCompany?.nameEn || 'Aysed HR S 2026') : (activeCompany?.nameEn || activeCompany?.nameAr || 'Aysed HR S 2026');
  const { isLoading: authLoading } = useAuth();
  const currentCompanyId = useEffectiveTenantCompanyId();

  const [searchQuery, setSearchQuery] = useState('');
  const [realEmployees, setRealEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading || !isQueryableTenantCompanyId(currentCompanyId)) {
      setRealEmployees([]);
      return;
    }
    setRealEmployees([]);
    const employeesQuery = query(
      collection(db, 'employees'),
      where('companyId', '==', currentCompanyId)
    );
    return onSnapshot(
      employeesQuery,
      (snapshot) => {
        setRealEmployees(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      },
      (error) => {
        console.error('Failed to load launcher employees:', error);
      }
    );
  }, [currentCompanyId, authLoading]);

  // القائمة الكاملة للتطبيقات
  const allApps = [
    {
      id: 'EMPLOYEES' as ActiveApp,
      titleAr: 'شؤون الموظفين',
      titleEn: 'Employees',
      icon: Users,
      category: 'HR_PAYROLL',
      gradient: 'from-emerald-500 to-teal-700 text-white',
      badgeBg: 'bg-emerald-500',
      badge: `${stats.employeesCount}`,
      description: lang === 'ar' ? 'السجلات الشخصية، المباشرة، والشهادات الرسمية' : 'Personal records, onboarding, and official documents',
    },
    {
      id: 'RECRUITMENT' as ActiveApp,
      titleAr: 'التوظيف والمقابلات',
      titleEn: 'Recruitment',
      icon: UserPlus,
      category: 'HR_PAYROLL',
      gradient: 'from-indigo-500 to-purple-700 text-white',
      badgeBg: 'bg-indigo-500',
      badge: `${stats.candidatesCount}`,
      description: lang === 'ar' ? 'إدارة طلبات التوظيف والمقابلات والسير الذاتية' : 'Manage hiring requests, interviews, and CVs',
    },
    {
      id: 'CONTRACTS' as ActiveApp,
      titleAr: 'عقود العمل',
      titleEn: 'Contracts',
      icon: FileSignature,
      category: 'HR_PAYROLL',
      gradient: 'from-teal-500 to-cyan-700 text-white',
      badgeBg: 'bg-teal-600',
      badge: `${stats.contractsCount}`,
      description: 'سريان العقود، باقات الأجور، والبدلات القانونية',
    },
    {
      id: 'LEAVES' as ActiveApp,
      titleAr: 'الإجازات',
      titleEn: 'Time Off',
      icon: Calendar,
      category: 'ATTENDANCE_TIME',
      gradient: 'from-amber-500 to-orange-600 text-white',
      badgeBg: 'bg-amber-500',
      badge: `${stats.leavesPendingCount}`,
      description: 'أرصدة الإجازات، المادة 70، والطلبات بانتظار الاعتماد',
    },
    {
      id: 'HOLIDAYS' as ActiveApp,
      titleAr: 'العطلات الرسمية',
      titleEn: 'Holidays',
      icon: Calendar,
      category: 'ATTENDANCE_TIME',
      gradient: 'from-rose-500 to-pink-700 text-white',
      badgeBg: 'bg-rose-500',
      badge: '13',
      description: 'العطلات والأعياد الرسمية بالكويت والتعويضات',
    },
    {
      id: 'ATTENDANCE' as ActiveApp,
      titleAr: 'الحضور والدوام',
      titleEn: 'Attendance',
      icon: Clock,
      category: 'ATTENDANCE_TIME',
      gradient: 'from-blue-600 to-indigo-800 text-white',
      badgeBg: 'bg-blue-600',
      badge: 'ZK',
      description: lang === 'ar' ? 'البصمة البيومترية، التأخير، والاستئذان اليومي' : 'Biometric clocking, lateness, and daily approvals',
    },
    {
      id: 'PAYROLL' as ActiveApp,
      titleAr: 'الرواتب وحماية الأجور',
      titleEn: 'Payroll & EOS',
      icon: Banknote,
      category: 'HR_PAYROLL',
      gradient: 'from-[#714B67] to-[#4A2E44] text-white',
      badgeBg: 'bg-[#714B67]',
      badge: 'WPS',
      description: lang === 'ar' ? 'كشوف أجور البنوك وحاسبة مكافأة نهاية الخدمة (مادة 51)' : 'Bank payroll slips and end-of-service calculator',
    },
    {
      id: 'REPORTS' as ActiveApp,
      titleAr: 'التقارير والتحليلات',
      titleEn: 'Reports & Pivot',
      icon: BarChart3,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-violet-600 to-purple-900 text-white',
      badgeBg: 'bg-violet-600',
      badge: 'Pivot',
      description: lang === 'ar' ? 'الجدول المحوري والرسوم البيانية والتحليلات' : 'Pivot tables, charts, and executive reporting',
    },
    {
      id: 'DOCUMENTS' as ActiveApp,
      titleAr: 'أرشيف المستندات',
      titleEn: 'Documents',
      icon: FolderKanban,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-sky-500 to-blue-700 text-white',
      badgeBg: 'bg-sky-600',
      badge: `${stats.documentsCount}`,
      description: lang === 'ar' ? 'الأرشيف الإلكتروني، الهويات، وتنبيهات الانتهاء' : 'Document archive, IDs, and expiry alerts',
    },
    {
      id: 'SCANNER_APP' as ActiveApp,
      titleAr: 'الماسح الضوئي الذكي',
      titleEn: 'Document Scanner',
      icon: Scan,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-teal-600 to-emerald-800 text-white',
      badgeBg: 'bg-teal-600',
      badge: 'OCR',
      description: lang === 'ar' ? 'مسح الوثائق، استخراج البيانات، والأرشفة الفورية' : 'Scan documents, extract data, and archive instantly',
    },
    {
      id: 'CUSTODY_LOANS' as ActiveApp,
      titleAr: 'العهد والممتلكات',
      titleEn: 'Custody',
      icon: Briefcase,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-slate-600 to-zinc-800 text-white',
      badgeBg: 'bg-slate-700',
      badge: `${stats.custodiesCount || 0}`,
      description: 'إدارة العهد العينية والسلف المالية والأقساط',
    },
    {
      id: 'AUDIT_LOGS' as ActiveApp,
      titleAr: 'سجل الرقابة',
      titleEn: 'Audit Logs',
      icon: ShieldCheck,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-zinc-700 to-slate-900 text-white',
      badgeBg: 'bg-zinc-800',
      badge: `${stats.auditLogsCount || 0}`,
      description: 'تتبع العمليات وحركات المستخدمين وتأمين البيانات',
    },
    {
      id: 'DOCUMENT_TEMPLATES' as ActiveApp,
      titleAr: 'قوالب ونماذج المستندات',
      titleEn: 'Document Templates',
      icon: FileText,
      category: 'DOCS_OPERATIONS',
      gradient: 'from-emerald-600 to-teal-800 text-white',
      badgeBg: 'bg-emerald-600',
      badge: 'نماذج',
      description: 'توليد وطباعة شهادات الراتب والكتب الرسمية آلياً',
    },
  ];

  // وضع العرض: أيقونات Launchpad العصرية أو بطاقات تفصيلية
  const [viewStyle, setViewStyle] = useState<'launchpad' | 'cards'>(() => {
    const saved = localStorage.getItem('odoo_launcher_view_style');
    return (saved === 'cards' || saved === 'launchpad') ? saved : 'launchpad';
  });

  const setLauncherStyle = (style: 'launchpad' | 'cards') => {
    setViewStyle(style);
    localStorage.setItem('odoo_launcher_view_style', style);
  };

  // تصفية التطبيقات طبقاً للبحث والتصنيف
  const filteredApps = useMemo(() => {
    return allApps.filter(app => {
      // 1. صلاحيات الموظف العادي
      if (currentUserRole === 'EMPLOYEE' && !['ATTENDANCE', 'LEAVES', 'DOCUMENTS'].includes(app.id)) {
        return false;
      }
      // 2. البحث النصي
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return app.titleAr.toLowerCase().includes(query) || 
               app.titleEn.toLowerCase().includes(query) || 
               app.description.toLowerCase().includes(query);
      }
      return true;
    });
  }, [allApps, currentUserRole, searchQuery]);

  const displayApps = useMemo(() => {
    const meta = filteredApps.map((app, idx) => ({
      app,
      uiKey: `launcher.app.${app.id}`,
      baseOrder: idx,
    }));
    const sorted = sortByUiOrder(meta, overridesDoc?.elements ?? {});
    return sorted.filter(row => {
      const resolved = resolveElement(row.uiKey, {
        kind: 'app',
        label: { ar: row.app.titleAr, en: row.app.titleEn },
        help: { ar: row.app.description, en: row.app.description },
        order: row.baseOrder,
      });
      return !resolved.hidden;
    });
  }, [filteredApps, overridesDoc, resolveElement]);

  const launcherAppUiKeys = useMemo(() => displayApps.map(d => d.uiKey), [displayApps]);
  const launcherReorderGroupId = 'launcher.apps';
  useRegisterReorderGroup(launcherReorderGroupId, launcherAppUiKeys);

  const distinctJobTitles = useMemo(() => {
    const titles = new Set<string>();
    for (const e of realEmployees) {
      const t = String(e.jobTitle || e.position || e.job_title || '').trim();
      if (t) titles.add(t);
    }
    return titles.size;
  }, [realEmployees]);

  return (
    <div className="dashboard-container w-full h-full bg-transparent flex flex-col relative z-10 space-y-4 pb-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {lang === 'ar' ? 'لوحة التطبيقات' : 'App Launcher'}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {companyDisplayName} · {displayApps.length}{' '}
            {lang === 'ar' ? 'تطبيق' : 'apps'}
          </p>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#714B67] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن تطبيق أو وحدة…' : 'Search apps and modules…'}
              className="w-full pr-10 pl-20 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#714B67] focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            )}
            {!searchQuery && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Ctrl+K
              </div>
            )}
          </div>

          {/* تبديل نمط العرض: Launchpad vs Bento Cards */}
          <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1 shadow-xs shrink-0">
            <button
              onClick={() => setLauncherStyle('launchpad')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewStyle === 'launchpad'
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="لوحة التطبيقات الذكية (أيقونات Launchpad الحديثة)"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">{lang === 'ar' ? 'لوحة التطبيقات' : 'App Launcher'}</span>
            </button>
            <button
              onClick={() => setLauncherStyle('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewStyle === 'cards'
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="بطاقات تفصيلية مع إحصائيات لكل تطبيق"
            >
              <Layers size={14} />
              <span className="hidden sm:inline">{lang === 'ar' ? 'بطاقات تفصيلية' : 'Detailed Cards'}</span>
            </button>
          </div>
        </div>

      </div>

      {onCompanySetupAction && (
        <CompanySetupOnboardingBanner
          company={activeCompany}
          employeesCount={stats.employeesCount || realEmployees.length}
          distinctJobTitles={distinctJobTitles}
          onStepAction={onCompanySetupAction}
          className="mb-3"
        />
      )}

      <div className="w-full py-1">
        {displayApps.length === 0 ? (
          <div className="text-center py-12 bg-white/80 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-bold text-sm">لا توجد تطبيقات تطابق كلمة البحث "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-[#714B67] underline cursor-pointer"
            >
              إعادة عرض جميع التطبيقات
            </button>
          </div>
        ) : viewStyle === 'launchpad' ? (
          /* 🌟 1. النمط الحديث: Launchpad Squircle App Grid (Apple / Odoo 18 Style) */
          <div className="odoo-app-launchpad-grid justify-items-stretch">
            {displayApps.map(({ app, uiKey }) => {
              const IconComponent = app.icon;
              const appDefaults = {
                kind: 'app' as const,
                label: { ar: app.titleAr, en: app.titleEn },
                help: { ar: app.description, en: app.description },
              };
              const locale = lang === 'en' ? 'en' : 'ar';
              const title = pickUiLabel(resolveElement(uiKey, appDefaults), locale);
              const descKey = `${uiKey}.description`;
              const description = pickUiLabel(
                resolveElement(descKey, {
                  kind: 'help',
                  label: { ar: app.description, en: app.description },
                }),
                locale
              );
              return (
                <button
                  key={app.id}
                  onClick={() => onSelectApp(app.id)}
                  className="group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/90 hover:bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer text-center backdrop-blur-sm"
                >
                  {/* Subtle Badge Tag */}
                  {app.badge && (
                    <span className="absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-purple-50 text-slate-600 group-hover:text-[#714B67] border border-slate-200/80 transition-colors">
                      {app.badge}
                    </span>
                  )}

                  {/* 💎 3D Squircle Icon Container */}
                  <div className="relative mt-1 mb-2.5">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden ring-4 ring-white/60`}>
                      {/* Glossy Glass Highlight Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/10 pointer-events-none" />
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm relative z-10" strokeWidth={1.9} />
                    </div>
                  </div>

                  {/* App Text Info */}
                  <div className="w-full space-y-0.5">
                    <h3 className="font-extrabold text-xs sm:text-[13px] text-slate-800 group-hover:text-[#714B67] leading-tight transition-colors line-clamp-1">
                      <UiStudioTarget
                        uiKey={uiKey}
                        kind="app"
                        defaults={appDefaults}
                        reorderGroupId={launcherReorderGroupId}
                        className="w-full justify-center"
                      >
                        {title}
                      </UiStudioTarget>
                    </h3>
                    <p className="text-[10px] text-slate-400 group-hover:text-slate-600 font-medium leading-tight line-clamp-1 transition-colors">
                      <UiStudioTarget
                        uiKey={`${uiKey}.description`}
                        kind="help"
                        defaults={{ label: { ar: app.description, en: app.description } }}
                      >
                        {description}
                      </UiStudioTarget>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* 🗂️ 2. النمط الثاني: بطاقات الـ Bento SaaS التفصيلية */
          <div className="odoo-app-cards-grid">
            {displayApps.map(({ app, uiKey }) => {
              const IconComponent = app.icon;
              const appDefaults = {
                kind: 'app' as const,
                label: { ar: app.titleAr, en: app.titleEn },
                help: { ar: app.description, en: app.description },
              };
              const locale = lang === 'en' ? 'en' : 'ar';
              const title = pickUiLabel(resolveElement(uiKey, appDefaults), locale);
              const descKey = `${uiKey}.description`;
              const description = pickUiLabel(
                resolveElement(descKey, {
                  kind: 'help',
                  label: { ar: app.description, en: app.description },
                }),
                locale
              );
              return (
                <button
                  key={app.id}
                  onClick={() => onSelectApp(app.id)}
                  className="group relative flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/95 hover:bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer text-right shadow-2xs"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200 ring-2 ring-white`}>
                    <IconComponent className="w-6 h-6 text-white drop-shadow-xs" strokeWidth={1.9} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-[#714B67] leading-tight truncate transition-colors min-w-0">
                        <UiStudioTarget
                          uiKey={uiKey}
                          kind="app"
                          defaults={appDefaults}
                          reorderGroupId={launcherReorderGroupId}
                        >
                          {title}
                        </UiStudioTarget>
                      </h3>
                      {app.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug line-clamp-2">
                      <UiStudioTarget
                        uiKey={`${uiKey}.description`}
                        kind="help"
                        defaults={{ label: { ar: app.description, en: app.description } }}
                      >
                        {description}
                      </UiStudioTarget>
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="self-center text-slate-300 group-hover:text-[#714B67] group-hover:-translate-x-0.5 transition-all">
                    <ArrowUpRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default OdooAppLauncher;
