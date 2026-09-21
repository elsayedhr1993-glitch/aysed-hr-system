import React, { useRef, useEffect } from 'react';
import {
  Users,
  Search,
  X,
  UserPlus,
  ChevronDown,
  LayoutGrid,
  List,
  ArrowRight,
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
    <div className="flex-1 flex flex-col w-full min-h-0 bg-slate-100/40">
      {/* مسار التنقل */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2 mb-2 shadow-2xs">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
          <Users size={14} className="text-[#714B67] shrink-0" />
          <span className="text-slate-500">شؤون الموظفين</span>
          <span className="text-slate-300">/</span>
          {activeTab !== 'directory' && (
            <>
              <button
                type="button"
                onClick={() => onTabChange('directory')}
                className="text-[#714B67] hover:underline cursor-pointer"
              >
                الدليل
              </button>
              <span className="text-slate-300">/</span>
            </>
          )}
          <span className="text-slate-900">{breadcrumbTail}</span>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md truncate max-w-[200px]">
            {companyLabel}
          </span>
        </nav>
      </div>

      {/* شريط التحكم */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 mb-2 shadow-2xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-sm font-black text-slate-900">دليل الموظفين</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">سجل الكوادر — عرض Odoo 18</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <ScreenLayoutStudioToggle screenId="employees" layout={employeesLayout} />
            <button
              type="button"
              onClick={onCreateEmployee}
              className="bg-[#714B67] hover:bg-[#5b3c53] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <UserPlus size={14} />
              موظف جديد
            </button>
            <div className="relative" ref={actionsRef}>
              <button
                type="button"
                onClick={() => onActionsMenuOpenChange(!actionsMenuOpen)}
                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-50"
              >
                إجراءات
                <ChevronDown size={13} className={`text-slate-400 transition ${actionsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {actionsMenuOpen && actionsMenu}
            </div>
            {showViewToggle && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/90">
                <button
                  type="button"
                  onClick={() => onViewModeChange('cards')}
                  className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'cards' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-400'}`}
                  title="بطاقات"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-400'}`}
                  title="جدول"
                >
                  <List size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <CompactTabBar
          tabs={[
            { id: 'directory', label: 'دليل الموظفين', shortLabel: 'الدليل', icon: <Users size={15} /> },
          ]}
          moreItems={[
            { id: 'contracts', label: 'سجل العقود والرواتب', icon: <FileText size={14} /> },
            { id: 'commencement', label: 'إقرارات المباشرة', icon: <Stethoscope size={14} /> },
            { id: 'onboarding', label: 'خطة التهيئة', icon: <Rocket size={14} /> },
            { id: 'orgchart', label: 'الهيكل التنظيمي', icon: <Network size={14} /> },
          ]}
          activeTabId={activeTab === 'directory' ? 'directory' : ''}
          activeMoreId={activeTab !== 'directory' ? activeTab : undefined}
          onTabChange={(id) => onTabChange(id as EmployeesWorkspaceTab)}
          onMoreChange={(id) => onTabChange(id as EmployeesWorkspaceTab)}
        />

        {showDirectoryTools && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <div className="relative flex-1 min-w-[180px] max-w-xl">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="بحث: الاسم، المدني، المسمى..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-8 py-1.5 text-xs focus:bg-white focus:border-[#714B67] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <select
              value={selectedDept || ''}
              onChange={(e) => onDeptChange(e.target.value || null)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs cursor-pointer shrink-0"
            >
              <option value="">كل الأقسام</option>
              {allDepts.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={selectedStatus || ''}
              onChange={(e) => onStatusChange(e.target.value || null)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs cursor-pointer shrink-0"
            >
              <option value="">كل الحالات</option>
              <option value="على رأس العمل">على رأس العمل</option>
              <option value="في إجازة">في إجازة</option>
              <option value="قيد التعيين">قيد التعيين</option>
            </select>
          </div>
        )}
      </div>

      {kpiBar}

      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
};

export const EmployeesSubModuleBanner: React.FC<{
  activeTab: Exclude<EmployeesWorkspaceTab, 'directory'>;
  onBack: () => void;
}> = ({ activeTab, onBack }) => (
  <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2 mb-2 flex items-center justify-between shadow-2xs">
    <button
      type="button"
      onClick={onBack}
      className="text-xs font-bold text-[#714B67] flex items-center gap-1.5 cursor-pointer hover:underline"
    >
      <ArrowRight size={14} />
      العودة للدليل
    </button>
    <span className="text-[11px] text-slate-500">{SUB_MODULE_LABELS[activeTab]}</span>
  </div>
);
