import React from 'react';
import { Network, Users, Building2, User, ChevronRight, Phone, Mail, Edit3, Trash2, Printer } from 'lucide-react';
import { EmployeeProfile } from '../OdooEmployeesDirectoryApp';
import { getDepartmentColorStyle } from '../../utils/odooPalette';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';

interface EmployeeHierarchyViewProps {
  employees: EmployeeProfile[];
  onSelectEmployee: (employee: EmployeeProfile) => void;
  onDeleteEmployee: (employee: EmployeeProfile) => void;
}

export const EmployeeHierarchyView: React.FC<EmployeeHierarchyViewProps> = ({
  employees,
  onSelectEmployee,
  onDeleteEmployee,
}) => {
  // Group by Department
  const departments = Array.from(new Set(employees.map(e => e.department)));

  return (
    <div className="space-y-6 text-right dir-rtl" dir="rtl">
      {departments.map(dept => {
        const deptEmps = employees.filter(e => e.department === dept);
        const totalPayroll = deptEmps.reduce((sum, e) => sum + (e.basicSalary + e.housingAllowance + e.transportAllowance + (e.medicalAllowance || 0)), 0);
        const deptStyle = getDepartmentColorStyle(dept, '');

        return (
          <div key={dept} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Department Header */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${deptStyle.badgeBg}`}>
                  <Network className="w-5 h-5 text-[#714B67]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <span>{dept}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                      {deptEmps.length} موظف
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    الهيكل الإداري وتوزيع الكوادر الوظيفية
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-400 text-[10px]">كتلة الرواتب: </span>
                  <span className="font-mono font-bold text-emerald-800">{totalPayroll.toFixed(3)} د.ك</span>
                </div>
                <button
                  type="button"
                  onClick={() => safePrintAction(`تقرير قسم ${dept}`)}
                  className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition cursor-pointer"
                  title="طباعة تقرير القسم"
                >
                  <Printer size={14} />
                </button>
              </div>
            </div>

            {/* Department Members Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {deptEmps.map(emp => {
                const gross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + (emp.medicalAllowance || 0);

                return (
                  <div
                    key={emp.id}
                    className="p-3 bg-slate-50/60 hover:bg-white rounded-xl border border-slate-200/80 hover:border-[#714B67] transition shadow-2xs hover:shadow-md flex items-center justify-between group cursor-pointer"
                    onClick={() => onSelectEmployee(emp)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-xl ${emp.avatarBg || 'bg-[#714B67]'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                        {emp.name.slice(0, 2)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-[#714B67] transition truncate">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold truncate">
                          {emp.jobTitle}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 font-bold">
                          {gross.toFixed(3)} د.ك
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectEmployee(emp)}
                        className="p-1.5 text-slate-600 hover:text-[#714B67] hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
