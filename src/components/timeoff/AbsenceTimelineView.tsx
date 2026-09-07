import React, { useState, useMemo } from 'react';
import { Calendar, Users, Filter, AlertTriangle, ShieldCheck, Clock, ChevronRight, ChevronLeft, Info, CheckCircle2 } from 'lucide-react';
import { LeaveRequest } from '../OdooTimeOffApp';

interface AbsenceTimelineViewProps {
  requests: LeaveRequest[];
  totalEmployeesCount: number;
  onSelectRequest?: (req: LeaveRequest) => void;
}

export const AbsenceTimelineView: React.FC<AbsenceTimelineViewProps> = ({
  requests,
  totalEmployeesCount,
  onSelectRequest
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [timelineWindow, setTimelineWindow] = useState<'week' | 'fortnight' | 'month'>('fortnight');
  const [baseDate, setBaseDate] = useState<Date>(new Date());

  // Available departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set);
  }, [requests]);

  // Generate days array based on timelineWindow
  const daysCount = timelineWindow === 'week' ? 7 : timelineWindow === 'fortnight' ? 14 : 30;
  
  const timelineDates = useMemo(() => {
    const dates: { dateStr: string; dayName: string; dayNum: number; isToday: boolean; isFriday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      dates.push({
        dateStr,
        dayName: arabicDays[dayOfWeek],
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
        isFriday: dayOfWeek === 5,
      });
    }
    return dates;
  }, [baseDate, daysCount]);

  // Filter requests that fall within the timeline window and status is active (approved, pending_manager, pending_hr)
  const activeRequests = useMemo(() => {
    const windowStart = timelineDates[0]?.dateStr || '';
    const windowEnd = timelineDates[timelineDates.length - 1]?.dateStr || '';

    return requests.filter(r => {
      if (r.status === 'rejected' || r.status === 'returned') return false;
      if (selectedDept !== 'ALL' && r.department !== selectedDept) return false;
      // overlap condition with timeline window:
      return r.startDate <= windowEnd && r.endDate >= windowStart;
    });
  }, [requests, timelineDates, selectedDept]);

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const currentlyOnLeaveCount = requests.filter(r => 
    r.status === 'approved' && r.startDate <= todayStr && r.endDate >= todayStr
  ).length;

  const presenceRate = totalEmployeesCount > 0
    ? Math.max(0, Math.round(((totalEmployeesCount - currentlyOnLeaveCount) / totalEmployeesCount) * 100))
    : 100;

  // Overlap detection in activeRequests
  const overlaps = useMemo(() => {
    const conflictingPairs: { req1: LeaveRequest; req2: LeaveRequest; department: string }[] = [];
    for (let i = 0; i < activeRequests.length; i++) {
      for (let j = i + 1; j < activeRequests.length; j++) {
        const r1 = activeRequests[i];
        const r2 = activeRequests[j];
        if (r1.department && r1.department === r2.department) {
          if (r1.startDate <= r2.endDate && r1.endDate >= r2.startDate) {
            conflictingPairs.push({ req1: r1, req2: r2, department: r1.department });
          }
        }
      }
    }
    return conflictingPairs;
  }, [activeRequests]);

  const handlePrev = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - (timelineWindow === 'week' ? 7 : 14));
    setBaseDate(d);
  };

  const handleNext = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + (timelineWindow === 'week' ? 7 : 14));
    setBaseDate(d);
  };

  const handleToday = () => {
    setBaseDate(new Date());
  };

  return (
    <div className="space-y-4 text-right font-sans" dir="rtl">
      
      {/* Top Controls & Metrics Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block font-medium">في إجازة اليوم</span>
            <span className="text-xl font-black text-[#714B67] font-mono">{currentlyOnLeaveCount}</span>
            <span className="text-[10px] text-slate-400 block">موظف مجاز حالياً</span>
          </div>
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <Users size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block font-medium">نسبة تواجد الكادر</span>
            <span className="text-xl font-black text-emerald-700 font-mono">{presenceRate}%</span>
            <span className="text-[10px] text-emerald-600 block">تغطية تشغيلية مستقرة</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block font-medium">إجمالي الإجازات المعروضة</span>
            <span className="text-xl font-black text-slate-800 font-mono">{activeRequests.length}</span>
            <span className="text-[10px] text-slate-400 block">ضمن نافذة العرض المحددة</span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
            <Calendar size={20} />
          </div>
        </div>

        {/* Metric 4: Overlaps */}
        <div className={`border p-3.5 rounded-xl shadow-2xs flex items-center justify-between transition ${
          overlaps.length > 0 ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div>
            <span className="text-[11px] block font-medium">تداخلات الأقسام المرصودة</span>
            <span className={`text-xl font-black font-mono ${overlaps.length > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
              {overlaps.length}
            </span>
            <span className="text-[10px] block">
              {overlaps.length > 0 ? 'تنبيه: إجازات متزامنة بنفس القسم' : 'لا يوجد تعارض بالأقسام'}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl ${overlaps.length > 0 ? 'bg-amber-200/60 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
            <AlertTriangle size={20} />
          </div>
        </div>

      </div>

      {/* Overlap alert banner if any */}
      {overlaps.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>تنبيه تداخل مواعيد:</strong> يوجد تعارض بين ({overlaps[0].req1.employeeName}) و ({overlaps[0].req2.employeeName}) في قسم ({overlaps[0].department}). يرجى التحقق من توزيع المهام.
            </span>
          </div>
          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            {overlaps.length} تعارض
          </span>
        </div>
      )}

      {/* Timeline Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="الفترة السابقة"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-100 hover:bg-[#714B67] hover:text-white rounded-lg font-bold text-slate-700 transition cursor-pointer"
          >
            اليوم
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="الفترة القادمة"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-slate-500 font-mono text-[11px] pr-2">
            من: <strong className="text-slate-800">{timelineDates[0]?.dateStr}</strong> إلى: <strong className="text-slate-800">{timelineDates[timelineDates.length - 1]?.dateStr}</strong>
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Department filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Filter size={13} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 font-bold">القسم:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none text-xs"
            >
              <option value="ALL">كل الأقسام</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Time Window toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setTimelineWindow('week')}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                timelineWindow === 'week' ? 'bg-[#714B67] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أسبوع (7 أيام)
            </button>
            <button
              type="button"
              onClick={() => setTimelineWindow('fortnight')}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                timelineWindow === 'fortnight' ? 'bg-[#714B67] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 يوم
            </button>
            <button
              type="button"
              onClick={() => setTimelineWindow('month')}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                timelineWindow === 'month' ? 'bg-[#714B67] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهر كامل
            </button>
          </div>
        </div>

      </div>

      {/* --- TIMELINE MATRIX / GANTT TABLE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px]">
                <th className="p-3 font-bold text-slate-700 w-52 sticky right-0 bg-slate-50 z-10 border-l border-slate-200">
                  الموظف والقسم
                </th>
                {timelineDates.map((td) => (
                  <th
                    key={td.dateStr}
                    className={`p-2 text-center font-mono border-l border-slate-100 ${
                      td.isToday 
                        ? 'bg-purple-100/70 text-[#714B67] font-black' 
                        : td.isFriday 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'text-slate-600'
                    }`}
                  >
                    <span className="block text-[10px] font-sans font-normal">{td.dayName}</span>
                    <span className="block text-xs font-bold">{td.dayNum}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {activeRequests.length === 0 ? (
                <tr>
                  <td colSpan={timelineDates.length + 1} className="p-8 text-center text-slate-400">
                    <Calendar size={28} className="mx-auto text-slate-300 mb-2" />
                    لا توجد إجازات مجدولة في هذه الفترة ضمن القسم المختار.
                  </td>
                </tr>
              ) : (
                activeRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition group">
                    
                    {/* Employee Info Header (Sticky Right) */}
                    <td className="p-3 sticky right-0 bg-white group-hover:bg-slate-50/80 z-10 border-l border-slate-200">
                      <div className="font-bold text-slate-900 text-xs">{req.employeeName}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>{req.department}</span>
                        <span className="font-mono text-purple-900 font-bold">{req.daysCount} يوم</span>
                      </div>
                      {req.replacementEmployee && (
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          البديل: {req.replacementEmployee}
                        </div>
                      )}
                    </td>

                    {/* Timeline Day Cells */}
                    {timelineDates.map((td) => {
                      const isCovered = td.dateStr >= req.startDate && td.dateStr <= req.endDate;
                      const isStart = td.dateStr === req.startDate;
                      const isEnd = td.dateStr === req.endDate;

                      return (
                        <td
                          key={td.dateStr}
                          className={`p-1 text-center border-l border-slate-100 transition relative ${
                            td.isToday ? 'bg-purple-50/30' : td.isFriday ? 'bg-slate-50/60' : ''
                          }`}
                        >
                          {isCovered && (
                            <div
                              onClick={() => onSelectRequest && onSelectRequest(req)}
                              className={`h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-2xs cursor-pointer transition hover:opacity-90 ${
                                req.leaveType === 'annual'
                                  ? 'bg-emerald-600'
                                  : req.leaveType === 'sick'
                                    ? 'bg-blue-600'
                                    : req.leaveType === 'maternity'
                                      ? 'bg-pink-600'
                                      : 'bg-[#714B67]'
                              } ${isStart ? 'rounded-r-lg font-mono' : ''} ${isEnd ? 'rounded-l-lg' : ''}`}
                              title={`${req.employeeName} - ${req.leaveType} (${req.startDate} إلى ${req.endDate})`}
                            >
                              {isStart && <span className="text-[9px] px-1 truncate">إجازة</span>}
                            </div>
                          )}
                        </td>
                      );
                    })}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">دليل الألوان:</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
              سنوية (Annual)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
              مرضية (Sick)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-pink-600 inline-block"></span>
              وضع وأمومة (Maternity)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#714B67] inline-block"></span>
              أخرى
            </span>
          </div>
          <span className="text-slate-400">
            * أيام الجمعة مظللة بالرمادي وتستبعد تلقائياً من احتساب الرصيد.
          </span>
        </div>

      </div>

    </div>
  );
};
