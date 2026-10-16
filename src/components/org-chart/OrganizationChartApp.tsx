import React, { useMemo, useState, useCallback } from 'react';
import { Company } from '../../types';
import {
  buildOrgChart,
  collectSubtreeIds,
  employeeMatchesOrgSearch,
  findNodeById,
  flattenOrgTreeForPrint,
  getManagerChain,
  OrgChartNode,
} from '../../utils/orgChartUtils';
import { OrganizationChartPrintModal } from './OrganizationChartPrintModal';
import { exportToExcel } from '../../utils/exportUtils';
import { diagnoseOrgRoots } from '../../utils/orgRootDiagnosis';
import { resolveEmployeeAvatarUrl } from '../../utils/employeeAvatar';
import { Avatar } from '../ui';
import { PageHeader } from '../ui/PageHeader';
import { FilterBar } from '../ui/FilterBar';
import {
  Network,
  ChevronDown,
  ChevronLeft,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCompanyForPrint } from '../../hooks/useCompanyForPrint';

interface OrganizationChartAppProps {
  employees: Array<Record<string, unknown>>;
  activeCompany: Company;
}

export const OrganizationChartApp: React.FC<OrganizationChartAppProps> = ({
  employees,
  activeCompany,
}) => {
  const { company: companyForPrint } = useCompanyForPrint();
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [zoom, setZoom] = useState(1);
  const [showPrint, setShowPrint] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  const diagnosis = useMemo(() => diagnoseOrgRoots(employees), [employees]);

  const chart = useMemo(
    () => buildOrgChart(employees, { departmentFilter }),
    [employees, departmentFilter]
  );

  const matchedEmployeeId = useMemo(() => {
    const q = searchTerm.trim();
    if (!q) return null;
    const hit = employees.find(e => employeeMatchesOrgSearch(e, q));
    return hit ? String(hit.id) : null;
  }, [employees, searchTerm]);

  const focusId = highlightId || matchedEmployeeId;

  const managerChain = useMemo(() => {
    if (!focusId || !chart.byId.has(focusId)) return [];
    return getManagerChain(focusId, chart.byId);
  }, [focusId, chart.byId]);

  const expandPathTo = useCallback(
    (targetId: string) => {
      const chain = getManagerChain(targetId, chart.byId);
      setCollapsed(prev => {
        const next = new Set(prev);
        for (const node of chain) next.delete(node.id);
        const subtree = findNodeById(chart.roots, targetId);
        if (subtree) {
          for (const id of collectSubtreeIds(subtree)) next.delete(id);
        }
        return next;
      });
      setHighlightId(targetId);
    },
    [chart.byId, chart.roots]
  );

  const toggleCollapse = (nodeId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const scopeLabel =
    departmentFilter === 'ALL'
      ? 'المنشأة — جميع الأقسام'
      : `قسم: ${departmentFilter}`;

  const printLines = useMemo(() => flattenOrgTreeForPrint(chart.roots), [chart.roots]);

  const handleExportExcel = () => {
    if (printLines.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    const rows = printLines.map((line, idx) => ({
      م: idx + 1,
      الاسم: line.name,
      'المسمى الوظيفي': line.jobTitle,
      القسم: line.department,
      الرمز: line.employeeCode,
      المستوى: line.depth + 1,
    }));
    const name = activeCompany?.nameAr || activeCompany?.name || 'المنشأة';
    exportToExcel(rows, `الهيكل_التنظيمي_${name}_${new Date().toISOString().split('T')[0]}`, 'الهيكل التنظيمي');
  };

  const RenderNode: React.FC<{ node: OrgChartNode; colorIndex: number }> = ({ node, colorIndex }) => {
    const isCollapsed = collapsed.has(node.id);
    const isFocused = focusId === node.id;
    const inChain = managerChain.some(n => n.id === node.id);
    const hasChildren = node.children.length > 0;
    const photo = resolveEmployeeAvatarUrl(chart.byId.get(node.id) || {});

    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-60 bg-white rounded-2xl border-2 p-3.5 text-right transition relative z-10 ${
            isFocused
              ? 'border-amber-500 shadow-lg ring-4 ring-amber-200/80'
              : inChain
                ? 'border-primary shadow-md'
                : 'border-slate-300 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <Avatar name={node.name} src={photo || undefined} size="sm" />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-slate-900 truncate">{node.name}</h4>
              <p className="text-[10px] text-primary font-bold truncate">{node.jobTitle}</p>
            </div>
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleCollapse(node.id)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                title={isCollapsed ? 'توسيع' : 'طي'}
              >
                {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
          <div className="mt-2 text-[9px] text-slate-400 font-mono flex justify-between">
            <span>مستوى {node.depth + 1}</span>
            <span>{node.employeeCode || node.id}</span>
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            <div className="w-0.5 h-6 bg-primary/40" />
            <div className="flex justify-center relative w-full pt-3">
              {node.children.length > 1 && (
                <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-primary/40" />
              )}
              <div className="flex gap-6 flex-wrap justify-center">
                {node.children.map((child, idx) => (
                  <div key={child.id} className="relative flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-primary/40 absolute -top-3" />
                    <RenderNode node={child} colorIndex={colorIndex + 1 + idx} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const listNodes = useMemo(() => {
    const flat: OrgChartNode[] = [];
    const visit = (node: OrgChartNode) => {
      flat.push(node);
      node.children.forEach(visit);
    };
    chart.roots.forEach(visit);
    return flat;
  }, [chart.roots]);

  return (
    <div className="animate-in fade-in duration-300" dir="rtl">
      <PageHeader
        title="الهيكل التنظيمي"
        subtitle={
          diagnosis.managerFieldEmpty
            ? `${diagnosis.roots} جذر لأن حقل المدير المباشر فارغ. لم تُملأ بيانات.`
            : `${activeCompany?.nameAr || activeCompany?.name || 'المنشأة'} — ${diagnosis.employees} موظف · ${diagnosis.roots} جذر`
        }
        primaryAction={{ label: 'إظهار في الشجرة', onClick: () => matchedEmployeeId && expandPathTo(matchedEmployeeId) }}
        menu={[
          { id: 'excel', label: 'تصدير Excel', onSelect: handleExportExcel },
          { id: 'print', label: 'طباعة', onSelect: () => setShowPrint(true) },
        ]}
      />
      <FilterBar
        search={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="بحث بالاسم أو المسمى أو القسم"
        segments={[
          { id: 'tree', label: 'شجرة', count: chart.roots.length },
          { id: 'list', label: 'قائمة', count: listNodes.length },
        ]}
        activeSegment={viewMode}
        onSegment={(id) => setViewMode(id === 'list' ? 'list' : 'tree')}
        dropdowns={[
          {
            id: 'department',
            label: 'القسم',
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [{ value: 'ALL', label: 'كل الأقسام' }, ...chart.departments.map((department) => ({ value: department, label: department }))],
          },
        ]}
      />

      <div className="flex items-center gap-2 px-4 py-2">
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
          <button type="button" onClick={() => setZoom(z => Math.max(0.6, z - 0.1))} className="p-1.5 hover:bg-slate-100 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="p-1.5 hover:bg-slate-100 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {managerChain.length > 0 && focusId && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-xs flex flex-wrap items-center gap-1">
          <span className="font-bold text-purple-900">سلسلة المدراء:</span>
          {managerChain.map((n, i) => (
            <span key={n.id} className="text-purple-800">
              {i > 0 && ' ← '}
              <button type="button" className="font-bold hover:underline" onClick={() => expandPathTo(n.id)}>
                {n.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {(chart.orphans.length > 0 || chart.cycles.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            {chart.orphans.length > 0 && (
              <p>يوجد {chart.orphans.length} موظفاً بمدير غير مسجل في النطاق الحالي (يُعرضون كجذور).</p>
            )}
            {chart.cycles.length > 0 && (
              <p>تم كسر {chart.cycles.length} حلقة تبعية لحماية عرض الشجرة.</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto min-h-[420px]">
        {chart.roots.length > 0 && viewMode === 'list' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {listNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => expandPathTo(node.id)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-right"
                >
                  <Avatar name={node.name} src={resolveEmployeeAvatarUrl(chart.byId.get(node.id) || {}) || undefined} />
                  <span className="min-w-0">
                    <span className="block font-bold text-slate-900 truncate">{node.name}</span>
                    <span className="block text-[11px] text-primary font-bold truncate">{node.jobTitle}</span>
                  </span>
                </button>
            ))}
          </div>
        ) : chart.roots.length > 0 ? (
          <div
            className="flex flex-wrap justify-center gap-10 items-start origin-top transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {chart.roots.map((root, idx) => (
              <RenderNode key={root.id} node={root} colorIndex={idx} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-sm">
            <Network className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            لا يوجد موظفون لعرض الهيكل في هذا النطاق.
          </div>
        )}
      </div>

      <OrganizationChartPrintModal
        isOpen={showPrint}
        onClose={() => setShowPrint(false)}
        company={companyForPrint}
        scopeLabel={scopeLabel}
        lines={printLines}
        totalEmployees={employees.length}
        rootCount={chart.roots.length}
      />
    </div>
  );
};
