import React, { useRef, useEffect, useState } from 'react';
import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import type { DirectoryKpiFilter } from '../../utils/filterEmployeesDirectory';

export type EmployeesDirectoryViewMode = 'kanban' | 'list';

export interface EmployeesHeaderBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  viewMode: EmployeesDirectoryViewMode;
  onViewModeChange: (mode: EmployeesDirectoryViewMode) => void;
  onNewEmployee: () => void;
  resultCount: number;
  pageIndex: number;
  pageSize: number;
  onPageIndexChange: (index: number) => void;
  selectedDept: string | null;
  onDeptChange: (dept: string | null) => void;
  allDepts: string[];
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  kpiFilter?: DirectoryKpiFilter;
  onKpiFilterChange?: (filter: DirectoryKpiFilter) => void;
  directoryCounts?: {
    total: number;
    onDuty: number;
    onLeave: number;
    residencyExpiring: number;
  };
  disabled?: boolean;
}

export const HeaderBar: React.FC<EmployeesHeaderBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
  onNewEmployee,
  resultCount,
  pageIndex,
  pageSize,
  onPageIndexChange,
  selectedDept,
  onDeptChange,
  allDepts,
  selectedStatus,
  onStatusChange,
  kpiFilter = 'all',
  onKpiFilterChange,
  directoryCounts,
  disabled = false,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const activeFacetCount =
    (selectedDept ? 1 : 0) + (selectedStatus ? 1 : 0) + (kpiFilter !== 'all' ? 1 : 0);

  useEffect(() => {
    if (!filtersOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (filtersRef.current?.contains(e.target as Node)) return;
      setFiltersOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(resultCount / pageSize));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const from = resultCount === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(resultCount, (safePage + 1) * pageSize);

  return (
    <div
      className={`odoo-employees-header flex flex-wrap items-center gap-2 py-2 px-1 border-b border-slate-200/80 mb-3 ${
        disabled ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <button
        type="button"
        onClick={onNewEmployee}
        className="shrink-0 bg-primary hover:bg-[#5b3c53] text-white border border-[#5b3c53] px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        <UserPlus size={14} />
        جديد
      </button>

      <div className="flex-1 min-w-[200px] max-w-xl relative">
        <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="بحث..."
          className="w-full h-9 bg-white border border-slate-300 rounded-md pr-8 pl-[4.25rem] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5" ref={filtersRef}>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border cursor-pointer ${
              filtersOpen || activeFacetCount > 0
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <SlidersHorizontal size={12} />
            تصفية
            {activeFacetCount > 0 ? (
              <span className="min-w-[1rem] h-4 px-1 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">
                {activeFacetCount}
              </span>
            ) : null}
          </button>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="مسح البحث"
            >
              <X size={12} />
            </button>
          ) : null}
          {filtersOpen ? (
            <div
              className="absolute top-full left-0 mt-1 z-[80] w-[min(100vw-1.5rem,20rem)] bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-right space-y-3"
              dir="rtl"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">القسم</label>
                <select
                  value={selectedDept || ''}
                  onChange={(e) => onDeptChange(e.target.value || null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-[11px] cursor-pointer"
                >
                  <option value="">كل الأقسام</option>
                  {allDepts.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {onKpiFilterChange ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1.5">الحالة</label>
                  <div className="flex flex-wrap gap-1">
                    {(
                      [
                        ['all', directoryCounts ? `الكل ${directoryCounts.total}` : 'الكل'],
                        ['on_duty', directoryCounts ? `على رأس العمل ${directoryCounts.onDuty}` : 'على رأس العمل'],
                        ['on_leave', directoryCounts ? `في إجازة ${directoryCounts.onLeave}` : 'في إجازة'],
                        ['hiring', 'قيد التعيين'],
                        ['residency', directoryCounts ? `إقامات ${directoryCounts.residencyExpiring}` : 'إقامات'],
                      ] as const
                    ).map(([id, label]) => {
                      const active =
                        id === 'all'
                          ? !selectedStatus && (!kpiFilter || kpiFilter === 'all')
                          : id === 'on_duty'
                            ? selectedStatus === 'على رأس العمل' && (!kpiFilter || kpiFilter === 'all')
                            : id === 'on_leave'
                              ? selectedStatus === 'في إجازة' && (!kpiFilter || kpiFilter === 'all')
                              : id === 'hiring'
                                ? selectedStatus === 'قيد التعيين' && (!kpiFilter || kpiFilter === 'all')
                                : kpiFilter === 'residency_expiring' && !selectedStatus;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            if (id === 'all') {
                              onStatusChange(null);
                              onKpiFilterChange('all');
                            } else if (id === 'on_duty') {
                              onStatusChange('على رأس العمل');
                              onKpiFilterChange('all');
                            } else if (id === 'on_leave') {
                              onStatusChange('في إجازة');
                              onKpiFilterChange('all');
                            } else if (id === 'hiring') {
                              onStatusChange('قيد التعيين');
                              onKpiFilterChange('all');
                            } else {
                              onStatusChange(null);
                              onKpiFilterChange('residency_expiring');
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer border ${
                            active
                              ? 'bg-primary text-white border-primary font-bold'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">الحالة</label>
                  <select
                    value={selectedStatus || ''}
                    onChange={(e) => onStatusChange(e.target.value || null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-[11px] cursor-pointer"
                  >
                    <option value="">كل الحالات</option>
                    <option value="على رأس العمل">على رأس العمل</option>
                    <option value="في إجازة">في إجازة</option>
                    <option value="قيد التعيين">قيد التعيين</option>
                  </select>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ms-auto">
        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => onViewModeChange('kanban')}
            className={`p-1.5 cursor-pointer ${viewMode === 'kanban' ? 'bg-slate-100 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
            title="Kanban"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 cursor-pointer border-r border-slate-200 ${viewMode === 'list' ? 'bg-slate-100 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
            title="List"
          >
            <List size={15} />
          </button>
        </div>

        <div className="flex items-center gap-0.5 text-[11px] text-slate-600 font-medium px-1">
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => onPageIndexChange(Math.max(0, safePage - 1))}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
          <span className="tabular-nums min-w-[4.5rem] text-center">
            {from}-{to} / {resultCount}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => onPageIndexChange(Math.min(totalPages - 1, safePage + 1))}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
