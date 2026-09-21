import React, { useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { CompactTabBar } from '../../ui/CompactTabBar';
import { ScreenLayoutStudioToggle } from '../../studio/ScreenLayoutStudioToggle';
import type { ScreenCustomLayout } from '../../../types/customLayout';

export type EmployeesWorkspaceTab = 'directory' | 'contracts' | 'commencement' | 'onboarding' | 'orgchart';

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
  kpiBar?: React.ReactNode;
  isDirectoryLoading?: boolean;
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
  kpiBar,
  isDirectoryLoading = false,
  children,
}) => {
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actionsMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        onActionsMenuOpenChange(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [actionsMenuOpen, onActionsMenuOpenChange]);

  const breadcrumbTail =
    activeTab === 'directory'
      ? 'الدليل'
      : SUB_MODULE_LABELS[activeTab as Exclude<EmployeesWorkspaceTab, 'directory'>];

  return (
    <div className="flex-1 flex flex-col w-full min-h-0 bg-slate-50/80">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs mb-2 overflow-hidden shrink-0">
        {/* صف واحد: مسار + إجراءات */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-100">
          <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-600 min-w-0">
            <Users size={13} className="text-[#714B67] shrink-0" />
            <span className="text-slate-400">شؤون الموظفين</span>
            <span className="text-slate-200">/</span>
            {activeTab !== 'directory' && (
              <>
                <button
                  type="button"
                  onClick={() => onTabChange('directory')}
                  className="text-[#714B67] hover:underline cursor-pointer"
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
            <button
              type="button"
              onClick={onCreateEmployee}
              className="bg-[#714B67] hover:bg-[#5b3c53] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={13} />
              موظف جديد
            </button>
            <div className="relative" ref={actionsRef}>
              <button
                type="button"
                onClick={() => onActionsMenuOpenChange(!actionsMenuOpen)}
                className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-0.5 cursor-pointer hover:bg-slate-50"
              >
                إجراءات
                <ChevronDown size={12} className={`text-slate-400 transition ${actionsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {actionsMenuOpen && actionsMenu}
            </div>
            {showViewToggle && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => onViewModeChange('cards')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'cards' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-400'}`}
                  title="بطاقات"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-400'}`}
                  title="جدول"
                >
                  <List size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-2 pt-1 relative z-30">
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
          />
        </div>

        {showDirectoryTools && (
          <div
            className={`px-3 pb-2.5 pt-0 space-y-2 border-t border-slate-50 relative z-10 ${
              isDirectoryLoading ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="بحث بالاسم أو المدني..."
                  className="w-full bg-slate-50/80 border border-slate-200/80 rounded-lg pr-8 pl-7 py-1.5 text-[11px] focus:bg-white focus:border-[#714B67]/50 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchQueryChange('')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <select
                value={selectedDept || ''}
                onChange={(e) => onDeptChange(e.target.value || null)}
                className="bg-slate-50/80 border border-slate-200/80 rounded-lg px-2 py-1.5 text-[11px] cursor-pointer shrink-0 max-w-[120px]"
              >
                <option value="">الأقسام</option>
                {allDepts.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedStatus || ''}
                onChange={(e) => onStatusChange(e.target.value || null)}
                className="bg-slate-50/80 border border-slate-200/80 rounded-lg px-2 py-1.5 text-[11px] cursor-pointer shrink-0"
              >
                <option value="">الحالة</option>
                <option value="على رأس العمل">على رأس العمل</option>
                <option value="في إجازة">في إجازة</option>
                <option value="قيد التعيين">قيد التعيين</option>
              </select>
            </div>
            {kpiBar ? <div className="flex flex-wrap items-center gap-1.5">{kpiBar}</div> : null}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-0.5">{children}</div>
    </div>
  );
};
