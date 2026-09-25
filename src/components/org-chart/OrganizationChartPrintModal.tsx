import React from 'react';
import { Company } from '../../types';
import { OrgChartPrintLine } from '../../utils/orgChartUtils';
import { Printer, X } from 'lucide-react';
import { OfficialA4CompanyLetterhead } from '../print/OfficialA4CompanyLetterhead';

interface OrganizationChartPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  scopeLabel: string;
  lines: OrgChartPrintLine[];
  totalEmployees: number;
  rootCount: number;
}

export const OrganizationChartPrintModal: React.FC<OrganizationChartPrintModalProps> = ({
  isOpen,
  onClose,
  company,
  scopeLabel,
  lines,
  totalEmployees,
  rootCount,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const reportRef = `ORG-${Date.now().toString().slice(-6)}`;
  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#714B67]" />
            <span className="font-bold text-slate-800 text-sm">كشف الهيكل التنظيمي (A4)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-[#714B67] hover:bg-[#5a3a51] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> طباعة / PDF
            </button>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0" id="org-chart-print-area">
          <OfficialA4CompanyLetterhead
            company={company}
            subtitle="الهيكل التنظيمي والتسلسل الإداري"
            logoClassName="w-14 h-14"
            className="mb-6"
            rightSlot={
              <div className="text-[10px] font-mono text-slate-500 shrink-0">
                <div>المرجع: {reportRef}</div>
                <div>تاريخ الإصدار: {todayStr}</div>
              </div>
            }
          />

          <div className="bg-slate-100 rounded-xl p-3 mb-6 text-xs flex flex-wrap justify-between gap-2">
            <span><strong>النطاق:</strong> {scopeLabel}</span>
            <span className="font-mono">
              الموظفون: {totalEmployees} · جذور الشجرة: {rootCount} · صفوف التقرير: {lines.length}
            </span>
          </div>

          <table className="w-full text-right text-xs border border-slate-300 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2 w-10 text-center">م</th>
                <th className="p-2">الاسم</th>
                <th className="p-2">المسمى الوظيفي</th>
                <th className="p-2">القسم</th>
                <th className="p-2 font-mono">الرمز</th>
                <th className="p-2 text-center">المستوى</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lines.map((line, idx) => (
                <tr key={`${line.employeeCode}-${idx}`} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                  <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                  <td className="p-2 font-bold" style={{ paddingRight: `${8 + line.depth * 12}px` }}>
                    {line.depth > 0 && <span className="text-slate-400 font-normal">{'└ '.repeat(1)}</span>}
                    {line.name}
                  </td>
                  <td className="p-2">{line.jobTitle}</td>
                  <td className="p-2">{line.department}</td>
                  <td className="p-2 font-mono text-[10px]">{line.employeeCode}</td>
                  <td className="p-2 text-center font-mono">{line.depth + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {lines.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">لا توجد بيانات هيكل في هذا النطاق.</p>
          )}

          <div className="grid grid-cols-2 gap-8 pt-10 mt-8 border-t border-slate-200 text-center text-xs">
            <div>
              <p className="font-bold mb-10">مدير الموارد البشرية</p>
              <p className="text-slate-400">التوقيع: ............</p>
            </div>
            <div>
              <p className="font-bold mb-10">الاعتماد الإداري</p>
              <p className="text-slate-400">التوقيع: ............</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
