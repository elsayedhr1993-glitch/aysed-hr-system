import React from 'react';
import { 
  Network, 
  Users, 
  Building2, 
  Briefcase
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';

interface OrgNode {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  phone?: string;
  email?: string;
  avatarBg?: string;
  subordinates?: OrgNode[];
}

export const OdooOrgChartView: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees } = useOdooHierarchy();

  // بناء الهيكل التنظيمي ديناميكياً من الموظفين الفعليين في قاعدة البيانات
  const buildDynamicOrgTree = (): OrgNode | null => {
    if (!employees || employees.length === 0) return null;

    const colors = ['bg-[#714B67]', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600'];

    // إذا وُجد مدير أو موظف أول نجعله الجذع الرئيسي
    const rootEmp = employees[0];
    const otherEmployees = employees.slice(1);

    const companyCode = (activeCompany as any)?.code || activeCompany?.id || 'company';

    const rootNode: OrgNode = {
      id: rootEmp.id,
      name: rootEmp.name,
      jobTitle: rootEmp.jobTitle || 'المسؤول الإداري',
      department: rootEmp.department || 'الإدارة العامة',
      phone: (rootEmp as any).phone || '+965 ----',
      email: (rootEmp as any).email || `${rootEmp.id.toLowerCase()}@${companyCode.toLowerCase()}.com`,
      avatarBg: colors[0],
      subordinates: otherEmployees.map((emp, idx) => ({
        id: emp.id,
        name: emp.name,
        jobTitle: emp.jobTitle || 'موظف',
        department: emp.department || 'القسم',
        phone: (emp as any).phone || '+965 ----',
        email: (emp as any).email || `${emp.id.toLowerCase()}@${companyCode.toLowerCase()}.com`,
        avatarBg: colors[(idx + 1) % colors.length]
      }))
    };

    return rootNode;
  };

  const orgData = buildDynamicOrgTree();

  // بطاقة الموظف الشجرية
  const RenderEmployeeCard = ({ node, isRoot = false }: { node: OrgNode; isRoot?: boolean }) => {
    return (
      <div className="flex flex-col items-center">
        {/* بطاقة الموظف */}
        <div className={`w-64 bg-white rounded-2xl border-2 ${isRoot ? 'border-[#714B67] shadow-md ring-4 ring-[#714B67]/10' : 'border-slate-300 shadow-sm'} p-4 text-right transition hover:shadow-lg relative z-10`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${node.avatarBg || 'bg-[#714B67]'} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
              {node.name.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs text-slate-900 truncate">{node.name}</h4>
              <p className="text-[10px] text-[#714B67] font-bold truncate">{node.jobTitle}</p>
              <span className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono mt-1">
                {node.department}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>{node.phone || 'N/A'}</span>
            <span className="bg-purple-100 text-[#714B67] px-1.5 py-0.5 rounded font-bold">{node.id}</span>
          </div>
        </div>

        {/* خطوط الشجرة الواضحة */}
        {node.subordinates && node.subordinates.length > 0 && (
          <div className="flex flex-col items-center w-full">
            {/* خط رأسي من المدير */}
            <div className="w-1 h-8 bg-[#714B67]/40"></div>

            {/* المسار الأفقي */}
            <div className="flex justify-center relative w-full pt-4">
              {node.subordinates.length > 1 && (
                <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-[#714B67]/40"></div>
              )}
              
              <div className="flex gap-10 flex-wrap justify-center">
                {node.subordinates.map((child) => (
                  <div key={child.id} className="relative flex flex-col items-center">
                    <div className="w-1 h-4 bg-[#714B67]/40 absolute -top-4"></div>
                    <RenderEmployeeCard node={child} />
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
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">الهيكل التنظيمي والشجري (Odoo Org Chart)</h1>
            <p className="text-xs text-slate-500 font-medium">
              المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || activeCompany?.name || 'المنشأة النشطة'}</strong> | عرض تسلسل التبعية الإدارية والمستويات الإشرافية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <Users size={14} /> {employees.length} موظف مسجل
          </span>
        </div>
      </div>

      {/* شجرة الهيكل التنظيمي */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto min-h-[480px] flex justify-center items-start">
        {orgData ? (
          <RenderEmployeeCard node={orgData} isRoot={true} />
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center my-auto">
            <Network className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">لا يوجد موظفون لعرض الهيكل التنظيمي</h3>
            <p className="text-xs text-slate-500 max-w-md">
              قاعدة البيانات خالية حالياً. سيتم بناء المخطط الشجري وتحديث التبعيات تلقائياً فور تسجيل موظفين في النظام.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OdooOrgChartView;
