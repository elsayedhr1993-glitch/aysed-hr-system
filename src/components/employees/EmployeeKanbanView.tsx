import React from 'react';
import { Phone, Mail, Trash2, Edit3, Printer, ExternalLink } from 'lucide-react';
import { EmployeeProfile } from '../OdooEmployeesDirectoryApp';
import { getDepartmentColorStyle } from '../../utils/odooPalette';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';

interface EmployeeKanbanViewProps {
  employees: EmployeeProfile[];
  onSelectEmployee: (employee: EmployeeProfile) => void;
  onDeleteEmployee: (employee: EmployeeProfile) => void;
}

export const EmployeeKanbanView: React.FC<EmployeeKanbanViewProps> = ({
  employees,
  onSelectEmployee,
  onDeleteEmployee,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-right dir-rtl" dir="rtl">
      {employees.map((emp) => {
        const gross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + (emp.medicalAllowance || 0);
        const deptStyle = getDepartmentColorStyle(emp.department, emp.jobTitle);

        return (
          <div
            key={emp.id}
            onClick={() => onSelectEmployee(emp)}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#714B67] opacity-0 group-hover:opacity-100 transition"></div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 overflow-hidden">
                  <div className={`w-12 h-12 rounded-2xl ${emp.avatarBg || 'bg-[#714B67]'} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                    {emp.name.slice(0, 2)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#714B67] transition truncate">
                      {emp.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                      {emp.jobTitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-md font-bold border ${deptStyle.badgeBg}`}>
                        <span>{deptStyle.icon}</span>
                        <span>{emp.department}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-md font-bold border bg-purple-50 text-purple-900 border-purple-200 font-mono">
                        🏢 companyId: {emp.companyId || (emp as any).company_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Quick Actions */}
                <div 
                  className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => safePrintAction(`بطاقة الموظف - ${emp.name}`)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    title="طباعة بطاقة الموظف"
                  >
                    <Printer size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteEmployee(emp)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="حذف الموظف"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone size={12} className="text-slate-400" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail size={12} className="text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-400 font-mono">{emp.id}</span>
              <span className="font-black text-slate-900 font-mono">{gross.toFixed(3)} د.ك</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
