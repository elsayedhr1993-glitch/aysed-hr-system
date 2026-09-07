import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  Info,
  Building2,
  BellRing
} from 'lucide-react';
import { PublicHoliday, HolidayDutyAssignment } from '../OdooPublicHolidaysApp';

interface HolidaysCalendarViewProps {
  holidays: PublicHoliday[];
  duties: HolidayDutyAssignment[];
  onSelectHoliday?: (holiday: PublicHoliday) => void;
  onOpenCircularModal?: (holiday: PublicHoliday) => void;
}

const MONTH_NAMES_AR = [
  'يناير (1)', 'فبراير (2)', 'مارس (3)', 'أبريل (4)', 'مايو (5)', 'يونيو (6)',
  'يوليو (7)', 'أغسطس (8)', 'سبتمبر (9)', 'أكتوبر (10)', 'نوفمبر (11)', 'ديسمبر (12)'
];

const WEEK_DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة (عطلة)', 'السبت'];

export const HolidaysCalendarView: React.FC<HolidaysCalendarViewProps> = ({
  holidays,
  duties,
  onSelectHoliday,
  onOpenCircularModal
}) => {
  // Current month view state (0-indexed: 0 = Jan, 8 = Sep 2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const currentM = new Date().getMonth();
    return currentM;
  });

  const selectedYear = 2026;

  // Selected holiday for modal/drawer detail
  const [activeHolidayDetail, setActiveHolidayDetail] = useState<PublicHoliday | null>(null);

  // Helper to get number of days in month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Helper to get starting day of week for the 1st of this month (0 = Sun, 6 = Sat)
  const firstDayOfWeek = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).getDay();
  }, [selectedYear, selectedMonth]);

  // Map dates in this month to holidays
  const holidaysByDay = useMemo(() => {
    const map = new Map<number, PublicHoliday[]>();
    
    holidays.forEach(h => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate || h.startDate);

      for (let d = 1; d <= daysInMonth; d++) {
        const checkDate = new Date(selectedYear, selectedMonth, d);
        // Normalize time
        checkDate.setHours(0, 0, 0, 0);
        const s = new Date(start);
        s.setHours(0, 0, 0, 0);
        const e = new Date(end);
        e.setHours(0, 0, 0, 0);

        if (checkDate >= s && checkDate <= e) {
          const list = map.get(d) || [];
          list.push(h);
          map.set(d, list);
        }
      }
    });

    return map;
  }, [holidays, selectedYear, selectedMonth, daysInMonth]);

  // Today marker
  const today = new Date();
  const isCurrentMonthThisYear = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;
  const todayDay = isCurrentMonthThisYear ? today.getDate() : null;

  // Next Upcoming Holiday in Kuwait
  const nextUpcomingHoliday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = holidays
      .filter(h => h.endDate >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    if (upcoming.length === 0) return holidays[0];
    return upcoming[0];
  }, [holidays]);

  // Days until next holiday
  const daysUntilNext = useMemo(() => {
    if (!nextUpcomingHoliday) return 0;
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const holidayDate = new Date(nextUpcomingHoliday.startDate);
    holidayDate.setHours(0, 0, 0, 0);
    const diffTime = holidayDate.getTime() - todayMid.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [nextUpcomingHoliday]);

  return (
    <div className="space-y-4">
      
      {/* 1. Next Upcoming Kuwait Public Holiday Spotlight Banner */}
      {nextUpcomingHoliday && (
        <div className="bg-gradient-to-r from-purple-900 via-[#714B67] to-purple-800 text-white p-5 rounded-2xl shadow-sm border border-purple-300/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/15 rounded-xl text-white mt-0.5">
              <Sparkles size={24} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-200">
                  العطلة الرسمية القادمة في دولة الكويت:
                </span>
                {daysUntilNext > 0 ? (
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    متبقي {daysUntilNext} يوماً
                  </span>
                ) : daysUntilNext === 0 ? (
                  <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    تبدأ اليوم!
                  </span>
                ) : (
                  <span className="bg-purple-200/20 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    سارية حالياً
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">{nextUpcomingHoliday.nameAr}</h2>
              <p className="text-xs text-purple-100 font-mono mt-0.5">
                تبدأ من: <strong>{nextUpcomingHoliday.startDate}</strong> إلى: <strong>{nextUpcomingHoliday.endDate}</strong> ({nextUpcomingHoliday.daysCount} أيام مدفوعة الأجر 100%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            {onOpenCircularModal && (
              <button
                type="button"
                onClick={() => onOpenCircularModal(nextUpcomingHoliday)}
                className="bg-white hover:bg-slate-50 text-[#714B67] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer w-full md:w-auto"
              >
                <BellRing size={14} /> إنشاء وطباعة التعميم الإداري
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Month Selector Navigation */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedMonth(prev => Math.max(0, prev - 1))}
            disabled={selectedMonth === 0}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 cursor-pointer"
            title="الشهر السابق"
          >
            <ChevronRight size={18} />
          </button>
          
          <div className="text-sm font-black text-slate-900 min-w-[150px] text-center">
            {MONTH_NAMES_AR[selectedMonth]} {selectedYear}
          </div>

          <button
            type="button"
            onClick={() => setSelectedMonth(prev => Math.min(11, prev + 1))}
            disabled={selectedMonth === 11}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 cursor-pointer"
            title="الشهر القادم"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Quick Jump Month Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
          {MONTH_NAMES_AR.map((mName, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedMonth(idx)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                selectedMonth === idx 
                  ? 'bg-[#714B67] text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
        
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 border-b pb-3 mb-2">
          {WEEK_DAYS_AR.map((day, idx) => (
            <div key={idx} className={`p-1.5 rounded-lg ${idx === 5 ? 'text-purple-900 bg-purple-50 font-black' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before 1st day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[95px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200/60 opacity-40"></div>
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = dayNum === todayDay;
            const dayHolidays = holidaysByDay.get(dayNum) || [];
            const dayOfWeek = (firstDayOfWeek + i) % 7;
            const isFriday = dayOfWeek === 5; // Friday in Kuwait
            const isSaturday = dayOfWeek === 6;

            // Check if there are duty staff on this date
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dateDuties = duties.filter(d => d.dutyDate === dateStr);

            return (
              <div
                key={dayNum}
                className={`min-h-[100px] p-2 rounded-xl border transition flex flex-col justify-between text-xs relative ${
                  isToday 
                    ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600/20' 
                    : dayHolidays.length > 0 
                      ? 'border-purple-200 bg-purple-50/20' 
                      : isFriday 
                        ? 'border-slate-200 bg-slate-100/50' 
                        : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-mono font-bold ${isToday ? 'bg-[#714B67] text-white px-2 py-0.5 rounded-full' : isFriday ? 'text-purple-800' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>
                  {isFriday && <span className="text-[9px] text-slate-400 font-bold">عطلة الجمعة</span>}
                  {isToday && <span className="text-[9px] text-[#714B67] font-bold">اليوم</span>}
                </div>

                {/* Holiday Events */}
                <div className="space-y-1 flex-1">
                  {dayHolidays.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setActiveHolidayDetail(h)}
                      className="w-full text-right p-1 rounded-lg bg-[#714B67]/10 hover:bg-[#714B67]/20 border border-[#714B67]/20 text-[10px] text-[#714B67] font-bold transition truncate block cursor-pointer"
                      title={`${h.nameAr} - اضغط لعرض التفاصيل`}
                    >
                      🎉 {h.nameAr}
                    </button>
                  ))}

                  {dateDuties.length > 0 && (
                    <div className="text-[9px] bg-blue-50 text-blue-800 p-1 rounded border border-blue-200 font-bold flex items-center gap-1">
                      <Award size={10} /> {dateDuties.length} مكلفين مناوبة (200%)
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* 4. Holiday Detail Drawer / Modal when clicked in calendar */}
      {activeHolidayDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border text-xs text-right space-y-4">
            
            <div className="flex justify-between items-start border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activeHolidayDetail.nameAr}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{activeHolidayDetail.nameEn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveHolidayDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px] font-sans">تاريخ البداية:</span>
                  <strong className="text-slate-800">{activeHolidayDetail.startDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-sans">تاريخ النهاية:</span>
                  <strong className="text-slate-800">{activeHolidayDetail.endDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-sans">مدة العطلة:</span>
                  <strong className="text-purple-900 font-black">{activeHolidayDetail.daysCount} أيام رسمية</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-sans">السند القانوني:</span>
                  <strong className="text-emerald-800 font-sans">{activeHolidayDetail.decreeNumber || 'مرسوم رسمي'}</strong>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] leading-relaxed">
                <strong>البيان والتعميم:</strong> {activeHolidayDetail.notes || 'عطلة رسمية مدفوعة الأجر بالكامل لكافة الموظفين طبقاً للمادة 68 من قانون العمل الكويتي.'}
              </div>

              {/* Duty Staff on this holiday */}
              {(() => {
                const assigned = duties.filter(d => d.holidayName === activeHolidayDetail.nameAr);
                return (
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center justify-between text-[11px]">
                      <span>الموظفون المكلفون بالعمل في هذه العطلة:</span>
                      <span className="text-blue-700 font-mono font-bold">({assigned.length} موظف)</span>
                    </div>
                    {assigned.length > 0 ? (
                      <div className="divide-y border rounded-xl overflow-hidden bg-slate-50 max-h-36 overflow-y-auto">
                        {assigned.map(d => (
                          <div key={d.id} className="p-2 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="font-bold text-slate-900">{d.employeeName}</span>
                              <span className="text-slate-400 text-[10px] block">{d.jobTitle}</span>
                            </div>
                            <span className="font-mono text-emerald-700 font-bold">
                              {d.compensationType === 'double_pay' ? `+${d.calculatedAmount.toFixed(3)} د.ك` : 'يوم راحة بديل'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-slate-400 bg-slate-50 rounded-xl border text-[11px]">
                        لا يوجد تكليفات عمل مسجلة لهذه العطلة حتى الآن.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              {onOpenCircularModal && (
                <button
                  type="button"
                  onClick={() => {
                    const h = activeHolidayDetail;
                    setActiveHolidayDetail(null);
                    onOpenCircularModal(h);
                  }}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#714B67] rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <BellRing size={14} /> إصدار تعميم إداري للموظفين
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveHolidayDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
