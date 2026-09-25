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
import {
  Network,
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  Printer,
  FileSpreadsheet,
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

const CARD_COLORS = ['bg-[#714B67]', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600'];

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
    const color = CARD_COLORS[colorIndex % CARD_COLORS.length];

    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-60 bg-white rounded-2xl border-2 p-3.5 text-right transition relative z-10 ${
            isFocused
              ? 'border-amber-500 shadow-lg ring-4 ring-amber-200/80'
              : inChain
                ? 'border-[#714B67] shadow-md'
                : 'border-slate-300 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl ${color} text-white flex items-center justify-center font-bold text-xs shrink-0`}
            >
              {node.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-slate-900 truncate">{node.name}</h4>
              <p className="text-[10px] text-[#714B67] font-bold truncate">{node.jobTitle}</p>
              <span className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono mt-1">
                {node.department}
              </span>
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
            <div className="w-0.5 h-6 bg-[#714B67]/40" />
            <div className="flex justify-center relative w-full pt-3">
              {node.children.length > 1 && (
                <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-[#714B67]/40" />
              )}
              <div className="flex gap-6 flex-wrap justify-center">
                {node.children.map((child, idx) => (
                  <div key={child.id} className="relative flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-[#714B67]/40 absolute -top-3" />
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

  return (
    <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">الهيكل التنظيمي</h2>
            <p className="text-[11px] text-slate-500">
              {activeCompany?.nameAr || activeCompany?.name || 'المنشأة'} — بناء تلقائي من المدير المباشر (
              <span className="font-mono">parentId</span>)
            </p>
          </div>
        </div>
        <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 inline-flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {employees.length} موظف · {chart.roots.length} جذر
        </span>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && matchedEmployeeId) expandPathTo(matchedEmployeeId);
            }}
            placeholder="بحث عن موظف (اسم، رمز، قسم...)"
            className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#714B67]/30 focus:border-[#714B67]"
          />
        </div>
        <button
          type="button"
          disabled={!matchedEmployeeId}
          onClick={() => matchedEmployeeId && expandPathTo(matchedEmployeeId)}
          className="px-3 py-2 text-xs font-bold rounded-lg bg-[#714B67] text-white disabled:opacity-40"
        >
          إظهار في الشجرة
        </button>
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold bg-slate-50"
          >
            <option value="ALL">كل الأقسام</option>
            {chart.departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
          <button type="button" onClick={() => setZoom(z => Math.max(0.6, z - 0.1))} className="p-1.5 hover:bg-slate-100 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="p-1.5 hover:bg-slate-100 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="px-3 py-2 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1"
        >
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
        <button
          type="button"
          onClick={() => setShowPrint(true)}
          className="px-3 py-2 text-xs font-bold rounded-lg bg-[#714B67] text-white flex items-center gap-1"
        >
          <Printer className="w-4 h-4" /> طباعة A4
        </button>
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
        {chart.roots.length > 0 ? (
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
