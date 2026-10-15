import React, { useEffect, useMemo, useState } from 'react';
import { Users, RefreshCw, Trash2 } from 'lucide-react';
import type { EmployeeDirectoryViewRow } from '../../utils/employeeMapper';
import type {
  ActiveOnboardingDirectoryKeys,
  DirectoryKpiFilter,
} from '../../utils/filterEmployeesDirectory';
import { HeaderBar, type EmployeesDirectoryViewMode } from './HeaderBar';
import { EmployeeCard } from './EmployeeCard';
import { checkDocumentExpiry } from '../../utils/dateUtils';
import { MaskedValue } from '../security/MaskedValue';

const PAGE_SIZE = 24;

export interface EmployeesPageProps {
  employees: EmployeeDirectoryViewRow[];
  isLoading: boolean;
  viewMode: 'cards' | 'list';
  onViewModeChange: (mode: 'cards' | 'list') => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedDept: string | null;
  onDeptChange: (dept: string | null) => void;
  allDepts: string[];
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  kpiFilter: DirectoryKpiFilter;
  onKpiFilterChange: (filter: DirectoryKpiFilter) => void;
  directoryCounts: {
    total: number;
    onDuty: number;
    onLeave: number;
    residencyExpiring: number;
  };
  totalEmployeesCount: number;
  hasActiveDirectoryFilters: boolean;
  onCreateEmployee: () => void;
  onClearFilters: () => void;
  onSelectEmployee: (emp: EmployeeDirectoryViewRow) => void;
  onQuickEdit: (emp: EmployeeDirectoryViewRow) => void;
  onPrintEmployee: (emp: EmployeeDirectoryViewRow) => void;
  onDeleteEmployee: (id: string, name: string, e: React.MouseEvent) => void;
  renderStatusBadge: (emp: EmployeeDirectoryViewRow) => React.ReactNode;
  activeOnboardingKeys: ActiveOnboardingDirectoryKeys;
  scopeToggle?: React.ReactNode;
  debugStats?: React.ReactNode;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  employees,
  isLoading,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  selectedDept,
  onDeptChange,
  allDepts,
  selectedStatus,
  onStatusChange,
  kpiFilter,
  onKpiFilterChange,
  directoryCounts,
  totalEmployeesCount,
  hasActiveDirectoryFilters,
  onCreateEmployee,
  onClearFilters,
  onSelectEmployee,
  onQuickEdit,
  onPrintEmployee,
  onDeleteEmployee,
  renderStatusBadge,
  activeOnboardingKeys,
  scopeToggle,
  debugStats,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [brokenAvatarIds, setBrokenAvatarIds] = useState<Set<string>>(() => new Set());

  const headerViewMode: EmployeesDirectoryViewMode = viewMode === 'cards' ? 'kanban' : 'list';

  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, selectedDept, selectedStatus, kpiFilter, employees.length]);

  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const safePage = Math.min(pageIndex, totalPages - 1);

  const pagedEmployees = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return employees.slice(start, start + PAGE_SIZE);
  }, [employees, safePage]);

  const renderDocAlerts = (emp: EmployeeDirectoryViewRow) => {
    const civilExp =
      emp.civilIdExpiry ||
      (emp as { civilIdExpiryDate?: string }).civilIdExpiryDate ||
      (emp as { civil_id_expiry?: string }).civil_id_expiry;
    const passExp = emp.passportExpiry;
    const civilStatus = checkDocumentExpiry(civilExp, 'البطاقة المدنية');
    const passStatus = checkDocumentExpiry(passExp, 'جواز السفر');
    const hasDocAlert =
      civilStatus.isExpired ||
      civilStatus.isExpiringSoon ||
      passStatus.isExpired ||
      passStatus.isExpiringSoon;
    if (!hasDocAlert) return null;
    return (
      <div className="px-3 pb-3 pt-0 space-y-1.5 border-t border-slate-100">
        {civilStatus.isExpired && (
          <p className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
            ⚠️ البطاقة المدنية منتهية
          </p>
        )}
        {!civilStatus.isExpired && civilStatus.isExpiringSoon && (
          <p className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            ⏰ البطاقة المدنية تنتهي خلال {civilStatus.daysRemaining} يوم
          </p>
        )}
        {passStatus.isExpired && (
          <p className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
            ⚠️ جواز السفر منتهي
          </p>
        )}
        {!passStatus.isExpired && passStatus.isExpiringSoon && (
          <p className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            ⏰ جواز السفر ينتهي خلال {passStatus.daysRemaining} يوم
          </p>
        )}
      </div>
    );
  };

  const cardMenu = (emp: EmployeeDirectoryViewRow) => (
    <div className="w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-0.5 animate-in fade-in duration-100">
      <button
        type="button"
        onClick={() => {
          setActiveCardMenuId(null);
          onSelectEmployee(emp);
        }}
        className="w-full text-right px-2.5 py-1.5 hover:bg-purple-50 hover:text-primary rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
      >
        عرض الملف الكامل
      </button>
      <button
        type="button"
        onClick={() => {
          setActiveCardMenuId(null);
          onQuickEdit(emp);
        }}
        className="w-full text-right px-2.5 py-1.5 hover:bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium cursor-pointer"
      >
        تعديل سريع
      </button>
      <button
        type="button"
        onClick={() => {
          setActiveCardMenuId(null);
          onPrintEmployee(emp);
        }}
        className="w-full text-right px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
      >
        طباعة الملف
      </button>
      <div className="border-t border-slate-100 my-0.5" />
      <button
        type="button"
        onClick={(e) => {
          setActiveCardMenuId(null);
          onDeleteEmployee(emp.id, emp.nameAr, e);
        }}
        className="w-full text-right px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
      >
        <Trash2 size={13} />
        حذف الموظف
      </button>
    </div>
  );

  return (
    <div className="odoo-employees-page w-full">
      {(scopeToggle || debugStats) && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-0.5">
          {scopeToggle}
          {debugStats}
        </div>
      )}

      <HeaderBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        viewMode={headerViewMode}
        onViewModeChange={(m) => onViewModeChange(m === 'kanban' ? 'cards' : 'list')}
        onNewEmployee={onCreateEmployee}
        resultCount={employees.length}
        pageIndex={safePage}
        pageSize={PAGE_SIZE}
        onPageIndexChange={setPageIndex}
        selectedDept={selectedDept}
        onDeptChange={onDeptChange}
        allDepts={allDepts}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
        kpiFilter={kpiFilter}
        onKpiFilterChange={onKpiFilterChange}
        directoryCounts={directoryCounts}
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center">
          <RefreshCw size={22} className="text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">جاري تحميل دليل الموظفين...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary mx-auto flex items-center justify-center mb-4">
            <Users size={28} strokeWidth={1.5} />
          </div>
          {totalEmployeesCount === 0 && !hasActiveDirectoryFilters ? (
            <>
              <h3 className="text-sm font-bold text-slate-800 mb-1">الدليل فارغ</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto leading-relaxed">
                لا يوجد موظفون مسجلون لهذه المنشأة بعد. ابدأ بإضافة أول موظف.
              </p>
              <button
                type="button"
                onClick={onCreateEmployee}
                className="bg-primary hover:bg-[#5b3c53] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                إضافة موظف جديد
              </button>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-slate-800 mb-1">لا نتائج مطابقة</h3>
              <p className="text-xs text-slate-500 mb-3">جرّب تعديل البحث أو الفلاتر.</p>
              <button
                type="button"
                onClick={onClearFilters}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                إعادة تعيين الفلاتر
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="odoo-kanban-grid auto-rows-fr gap-3">
          {pagedEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              activeOnboardingKeys={activeOnboardingKeys}
              statusBadge={renderStatusBadge(emp)}
              menuOpen={activeCardMenuId === emp.id}
              onMenuToggle={() => setActiveCardMenuId(activeCardMenuId === emp.id ? null : emp.id)}
              menuContent={cardMenu(emp)}
              avatarBroken={brokenAvatarIds.has(emp.id)}
              onAvatarBroken={() =>
                setBrokenAvatarIds((prev) => {
                  const next = new Set(prev);
                  next.add(emp.id);
                  return next;
                })
              }
              onSelect={() => onSelectEmployee(emp)}
              docAlerts={renderDocAlerts(emp)}
            />
          ))}
        </div>
      ) : (
        <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#f8f9fa] text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">الموظف</th>
                <th className="p-3">البريد / الهاتف</th>
                <th className="p-3">المسمى والقسم</th>
                <th className="p-3">الرقم المدني</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => onSelectEmployee(emp)}
                >
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{emp.nameAr || emp.fullNameAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{emp.id}</div>
                  </td>
                  <td className="p-3 text-slate-600">
                    <div className="truncate max-w-[180px]">{emp.email || '—'}</div>
                    <div className="font-mono text-[10px] text-slate-500" dir="ltr">{emp.phone || '—'}</div>
                  </td>
                  <td className="p-3 text-slate-700">
                    <div className="font-medium">{emp.jobTitle}</div>
                    <div className="text-[10px] text-slate-400">{emp.dept || emp.department}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-600"><MaskedValue kind="civil" value={emp.civilId} fallback={'—'} /></td>
                  <td className="p-3">{renderStatusBadge(emp)}</td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onQuickEdit(emp)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
