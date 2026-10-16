import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users, UserPlus, FileSignature, Calendar, Clock,
  Banknote, Scale, FolderKanban, Scan,
  Briefcase, FileText, ShieldCheck, ArrowUpRight, BarChart3, Star,
  Landmark,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ActiveApp, Company } from '../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DICTIONARY, useLang } from '../lib/i18n';
import { useEffectiveTenantCompanyId } from '../hooks/useEffectiveTenantCompanyId';
import { isQueryableTenantCompanyId } from '../utils/tenantCompanyId';
import { useAuth } from '../context/AuthContext';
import {
  CompanySetupOnboardingBanner,
  type CompanySetupStepAction,
} from './onboarding/CompanySetupOnboardingBanner';
import { useRegisterReorderGroup, useUiStudio } from '../context/UiStudioContext';
import { UiStudioTarget } from './studio/UiStudioTarget';
import { pickUiLabel } from '../utils/uiOverrideUtils';
import {
  LAUNCHER_TILE_DEFAULTS,
  launcherTileAllowed,
  launcherTileKey,
  launcherTileShown,
  resolveLauncherTile,
  type LauncherIconName,
} from '../config/launcherTiles';

type LauncherBadgeTone = 'urgent' | 'warning' | 'neutral' | 'brand';

function resolveLauncherBadgeTone(
  appId: ActiveApp,
  badge: string,
  stats: OdooAppLauncherProps['stats']
): LauncherBadgeTone {
  if (appId === 'LEAVES' && stats.leavesPendingCount > 0) return 'urgent';
  if (appId === 'RECRUITMENT' && stats.candidatesCount > 0) return 'warning';
  if (appId === 'CONTRACTS' && (stats.contractsExpiringCount || 0) > 0) return 'urgent';
  const numeric = Number.parseInt(badge, 10);
  if (!Number.isNaN(numeric) && numeric > 0) return 'neutral';
  return 'brand';
}

const LAUNCHER_TECH_BADGE_AR: Record<string, string> = {
  WPS: 'حماية الأجور (WPS)',
  ZK: 'البصمة',
  OCR: 'قارئ المستندات',
  Pivot: 'التقرير المحوري',
};

function formatLauncherBadge(badge: string, locale: 'ar' | 'en'): string {
  if (locale !== 'ar') return badge;
  return LAUNCHER_TECH_BADGE_AR[badge] ?? badge;
}

function positiveBadgeCount(badge: string | undefined): number | null {
  if (!badge || !/^\d+$/.test(badge.trim())) return null;
  const value = Number.parseInt(badge.trim(), 10);
  return value > 0 ? value : null;
}

const LAUNCHER_ICON_COMPONENTS: Record<LauncherIconName, LucideIcon> = {
  Users,
  UserPlus,
  FileSignature,
  Calendar,
  Clock,
  Banknote,
  BarChart3,
  FolderKanban,
  Scan,
  Briefcase,
  ShieldCheck,
  FileText,
};

function tileDescription(id: string, lang: string): string {
  const ar = lang === 'ar';
  switch (id) {
    case 'EMPLOYEES':
      return ar ? 'السجلات الشخصية، المباشرة، والشهادات الرسمية' : 'Personal records, onboarding, and official documents';
    case 'RECRUITMENT':
      return ar ? 'إدارة طلبات التوظيف والمقابلات والسير الذاتية' : 'Manage hiring requests, interviews, and CVs';
    case 'CONTRACTS':
      return 'سريان العقود، باقات الأجور، والبدلات القانونية';
    case 'LEAVES':
      return 'أرصدة الإجازات، المادة 70، والطلبات بانتظار الاعتماد';
    case 'HOLIDAYS':
      return 'العطلات والأعياد الرسمية بالكويت والتعويضات';
    case 'ATTENDANCE':
      return ar ? 'البصمة اليومية، التأخير، والاستئذان اليومي' : 'Biometric clocking, lateness, and daily approvals';
    case 'PAYROLL':
      return ar ? 'كشوف أجور البنوك وحاسبة مكافأة نهاية الخدمة (مادة 51)' : 'Bank payroll slips and end-of-service calculator';
    case 'REPORTS':
      return ar ? 'الجدول المحوري والرسوم البيانية والتحليلات' : 'Pivot tables, charts, and executive reporting';
    case 'DOCUMENTS':
      return ar ? 'الأرشيف الإلكتروني، الهويات، وتنبيهات الانتهاء' : 'Document archive, IDs, and expiry alerts';
    case 'SCANNER_APP':
      return ar ? 'مسح الوثائق، استخراج البيانات، والأرشفة الفورية' : 'Scan documents, extract data, and archive instantly';
    case 'CUSTODY_LOANS':
      return 'إدارة العهد العينية والسلف المالية والأقساط';
    case 'AUDIT_LOGS':
      return 'تتبع العمليات وحركات المستخدمين وتأمين البيانات';
    case 'DOCUMENT_TEMPLATES':
      return 'توليد وطباعة شهادات الراتب والكتب الرسمية آلياً';
    default:
      return '';
  }
}

function tileBadge(id: string, stats: OdooAppLauncherProps['stats']): string {
  switch (id) {
    case 'EMPLOYEES':
      return `${stats.employeesCount}`;
    case 'RECRUITMENT':
      return `${stats.candidatesCount}`;
    case 'CONTRACTS':
      return `${stats.contractsCount}`;
    case 'LEAVES':
      return `${stats.leavesPendingCount}`;
    case 'HOLIDAYS':
      return '13';
    case 'ATTENDANCE':
      return 'ZK';
    case 'PAYROLL':
      return 'WPS';
    case 'REPORTS':
      return 'Pivot';
    case 'DOCUMENTS':
      return `${stats.documentsCount}`;
    case 'SCANNER_APP':
      return 'OCR';
    case 'CUSTODY_LOANS':
      return `${stats.custodiesCount || 0}`;
    case 'AUDIT_LOGS':
      return `${stats.auditLogsCount || 0}`;
    case 'DOCUMENT_TEMPLATES':
      return 'نماذج';
    default:
      return '';
  }
}

function launcherBadgeClassName(tone: LauncherBadgeTone, inCard = false): string {
  const base = 'text-[9px] font-black px-1.5 py-0.5 rounded-md border transition-colors duration-300';
  switch (tone) {
    case 'urgent':
      return `${base} bg-red-500 text-white border-red-600 shadow-sm`;
    case 'warning':
      return `${base} bg-orange-500 text-white border-orange-600 shadow-sm`;
    case 'brand':
      return `${base} bg-primary text-white border-[#5a3a52]`;
    default:
      return inCard
        ? `${base} bg-slate-100 text-slate-600 border-slate-200`
        : `${base} bg-slate-100 text-slate-600 border-slate-200/80 group-hover:bg-slate-50`;
  }
}

interface OdooAppLauncherProps {
  onSelectApp: (app: ActiveApp) => void;
  onOpenSpotlight?: () => void;
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
    contractsExpiringCount?: number;
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
  onOpenSpotlight,
  onOpenCompanyDocuments,
  onOpenComplianceTree,
  onCompanySetupAction,
  currentUserEmail = '', 
  currentUserRole = '', 
  activeCompany, 
  stats 
}) => {
  const { lang } = useLang();
  const { resolveElement, overridesDoc, canUseUiStudio, uiStudioActive } = useUiStudio();
  const studioOn = canUseUiStudio && uiStudioActive;
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserEmail.toLowerCase() === 'admin@aysed.com'.toLowerCase() || currentUserEmail.toLowerCase() === 'elsayedhr1993@gmail.com'.toLowerCase();
  const companyDisplayName = lang === 'ar' ? (activeCompany?.nameAr || activeCompany?.nameEn || 'Aysed HR S 2026') : (activeCompany?.nameEn || activeCompany?.nameAr || 'Aysed HR S 2026');
  const { isLoading: authLoading } = useAuth();
  const currentCompanyId = useEffectiveTenantCompanyId();

  const [realEmployees, setRealEmployees] = useState<any[]>([]);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const launcherMenuRef = useRef<HTMLDivElement>(null);

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


  // وضع العرض: أيقونات Launchpad العصرية أو بطاقات تفصيلية
  const [viewStyle, setViewStyle] = useState<'launchpad' | 'cards'>(() => {
    const saved = localStorage.getItem('odoo_launcher_view_style');
    return (saved === 'cards' || saved === 'launchpad') ? saved : 'launchpad';
  });

  const setLauncherStyle = (style: 'launchpad' | 'cards') => {
    setViewStyle(style);
    localStorage.setItem('odoo_launcher_view_style', style);
  };

  const displayApps = useMemo(() => {
    const rows = LAUNCHER_TILE_DEFAULTS.flatMap((tile) => {
      const uiKey = launcherTileKey(tile.id);
      const override = overridesDoc?.elements?.[uiKey];
      if (!launcherTileAllowed(currentUserRole, tile.id)) return [];
      if (!studioOn && !launcherTileShown(currentUserRole, tile.id, override)) return [];
      const resolved = resolveLauncherTile(tile.id, override);
      if (!resolved) return [];
      return [{
        app: {
          id: tile.id as ActiveApp,
          titleAr: tile.titleAr,
          titleEn: tile.titleEn,
          icon: LAUNCHER_ICON_COMPONENTS[resolved.icon],
          badge: tileBadge(tile.id, stats),
          description: tileDescription(tile.id, lang),
        },
        uiKey,
        group: resolved.group,
        groupOrder: resolved.order,
        catalogIndex: resolved.catalogIndex,
        cardOrder: typeof override?.order === 'number' ? override.order : resolved.catalogIndex,
      }];
    });
    rows.sort((a, b) => a.cardOrder - b.cardOrder || a.catalogIndex - b.catalogIndex);
    return rows;
  }, [currentUserRole, lang, overridesDoc, stats, studioOn]);


  const launcherAppUiKeys = useMemo(() => displayApps.map(d => d.uiKey), [displayApps]);
  const launcherReorderGroupId = 'launcher.apps';
  useRegisterReorderGroup(launcherReorderGroupId, launcherAppUiKeys);

  useEffect(() => {
    if (!onOpenSpotlight) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSpotlight();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenSpotlight]);

  const distinctJobTitles = useMemo(() => {
    const titles = new Set<string>();
    for (const e of realEmployees) {
      const t = String(e.jobTitle || e.position || e.job_title || '').trim();
      if (t) titles.add(t);
    }
    return titles.size;
  }, [realEmployees]);

  const locale: 'ar' | 'en' = lang === 'en' ? 'en' : 'ar';
  const canSeeAdminGroup = isSuperAdmin || currentUserRole !== 'EMPLOYEE';

  useEffect(() => {
    if (!openGroupId) return;
    const onPointer = (event: MouseEvent) => {
      if (!launcherMenuRef.current?.contains(event.target as Node)) setOpenGroupId(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenGroupId(null);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openGroupId]);

  type LauncherEntry = {
    key: string;
    title: string;
    description: string;
    icon: LucideIcon;
    badge: string;
    badgeAppId?: ActiveApp;
    uiKey?: string;
    appDefaults?: {
      kind: 'app';
      label: { ar: string; en: string };
      help: { ar: string; en: string };
    };
    open: () => void;
  };

  const launchGroups = useMemo(() => {
    const rowById = new Map(displayApps.map((row) => [row.app.id, row]));
    const present = (id: ActiveApp): LauncherEntry | null => {
      const row = rowById.get(id);
      if (!row) return null;
      const app = row.app;
      const appDefaults = {
        kind: 'app' as const,
        label: { ar: app.titleAr, en: app.titleEn },
        help: { ar: app.description, en: app.description },
      };
      return {
        key: app.id,
        title: pickUiLabel(resolveElement(row.uiKey, appDefaults), locale),
        description: pickUiLabel(
          resolveElement(`${row.uiKey}.description`, {
            kind: 'help',
            label: { ar: app.description, en: app.description },
          }),
          locale
        ),
        icon: app.icon,
        badge: app.badge,
        badgeAppId: app.id,
        uiKey: row.uiKey,
        appDefaults,
        open: () => onSelectApp(app.id),
      };
    };

    const adminExtras: LauncherEntry[] = canSeeAdminGroup
      ? [
          {
            key: 'work-policies',
            title: locale === 'ar' ? DICTIONARY.launcher_policies.ar : DICTIONARY.launcher_policies.en,
            description: locale === 'ar' ? DICTIONARY.launcher_policies_desc.ar : DICTIONARY.launcher_policies_desc.en,
            icon: Scale,
            badge: '',
            open: () => onCompanySetupAction?.({ type: 'settings', section: 'leaves' }),
          },
          {
            key: 'licenses',
            title: locale === 'ar' ? DICTIONARY.launcher_licenses.ar : DICTIONARY.launcher_licenses.en,
            description: locale === 'ar' ? DICTIONARY.launcher_licenses_desc.ar : DICTIONARY.launcher_licenses_desc.en,
            icon: Landmark,
            badge: '',
            open: () => {
              if (onOpenCompanyDocuments) onOpenCompanyDocuments();
              else if (onOpenComplianceTree) onOpenComplianceTree();
              else onCompanySetupAction?.({ type: 'company_documents' });
            },
          },
        ]
      : [];

    const specs: Array<{
      id: string;
      titleAr: string;
      titleEn: string;
      hintAr: string;
      hintEn: string;
      icon: LucideIcon;
      adminOnly?: boolean;
      extras?: LauncherEntry[];
    }> = [
      {
        id: 'people',
        titleAr: DICTIONARY.group_people.ar,
        titleEn: DICTIONARY.group_people.en,
        hintAr: DICTIONARY.group_people_hint.ar,
        hintEn: DICTIONARY.group_people_hint.en,
        icon: Users,
      },
      {
        id: 'recruitment',
        titleAr: DICTIONARY.group_recruitment.ar,
        titleEn: DICTIONARY.group_recruitment.en,
        hintAr: '',
        hintEn: '',
        icon: UserPlus,
      },
      {
        id: 'time',
        titleAr: DICTIONARY.group_time.ar,
        titleEn: DICTIONARY.group_time.en,
        hintAr: DICTIONARY.group_time_hint.ar,
        hintEn: DICTIONARY.group_time_hint.en,
        icon: Clock,
      },
      {
        id: 'payroll',
        titleAr: DICTIONARY.payroll.ar,
        titleEn: DICTIONARY.payroll.en,
        hintAr: '',
        hintEn: '',
        icon: Banknote,
      },
      {
        id: 'documents',
        titleAr: DICTIONARY.documents.ar,
        titleEn: DICTIONARY.documents.en,
        hintAr: DICTIONARY.group_documents_hint.ar,
        hintEn: DICTIONARY.group_documents_hint.en,
        icon: FolderKanban,
      },
      {
        id: 'reports',
        titleAr: DICTIONARY.reports.ar,
        titleEn: DICTIONARY.reports.en,
        hintAr: '',
        hintEn: '',
        icon: BarChart3,
      },
      {
        id: 'admin',
        titleAr: DICTIONARY.group_admin.ar,
        titleEn: DICTIONARY.group_admin.en,
        hintAr: DICTIONARY.group_admin_hint.ar,
        hintEn: DICTIONARY.group_admin_hint.en,
        icon: ShieldCheck,
        adminOnly: true,
        extras: adminExtras,
      },
    ];

    const claimed = new Set<ActiveApp>();
    const groups = specs.flatMap((spec) => {
      if (spec.adminOnly && !canSeeAdminGroup) return [];
      const entries = [
        ...displayApps
          .filter((row) => row.group === spec.id)
          .sort((a, b) => a.groupOrder - b.groupOrder || a.catalogIndex - b.catalogIndex)
          .map((row) => present(row.app.id))
          .filter((entry): entry is LauncherEntry => entry != null),
        ...(spec.extras ?? []),
      ];
      displayApps.filter((row) => row.group === spec.id).forEach((row) => claimed.add(row.app.id));
      if (entries.length === 0) return [];
      const hint = locale === 'ar' ? spec.hintAr : spec.hintEn;
      return [{
        id: spec.id,
        title: locale === 'ar' ? spec.titleAr : spec.titleEn,
        description: entries.length === 1
          ? entries[0].description
          : (hint || entries.map((entry) => entry.title).join(locale === 'ar' ? '، ' : ', ')),
        icon: spec.icon,
        entries,
      }];
    });

    const leftovers = displayApps
      .filter((row) => !claimed.has(row.app.id))
      .map((row) => present(row.app.id))
      .filter((entry): entry is LauncherEntry => entry != null)
      .map((entry) => ({
        id: `solo-${entry.key}`,
        title: entry.title,
        description: entry.description,
        icon: entry.icon,
        entries: [entry],
      }));

    return [...groups, ...leftovers];
  }, [
    canSeeAdminGroup,
    displayApps,
    locale,
    onCompanySetupAction,
    onOpenCompanyDocuments,
    onOpenComplianceTree,
    onSelectApp,
    resolveElement,
  ]);

  const badgeRank: Record<LauncherBadgeTone, number> = { urgent: 0, warning: 1, neutral: 2, brand: 3 };

  const leadingBadge = (entries: LauncherEntry[]) => {
    const options = entries.flatMap((entry) => {
      const count = positiveBadgeCount(entry.badge);
      if (count == null) return [];
      const text = String(count);
      const tone: LauncherBadgeTone = entry.badgeAppId
        ? resolveLauncherBadgeTone(entry.badgeAppId, text, stats)
        : 'neutral';
      return [{ text, tone }];
    });
    options.sort((a, b) => badgeRank[a.tone] - badgeRank[b.tone]);
    return options[0] ?? null;
  };

  const tileCount = viewStyle === 'launchpad' ? launchGroups.length : displayApps.length;

  return (
    <div
      className="dashboard-container odoo-launcher-shell w-full h-full bg-transparent flex flex-col relative z-10 space-y-5 pb-20 sm:pb-24"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {lang === 'ar' ? 'لوحة التطبيقات' : 'App Launcher'}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {companyDisplayName} · {tileCount}{' '}
            {lang === 'ar' ? 'تطبيق' : 'apps'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLauncherStyle(viewStyle === 'cards' ? 'launchpad' : 'cards')}
          aria-pressed={viewStyle === 'cards'}
          title={lang === 'ar' ? 'بطاقات تفصيلية' : 'Detailed cards'}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cursor-pointer transition ${
            viewStyle === 'cards'
              ? 'border-primary bg-primary text-white'
              : 'border-slate-200 bg-white text-primary hover:bg-primary/5'
          }`}
        >
          <Star size={16} className={viewStyle === 'cards' ? 'fill-current' : ''} />
        </button>
      </div>

      {onCompanySetupAction && (
        <CompanySetupOnboardingBanner
          company={activeCompany}
          employeesCount={stats.employeesCount || realEmployees.length}
          distinctJobTitles={distinctJobTitles}
          onStepAction={onCompanySetupAction}
          className="relative z-20 shrink-0"
        />
      )}

      <div ref={launcherMenuRef} className="w-full py-1 pb-8 odoo-launcher-grid-wrap">
        {viewStyle === 'launchpad' ? (
          launchGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 py-12 text-center">
              <p className="text-sm font-bold text-slate-500">
                {lang === 'ar' ? 'لا توجد تطبيقات متاحة' : 'No apps available'}
              </p>
            </div>
          ) : (
            <div className="odoo-launcher-minimal-grid">
              {launchGroups.map((group) => {
                const GroupIcon = group.icon;
                const grouped = group.entries.length > 1;
                const primary = group.entries[0];
                const badge = grouped
                  ? leadingBadge(group.entries)
                  : (() => {
                      const count = positiveBadgeCount(primary?.badge);
                      if (count == null || !primary?.badgeAppId) return null;
                      const text = String(count);
                      return {
                        text,
                        tone: resolveLauncherBadgeTone(primary.badgeAppId, text, stats),
                      };
                    })();
                return (
                  <div key={group.id} className="relative h-full">
                    <button
                      type="button"
                      title={group.description}
                      aria-haspopup={grouped ? 'menu' : undefined}
                      aria-expanded={grouped ? openGroupId === group.id : undefined}
                      onClick={() => {
                        if (!grouped) {
                          primary?.open();
                          return;
                        }
                        setOpenGroupId((current) => (current === group.id ? null : group.id));
                      }}
                      className="group relative flex h-full w-full min-h-[9.5rem] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer"
                    >
                      {badge && (
                        <span className={`absolute top-2.5 end-2.5 ${launcherBadgeClassName(badge.tone)}`}>
                          {formatLauncherBadge(badge.text, locale)}
                        </span>
                      )}
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <GroupIcon className="h-7 w-7" strokeWidth={1.75} />
                      </span>
                      <h3 className="w-full text-xs font-extrabold leading-tight text-slate-800 group-hover:text-primary sm:text-[13px]">
                        {!grouped && primary?.uiKey && primary.appDefaults ? (
                          <UiStudioTarget
                            uiKey={primary.uiKey}
                            kind="app"
                            defaults={primary.appDefaults}
                            reorderGroupId={launcherReorderGroupId}
                            className="w-full justify-center"
                          >
                            {group.title}
                          </UiStudioTarget>
                        ) : (
                          group.title
                        )}
                      </h3>
                      <span className="sr-only">{group.description}</span>
                    </button>
                    {group.entries.map((entry) => (
                      entry.uiKey ? (
                        <span key={`${entry.key}-help`} className="sr-only">
                          <UiStudioTarget
                            uiKey={`${entry.uiKey}.description`}
                            kind="help"
                            defaults={{ label: { ar: entry.description, en: entry.description } }}
                          >
                            {entry.description}
                          </UiStudioTarget>
                        </span>
                      ) : null
                    ))}
                    {grouped && openGroupId === group.id && (
                      <div
                        role="menu"
                        className="absolute start-0 top-full z-30 mt-2 w-full min-w-[15rem] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                      >
                        {group.entries.map((entry) => {
                          const EntryIcon = entry.icon;
                          const count = positiveBadgeCount(entry.badge);
                          const tone = entry.badgeAppId && count != null
                            ? resolveLauncherBadgeTone(entry.badgeAppId, String(count), stats)
                            : 'neutral';
                          return (
                            <button
                              key={entry.key}
                              type="button"
                              role="menuitem"
                              title={entry.description}
                              onClick={() => {
                                setOpenGroupId(null);
                                entry.open();
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg py-2 ps-2.5 pe-2.5 text-start hover:bg-primary/5 cursor-pointer"
                            >
                              <EntryIcon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                              <span className="min-w-0 flex-1 text-xs font-bold text-slate-800">
                                {entry.uiKey && entry.appDefaults ? (
                                  <UiStudioTarget
                                    uiKey={entry.uiKey}
                                    kind="app"
                                    defaults={entry.appDefaults}
                                    reorderGroupId={launcherReorderGroupId}
                                  >
                                    {entry.title}
                                  </UiStudioTarget>
                                ) : (
                                  entry.title
                                )}
                              </span>
                              {count != null && (
                                <span className={launcherBadgeClassName(tone, true)}>
                                  {formatLauncherBadge(String(count), locale)}
                                </span>
                              )}
                              <span className="sr-only">{entry.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="odoo-launcher-minimal-grid">
            {displayApps.map(({ app, uiKey }) => {
              const IconComponent = app.icon;
              const appDefaults = {
                kind: 'app' as const,
                label: { ar: app.titleAr, en: app.titleEn },
                help: { ar: app.description, en: app.description },
              };
              const title = pickUiLabel(resolveElement(uiKey, appDefaults), locale);
              const description = pickUiLabel(
                resolveElement(`${uiKey}.description`, {
                  kind: 'help',
                  label: { ar: app.description, en: app.description },
                }),
                locale
              );
              const count = positiveBadgeCount(app.badge);
              return (
                <button
                  key={app.id}
                  type="button"
                  title={description}
                  onClick={() => onSelectApp(app.id)}
                  className="group relative flex h-full w-full min-h-[7.25rem] items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 text-start shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconComponent className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <h3 className="min-w-0 text-xs font-extrabold leading-tight text-slate-900 group-hover:text-primary sm:text-sm">
                      <UiStudioTarget
                        uiKey={uiKey}
                        kind="app"
                        defaults={appDefaults}
                        reorderGroupId={launcherReorderGroupId}
                      >
                        {title}
                      </UiStudioTarget>
                    </h3>
                    {count != null && (
                      <span className={launcherBadgeClassName(resolveLauncherBadgeTone(app.id, String(count), stats), true)}>
                        {formatLauncherBadge(String(count), locale)}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 text-slate-300 group-hover:text-primary" />
                  <span className="sr-only">
                    <UiStudioTarget
                      uiKey={`${uiKey}.description`}
                      kind="help"
                      defaults={{ label: { ar: app.description, en: app.description } }}
                    >
                      {description}
                    </UiStudioTarget>
                  </span>
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
