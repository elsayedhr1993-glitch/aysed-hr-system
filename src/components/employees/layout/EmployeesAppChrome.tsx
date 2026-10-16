import React, { useRef, useEffect, useState } from 'react';
import { useLang } from '../../../lib/i18n';
import { createPortal } from 'react-dom';
import {
  Users,
  Search,
  X,
  UserPlus,
  ChevronDown,
  LayoutGrid,
  List,
  FileText,
  Rocket,
  Network,
  Stethoscope,
  SlidersHorizontal,
} from 'lucide-react';
import { CompactTabBar } from '../../ui/CompactTabBar';
import { ScreenLayoutStudioToggle } from '../../studio/ScreenLayoutStudioToggle';
import type { ScreenCustomLayout } from '../../../types/customLayout';

export type EmployeesWorkspaceTab = 'directory' | 'contracts' | 'commencement' | 'onboarding' | 'orgchart';

export type DirectoryKpiFilter =
  | 'all'
  | 'on_duty'
  | 'on_leave'
  | 'residency_expiring'
  | 'moh_expiring'
  | 'expired';

const SUB_MODULE_LABELS: Record<Exclude<EmployeesWorkspaceTab, 'directory'>, string> = {
  contracts: 'سجل العقود والرواتب',
  commencement: 'إقرارات المباشرة والعهد',
  onboarding: 'خطة التهيئة والتعيين',
  orgchart: 'الهيكل التنظيمي',
};

interface EmployeesAppChromeProps {
  activeTab: EmployeesWorkspaceTab;
  onTabChange: (tab: EmployeesWorkspaceTab) => void;
  companyLabel: string;
  showDirectoryTools: boolean;
  showViewToggle: boolean;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedDept: string | null;
  onDeptChange: (dept: string | null) => void;
  allDepts: string[];
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  onCreateEmployee: () => void;
  actionsMenuOpen: boolean;
  onActionsMenuOpenChange: (open: boolean) => void;
  actionsMenu: React.ReactNode;
  employeesLayout: ScreenCustomLayout;
  kpiFilter?: DirectoryKpiFilter;
  onKpiFilterChange?: (filter: DirectoryKpiFilter) => void;
  directoryCounts?: {
    total: number;
    onDuty: number;
    onLeave: number;
    residencyExpiring: number;
  };
  isDirectoryLoading?: boolean;
  /** عند الدليل يُستخدم زر «جديد» في HeaderBar فقط */
  showHeaderCreateEmployee?: boolean;
  children: React.ReactNode;
}

export const EmployeesAppChrome: React.FC<EmployeesAppChromeProps> = ({
  activeTab,
  onTabChange,
  companyLabel,
  showDirectoryTools,
  showViewToggle,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  selectedDept,
  onDeptChange,
  allDepts,
  selectedStatus,
  onStatusChange,
  onCreateEmployee,
  actionsMenuOpen,
  onActionsMenuOpenChange,
  actionsMenu,
  employeesLayout,
  kpiFilter = 'all',
  onKpiFilterChange,
  directoryCounts,
  isDirectoryLoading = false,
  showHeaderCreateEmployee = true,
  children,
}) => {
  const { t } = useLang();
  const actionsTriggerRef = useRef<HTMLButtonElement>(null);
  const actionsMenuPortalRef = useRef<HTMLDivElement>(null);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<{ top: number; left: number } | null>(
    null
  );
  const [workspaceMoreOpen, setWorkspaceMoreOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const activeFacetCount =
    (selectedDept ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (kpiFilter !== 'all' ? 1 : 0);

  useEffect(() => {
    if (!filtersOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (filtersRef.current?.contains(e.target as Node)) return;
      setFiltersOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [filtersOpen]);

  const syncActionsMenuAnchor = () => {
    const rect = actionsTriggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuWidth = 208;
    setActionsMenuAnchor({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - menuWidth),
    });
  };

  const setActionsMenuOpenSafe = (open: boolean) => {
    if (!open) setActionsMenuAnchor(null);
    onActionsMenuOpenChange(open);
  };

  const toggleActionsMenu = () => {
    if (actionsMenuOpen) {
      setActionsMenuOpenSafe(false);
      return;
    }
    syncActionsMenuAnchor();
    setActionsMenuOpenSafe(true);
  };

  useEffect(() => {
    if (!actionsMenuOpen) {
      setActionsMenuAnchor(null);
      return;
    }
    syncActionsMenuAnchor();
    const onScrollOrResize = () => syncActionsMenuAnchor();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [actionsMenuOpen]);

  useEffect(() => {
    if (!actionsMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        actionsTriggerRef.current?.contains(target) ||
        actionsMenuPortalRef.current?.contains(target)
      ) {
        return;
      }
      setActionsMenuOpenSafe(false);
    };
    const frame = window.requestAnimationFrame(() => {
      document.addEventListener('mousedown', onDoc);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [actionsMenuOpen]);

  const breadcrumbTail =
    activeTab === 'directory'
      ? 'الدليل'
      : SUB_MODULE_LABELS[activeTab as Exclude<EmployeesWorkspaceTab, 'directory'>];

  return (
    <div className="flex-1 flex flex-col w-full min-h-0 bg-slate-50/80">
      <div
        className={`relative flex flex-col flex-1 min-h-0 bg-white border border-slate-200/80 rounded-xl shadow-2xs ${
          workspaceMoreOpen || actionsMenuOpen ? 'z-50' : 'z-10'
        }`}
      >
        {/* صف واحد: مسار + إجراءات */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 shrink-0 overflow-visible ${
            actionsMenuOpen ? 'relative z-[60]' : 'relative z-20'
          }`}
        >
          <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-600 min-w-0">
            <Users size={13} className="text-primary shrink-0" />
            <span className="text-slate-400">{t('employees')}</span>
            <span className="text-slate-200">/</span>
            {activeTab !== 'directory' && (
              <>
                <button
                  type="button"
                  onClick={() => onTabChange('directory')}
                  className="text-primary hover:underline cursor-pointer"
                >
                  الدليل
                </button>
                <span className="text-slate-200">/</span>
              </>
            )}
            <span className="text-slate-800">{breadcrumbTail}</span>
            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[140px] sm:max-w-[220px]">
              · {companyLabel}
            </span>
          </nav>

          <div className="flex flex-wrap items-center gap-1 shrink-0">
            <ScreenLayoutStudioToggle screenId="employees" layout={employeesLayout} />
            {showHeaderCreateEmployee ? (
              <button
                type="button"
                onClick={onCreateEmployee}
                className="btn btn-primary px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm bg-primary hover:bg-[#5b3c53] text-white border border-[#5b3c53]"
              >
                <UserPlus size={13} />
                موظف جديد
              </button>
            ) : null}
            <div className="relative shrink-0">
              <button
                ref={actionsTriggerRef}
                type="button"
                aria-expanded={actionsMenuOpen}
                aria-haspopup="menu"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActionsMenu();
                }}
                className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-0.5 cursor-pointer hover:bg-slate-50 relative z-[61]"
              >
                إجراءات
                <ChevronDown size={12} className={`text-slate-400 transition ${actionsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {actionsMenuOpen && actionsMenuAnchor
              ? createPortal(
                  <div
                    ref={actionsMenuPortalRef}
                    className="fixed z-[200] w-52 bg-white border border-slate-200 rounded-xl shadow-lg animate-in fade-in duration-100"
                    style={{ top: actionsMenuAnchor.top, left: actionsMenuAnchor.left }}
                    dir="rtl"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {actionsMenu}
                  </div>,
                  document.body
                )
              : null}
            {showViewToggle && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => onViewModeChange('cards')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'cards' ? 'bg-white text-primary shadow-2xs' : 'text-slate-400'}`}
                  title="بطاقات"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white text-primary shadow-2xs' : 'text-slate-400'}`}
                  title="جدول"
                >
                  <List size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-2 sm:px-3 border-b border-slate-100 bg-slate-50/40 shrink-0 relative z-30 isolate">
          <CompactTabBar
            tabs={[
              { id: 'directory', label: 'دليل الموظفين', shortLabel: 'الدليل', icon: <Users size={14} /> },
            ]}
            moreItems={[
              { id: 'contracts', label: 'سجل العقود والرواتب', icon: <FileText size={13} /> },
              { id: 'commencement', label: 'إقرارات المباشرة', icon: <Stethoscope size={13} /> },
              { id: 'onboarding', label: 'خطة التهيئة', icon: <Rocket size={13} /> },
              { id: 'orgchart', label: 'الهيكل التنظيمي', icon: <Network size={13} /> },
            ]}
            activeTabId={activeTab === 'directory' ? 'directory' : ''}
            activeMoreId={activeTab !== 'directory' ? activeTab : undefined}
            onTabChange={(id) => onTabChange(id as EmployeesWorkspaceTab)}
            onMoreChange={(id) => onTabChange(id as EmployeesWorkspaceTab)}
            onMoreMenuOpenChange={setWorkspaceMoreOpen}
          />
        </div>

        <div
          className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3 ${
            workspaceMoreOpen ? 'pointer-events-none select-none' : ''
          }`}
        >
          <div className="odoo-workspace-inner w-full max-w-[1600px] mx-auto px-4 md:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
