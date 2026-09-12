import React, { useMemo } from 'react';
import { 
  Calendar, Search, Download, Printer, Send, CheckCircle2, 
  AlertTriangle, DollarSign, Clock, UserCheck, UserX, ShieldCheck, 
  Sparkles, ArrowRight, Building2, TrendingUp, TrendingDown, RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { AttendanceItem } from '../Attendances';
import { getDepartmentColorStyle } from '../../utils/odooPalette';
import { buildMonthlyAttendanceSummary } from '../../utils/attendanceParser';

interface MonthlyAttendanceSummaryProps {
  employees: Array<{
    id: string;
    name: string;
    civilId?: string;
    department: string;
    jobTitle?: string;
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    medicalAllowance?: number;
    dailyHours?: number;
    employmentType?: string;
    hourlyRate?: number;
  }>;
  attendanceLogs: AttendanceItem[];
  companyName: string;
  selectedMonth: string;
  onSelectedMonthChange: (monthKey: string) => void;
  onPostToPayroll: (monthKey: string, summary: any[]) => void;
  onReopenMonth: (monthKey: string) => void;
  isMonthPosted: boolean;
  onOpenPrintModal: (data: any) => void;
}

export const MonthlyAttendanceSummary: React.FC<MonthlyAttendanceSummaryProps> = ({
  employees,
  attendanceLogs,
  companyName,
  selectedMonth,
  onSelectedMonthChange,
  onPostToPayroll,
  onReopenMonth,
  isMonthPosted,
  onOpenPrintModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('الكل');

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => set.add(e.department));
    return ['الكل', ...Array.from(set)];
  }, [employees]);

  // Compute monthly metrics per employee
  const monthlyData = useMemo(() => {
    return buildMonthlyAttendanceSummary(employees as any, attendanceLogs as any, selectedMonth);
  }, [employees, attendanceLogs, selectedMonth]);

  // Filtered rows
  const filteredData = useMemo(() => {
    let list = monthlyData;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }
    if (selectedDept !== 'الكل') {
      list = list.filter(r => r.department === selectedDept);
    }
    return list;
  }, [monthlyData, searchQuery, selectedDept]);

  // Totals for top cards
  const totalEmployees = employees.length;
  const totalActualHours = monthlyData.reduce((acc, r) => acc + r.actualHours, 0);
  const totalOvertimeHours = monthlyData.reduce((acc, r) => acc + r.overtimeHours, 0);
  const totalLateMinutes = monthlyData.reduce((acc, r) => acc + r.lateMinutes, 0);
  const totalOvertimePay = monthlyData.reduce((acc, r) => acc + r.overtimePay, 0);
  const totalDeductions = monthlyData.reduce((acc, r) => acc + r.delayDeduction + r.absenceDeduction, 0);
  const totalNetImpact = Math.round((totalOvertimePay - totalDeductions) * 1000) / 1000;

  // Export to Excel
  const handleExportExcel = () => {
    const exportRows = filteredData.map(r => ({
      'كود الموظف': r.employeeId,
      'الاسم': r.employeeName,
      'الرقم المدني': r.civilId,
      'القسم': r.department,
      'المسمى الوظيفي': r.jobTitle,
      'الراتب الشامل (د.ك)': r.grossSalary.toFixed(3),
      'أجر اليوم (د.ك)': r.dayRate.toFixed(3),
      'أيام الحضور': r.presentDays,
      'أيام الغياب': r.unexcusedAbsenceDays,
      'ساعات العمل الفعلية': r.actualHours,
      'ساعات الإضافي (OT)': r.overtimeHours,
      'استحقاق الإضافي (د.ك)': r.overtimePay.toFixed(3),
      'دقائق التأخير الصباحي': r.lateMinutes,
      'خصم التأخير والغياب (د.ك)': (r.delayDeduction + r.absenceDeduction).toFixed(3),
      'صافي التسوية للراتب (د.ك)': r.netAdjustment.toFixed(3)
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `كشف_حضور_${selectedMonth}`);
    XLSX.writeFile(wb, `Monthly_Attendance_Report_${selectedMonth}.xlsx`);
    toast.success('تم تصدير كشف الحضور والانصراف الشهري بنجاح');
  };

  return (
    <div className="space-y-4">
      
      {/* Monthly Summary Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Month Picker & Title */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Calendar size={15} className="text-[#714B67]" />
            <span className="font-bold text-slate-700">شهر التقرير:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => onSelectedMonthChange(e.target.value)}
              className="outline-none font-mono font-bold text-xs bg-transparent text-[#714B67] cursor-pointer"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            معيار الاحتساب: <strong className="text-slate-800 font-mono">26 يوم عمل</strong> (قانون العمل الكويتي رقم 6 لسنة 2010)
          </div>

          {isMonthPosted && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>تم الترحيل والاعتماد لمسير الرواتب WPS</span>
            </span>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-end">
          
          {/* Post to Payroll Button */}
          <button
            type="button"
            onClick={() => onPostToPayroll(selectedMonth, monthlyData)}
            disabled={isMonthPosted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            <span>{isMonthPosted ? 'الشهر مقفل بعد الاعتماد' : '⚡ ترحيل لمسير الرواتب (Post WPS)'}</span>
          </button>

          {isMonthPosted && (
            <button
              type="button"
              onClick={() => onReopenMonth(selectedMonth)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>فك قفل الشهر (Reopen)</span>
            </button>
          )}

          {/* Export Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Official Print A4 */}
          <button
            type="button"
            onClick={() => onOpenPrintModal({ month: selectedMonth, data: filteredData, totals: { totalActualHours, totalOvertimeHours, totalOvertimePay, totalDeductions, totalNetImpact } })}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">طباعة A4 معتمدة</span>
          </button>
        </div>

      </div>

      {/* Monthly Smart KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-bold">ساعات العمل الفعلية</div>
          <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
            {totalActualHours.toFixed(1)} <span className="text-xs text-slate-500 font-normal">ساعة</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-bold">إجمالي ساعات الإضافي</div>
          <div className="text-lg font-mono font-black text-blue-600 mt-0.5">
            +{totalOvertimeHours.toFixed(1)} <span className="text-xs text-blue-400 font-normal">ساعة</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-bold">استحقاق الإضافي (+ KD)</div>
          <div className="text-lg font-mono font-black text-emerald-600 mt-0.5">
            +{totalOvertimePay.toFixed(3)} <span className="text-xs text-emerald-500 font-normal">د.ك</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-bold">خصومات التأخير والغياب</div>
          <div className="text-lg font-mono font-black text-rose-600 mt-0.5">
            -{totalDeductions.toFixed(3)} <span className="text-xs text-rose-400 font-normal">د.ك</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-bold">صافي أثر البصمة على الرواتب</div>
          <div className={`text-lg font-mono font-black mt-0.5 ${totalNetImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {totalNetImpact >= 0 ? `+${totalNetImpact.toFixed(3)}` : totalNetImpact.toFixed(3)} <span className="text-xs text-slate-500 font-normal">د.ك</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden w-full">
        
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الكود..."
              className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#714B67]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#714B67]"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5 pr-4 whitespace-nowrap">الموظف والكود</th>
                <th className="p-3.5 whitespace-nowrap">القسم الوظيفي</th>
                <th className="p-3.5 whitespace-nowrap text-center">أيام الحضور</th>
                <th className="p-3.5 whitespace-nowrap text-center">أيام الغياب</th>
                <th className="p-3.5 whitespace-nowrap text-center">الساعات الفعلية</th>
                <th className="p-3.5 whitespace-nowrap text-center">الإضافي (OT)</th>
                <th className="p-3.5 whitespace-nowrap text-center">استحقاق الإضافي</th>
                <th className="p-3.5 whitespace-nowrap text-center">التأخير الصباحي</th>
                <th className="p-3.5 whitespace-nowrap text-center">إجمالي الخصم</th>
                <th className="p-3.5 pl-4 whitespace-nowrap text-center">صافي الأثر المالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-400">
                    لا توجد بيانات حضور مطابقة للشهر المختار
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => {
                  const deptStyle = getDepartmentColorStyle(row.department, row.jobTitle);
                  const isZebra = idx % 2 === 1;

                  return (
                    <tr key={row.employeeId} className={`hover:bg-purple-50/40 transition ${isZebra ? 'bg-slate-50/50' : 'bg-white'}`}>
                      
                      {/* Employee */}
                      <td className="p-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#714B67]/10 text-[#714B67] font-black flex items-center justify-center text-xs flex-shrink-0">
                            {row.employeeName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{row.employeeName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{row.employeeId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold border ${deptStyle.badgeBg}`}>
                          <span>{deptStyle.icon}</span>
                          <span>{row.department}</span>
                        </span>
                      </td>

                      {/* Present Days */}
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-700">
                        {row.presentDays} <span className="text-[10px] text-slate-400 font-normal">يوم</span>
                      </td>

                      {/* Absent Days */}
                      <td className="p-3.5 text-center font-mono font-bold">
                        {row.unexcusedAbsenceDays > 0 ? (
                          <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            {row.unexcusedAbsenceDays} يوم
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Actual Hours */}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                        {row.actualHours} س
                      </td>

                      {/* Overtime Hours */}
                      <td className="p-3.5 text-center font-mono font-bold">
                        {row.overtimeHours > 0 ? (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            +{row.overtimeHours} س
                          </span>
                        ) : (
                          <span className="text-slate-300">0.0</span>
                        )}
                      </td>

                      {/* Overtime Pay */}
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-700">
                        {row.overtimePay > 0 ? `+${row.overtimePay.toFixed(3)}` : '0.000'}
                      </td>

                      {/* Late Minutes */}
                      <td className="p-3.5 text-center font-mono">
                        {row.lateMinutes > 0 ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold">
                            {row.lateMinutes} د
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">0 د</span>
                        )}
                      </td>

                      {/* Total Deductions */}
                      <td className="p-3.5 text-center font-mono font-bold text-rose-600">
                        {(row.delayDeduction + row.absenceDeduction) > 0 ? (
                          `-${(row.delayDeduction + row.absenceDeduction).toFixed(3)}`
                        ) : (
                          '0.000'
                        )}
                      </td>

                      {/* Net Impact */}
                      <td className="p-3.5 pl-4 text-center font-mono font-black">
                        <span className={`px-2.5 py-1 rounded-lg border ${
                          row.netAdjustment > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          row.netAdjustment < 0 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {row.netAdjustment > 0 ? `+${row.netAdjustment.toFixed(3)}` : row.netAdjustment.toFixed(3)} د.ك
                        </span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            إجمالي موظفي المنشأة المسجلين بالكشف: <strong>{filteredData.length}</strong> موظف
          </div>
          <div className="flex items-center gap-4 font-mono font-bold text-slate-700">
            <span>إجمالي الإضافي: <strong className="text-emerald-700">+{totalOvertimePay.toFixed(3)} د.ك</strong></span>
            <span>إجمالي الخصومات: <strong className="text-rose-700">-{totalDeductions.toFixed(3)} د.ك</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
