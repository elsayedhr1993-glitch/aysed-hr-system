import React from 'react';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Printer, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertCircle,
  FileCheck,
  Building2,
  CheckSquare,
  Square
} from 'lucide-react';
import { EmployeeProfile } from '../OdooEmployeesDirectoryApp';
import { getDepartmentColorStyle } from '../../utils/odooPalette';
import { validateKuwaitCivilId } from '../../utils/kuwaitLaw';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';

interface EmployeeListViewProps {
  employees: EmployeeProfile[];
  onSelectEmployee: (employee: EmployeeProfile) => void;
  onDeleteEmployee: (employee: EmployeeProfile) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export const EmployeeListView: React.FC<EmployeeListViewProps> = ({
  employees,
  onSelectEmployee,
  onDeleteEmployee,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}) => {
  const isAllSelected = employees.length > 0 && selectedIds.length === employees.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-right dir-rtl" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-right border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-black border-b-2 border-slate-200 select-none">
              <th className="p-3 w-10 text-center">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="text-slate-500 hover:text-[#714B67] transition cursor-pointer"
                  title="تحديد الكل"
                >
                  {isAllSelected ? <CheckSquare size={16} className="text-[#714B67]" /> : <Square size={16} />}
                </button>
              </th>
              <th className="p-3 text-slate-400 font-mono w-24">الرقم</th>
              <th className="p-3">اسم الموظف</th>
              <th className="p-3">الرقم المدني (Civil ID)</th>
              <th className="p-3">المسمى والوظيفة</th>
              <th className="p-3">القسم / الإدارة</th>
              <th className="p-3">الراتب الشامل (WPS)</th>
              <th className="p-3">الإقامة / الترخيص</th>
              <th className="p-3">بيانات الاتصال</th>
              <th className="p-3 text-center w-28">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-400 font-bold">
                  لا توجد نتائج مطابقة لبحث الموظفين
                </td>
              </tr>
            ) : (
              employees.map((emp, index) => {
                const isSelected = selectedIds.includes(emp.id);
                const gross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + (emp.medicalAllowance || 0);
                const deptStyle = getDepartmentColorStyle(emp.department, emp.jobTitle);
                const civilVal = validateKuwaitCivilId(emp.civilId);
                const isZebra = index % 2 === 1;

                return (
                  <tr
                    key={emp.id}
                    className={`transition group ${
                      isSelected 
                        ? 'bg-purple-50/70 hover:bg-purple-50' 
                        : isZebra 
                          ? 'bg-slate-50/60 hover:bg-slate-100/70' 
                          : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onToggleSelect(emp.id)}
                        className="text-slate-400 hover:text-[#714B67] transition cursor-pointer"
                      >
                        {isSelected ? <CheckSquare size={16} className="text-[#714B67]" /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* ID */}
                    <td 
                      className="p-3 font-mono font-bold text-slate-600 cursor-pointer"
                      onClick={() => onSelectEmployee(emp)}
                    >
                      {emp.id}
                    </td>

                    {/* Name & Avatar */}
                    <td 
                      className="p-3 cursor-pointer"
                      onClick={() => onSelectEmployee(emp)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl ${emp.avatarBg || 'bg-[#714B67]'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                          {emp.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#714B67] transition">
                            {emp.name}
                          </div>
                          {emp.nameEn && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {emp.nameEn}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Civil ID */}
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{emp.civilId}</span>
                        {civilVal.isValid ? (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-200">
                            MOD 11 ✓
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded text-[9px] font-bold border border-amber-200">
                            غير مدقق
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Job Title */}
                    <td className="p-3 font-semibold text-slate-700">
                      {emp.jobTitle}
                    </td>

                    {/* Department */}
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-bold border ${deptStyle.badgeBg}`}>
                        <span>{deptStyle.icon}</span>
                        <span>{emp.department}</span>
                      </span>
                    </td>

                    {/* Gross Salary */}
                    <td className="p-3 font-mono font-black text-emerald-800">
                      {gross.toFixed(3)} د.ك
                    </td>

                    {/* Residency / Status */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-600 block">
                          {emp.residencyType}
                        </span>
                        {emp.mohLicenseNo && (
                          <span className="text-[9px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 inline-block font-mono">
                            MOH: {emp.mohLicenseNo}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phone & Email */}
                    <td className="p-3 text-[11px] text-slate-500 font-mono space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Phone size={11} className="text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail size={11} className="text-slate-400" />
                        <span className="truncate max-w-[130px]">{emp.email}</span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectEmployee(emp)}
                          className="p-1.5 text-slate-600 hover:text-[#714B67] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="عرض وتعديل بطاقة الموظف"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => safePrintAction(`بطاقة الموظف - ${emp.name}`)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="طباعة بطاقة الموظف"
                        >
                          <Printer size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteEmployee(emp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="حذف الموظف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
