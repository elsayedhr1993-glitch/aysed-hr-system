import React, { useEffect, useMemo, useState } from 'react';
import { Clock, ShieldAlert, Trash2, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCompany } from '../../context/CompanyContext';
import {
  DEFAULT_SHIFT_SEED_RULES,
  ShiftSeedRunMode,
  ShiftSeedRulesConfig,
  loadShiftSeedRules,
  runShiftSeedForCompany,
  saveShiftSeedRules,
} from '../../services/shiftSeedService';
import { performDemoEnvironmentWipe } from '../../utils/demoEnvironmentWipe';
import {
  healCrossTenantEmployeeDuplicates,
  runDefaultCrossTenantSelfHealOncePerSession,
  SELF_HEAL_WATCH_CIVIL_ID,
  ALMANAR_CANONICAL_COMPANY_ID,
} from '../../services/employeeCrossTenantSelfHeal';

export const SuperAdminTenantOpsPanel: React.FC = () => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || '';

  const [shiftSeedRules, setShiftSeedRules] = useState<ShiftSeedRulesConfig>(DEFAULT_SHIFT_SEED_RULES);
  const [shiftSeedRunMode, setShiftSeedRunMode] = useState<ShiftSeedRunMode>('preserve_existing');
  const [isRunningShiftSeed, setIsRunningShiftSeed] = useState(false);
  const [isRunningSelfHeal, setIsRunningSelfHeal] = useState(false);
  const [lastSelfHealSummary, setLastSelfHealSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    void loadShiftSeedRules(companyId).then(setShiftSeedRules);
  }, [companyId]);

  useEffect(() => {
    void runDefaultCrossTenantSelfHealOncePerSession()
      .then((result) => {
        if (!result) return;
        const n = result.deletedEmployees.length;
        const p = result.deletedOnboardingPlanIds.length;
        if (n > 0 || p > 0) {
          setLastSelfHealSummary(
            `إصلاح تلقائي: حُذف ${n} سجل موظف مكرر و${p} خطة تهيئة خارج المنار.`
          );
          toast.success(`تم إصلاح تكرار الرقم المدني (${n} موظف، ${p} خطة تهيئة).`);
        }
      })
      .catch((err) => {
        console.warn('[SelfHeal] auto-run skipped:', err);
      });
  }, []);

  const previewDays = useMemo(() => {
    const daysCount = Math.max(1, Math.min(14, shiftSeedRules.seedDays || 7));
    const weekDaysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const result: Array<{ index: number; dayName: string; dayNumber: number }> = [];
    const start = new Date();
    for (let i = 0; i < daysCount; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      result.push({
        index: i,
        dayName: weekDaysAr[d.getDay()] || '—',
        dayNumber: d.getDay(),
      });
    }
    return result;
  }, [shiftSeedRules.seedDays]);

  const getPreviewShift = (track: 'medical' | 'security' | 'admin', dayIndex: number, dayNumber: number) => {
    if (track === 'admin') {
      if (dayNumber === shiftSeedRules.adminWeekendOffDay) {
        return { label: 'OFF', className: 'bg-slate-100 text-slate-700 border-slate-300' };
      }
      return { label: 'صباحي', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (track === 'medical') {
      if (dayIndex % 3 === 2) return { label: 'ليلي', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      if (dayIndex % 2 === 1) return { label: 'مسائي', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      return { label: 'صباحي', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (dayIndex % 2 === 1) return { label: 'ليلي', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (dayIndex % 2 === 0) return { label: 'مسائي', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    return { label: 'صباحي', className: 'bg-amber-100 text-amber-800 border-amber-200' };
  };

  const handleSaveRules = async () => {
    if (!companyId) {
      toast.error('اختر منشأة (معاينة) من قائمة الاشتراكات قبل حفظ قواعد التهيئة.');
      return;
    }
    try {
      await saveShiftSeedRules(companyId, shiftSeedRules);
      toast.success('تم حفظ قواعد تهيئة الشفتات.');
    } catch {
      toast.error('فشل حفظ قواعد التهيئة.');
    }
  };

  const handleRunShiftSeedNow = async () => {
    if (!companyId) {
      toast.error('اختر منشأة نشطة (معاينة) لتنفيذ التهيئة.');
      return;
    }
    setIsRunningShiftSeed(true);
    try {
      await saveShiftSeedRules(companyId, shiftSeedRules);
      const result = await runShiftSeedForCompany(companyId, shiftSeedRules, shiftSeedRunMode);
      if (result.totalWrites === 0 && shiftSeedRunMode === 'overwrite_window') return;
      if (shiftSeedRunMode === 'preserve_existing') {
        toast.success(`تم إنشاء ${result.generatedCount} تعيين جديد وتخطي ${result.skippedCount} تعيين موجود.`);
      } else {
        toast.success(`تمت إعادة توليد ${result.totalWrites} تعيين شفتات بنجاح.`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'تعذر تنفيذ التهيئة.';
      toast.error(message);
    } finally {
      setIsRunningShiftSeed(false);
    }
  };

  const handleCrossTenantSelfHeal = async (dryRun: boolean) => {
    setIsRunningSelfHeal(true);
    try {
      const result = await healCrossTenantEmployeeDuplicates({ dryRun });
      const msg = dryRun
        ? `معاينة: ${result.deletedEmployees.length} موظف و${result.deletedOnboardingPlanIds.length} خطة تهيئة للحذف.`
        : `تم الحذف: ${result.deletedEmployees.length} موظف و${result.deletedOnboardingPlanIds.length} خطة تهيئة.`;
      setLastSelfHealSummary(msg);
      if (result.errors.length) {
        toast.error(result.errors[0]);
      } else {
        toast.success(msg);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الإصلاح الذاتي.');
    } finally {
      setIsRunningSelfHeal(false);
    }
  };

  const handleDemoWipe = () => {
    const confirmed = window.confirm(
      'تحذير: سيتم مسح بيانات التخزين المحلي التجريبية على هذا المتصفح فقط. هل تريد المتابعة؟'
    );
    if (!confirmed) return;
    try {
      performDemoEnvironmentWipe();
      toast.success('تم تصفير ذاكرة المتصفح التجريبية — سيتم إعادة تحميل الصفحة.');
      window.location.reload();
    } catch {
      toast.error('فشل التصفير المحلي.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
          <UserX className="w-6 h-6 text-amber-700" />
          <div>
            <h3 className="text-base font-bold text-gray-900">إصلاح تكرار الموظف عبر المنشآت</h3>
            <p className="text-xs text-gray-500">
              يحتفظ بالرقم المدني <span className="font-mono">{SELF_HEAL_WATCH_CIVIL_ID}</span> في المنار فقط (
              {ALMANAR_CANONICAL_COMPANY_ID}) ويحذف النسخ الأخرى وخطط التهيئة المرتبطة.
            </p>
          </div>
        </div>
        {lastSelfHealSummary && (
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
            {lastSelfHealSummary}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isRunningSelfHeal}
            onClick={() => void handleCrossTenantSelfHeal(true)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 disabled:opacity-50"
          >
            معاينة (بدون حذف)
          </button>
          <button
            type="button"
            disabled={isRunningSelfHeal}
            onClick={() => {
              if (
                !window.confirm(
                  'سيتم حذف سجلات الموظف المكررة خارج عيادة المنار نهائياً. متابعة؟'
                )
              ) {
                return;
              }
              void handleCrossTenantSelfHeal(false);
            }}
            className="px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold disabled:opacity-50"
          >
            {isRunningSelfHeal ? 'جاري الإصلاح...' : 'تنفيذ الإصلاح الآن'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
          <Clock className="w-6 h-6 text-[#71639e]" />
          <div>
            <h3 className="text-base font-bold text-gray-900">تهيئة الشفتات الجماعية (Super Admin)</h3>
            <p className="text-xs text-gray-500">
              تُطبَّق على المنشأة النشطة في المعاينة:{' '}
              <strong>{activeCompany?.nameAr || '—'}</strong>
              {companyId ? ` (${companyId})` : ''}
            </p>
          </div>
        </div>

        {!companyId && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            من فضلك استخدم «معاينة كشركة» من قائمة الاشتراكات ثم ارجع إلى هذا التبويب لتنفيذ التهيئة على tenant محدد.
          </p>
        )}

        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-900">قواعد التوزيع الذكي للشفتات</h4>
              <p className="text-[10px] text-emerald-700">للمنشآت الجديدة بدون تعيينات مسبقة.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900">
              <input
                type="checkbox"
                checked={shiftSeedRules.enabled}
                onChange={(e) => setShiftSeedRules((prev) => ({ ...prev, enabled: e.target.checked }))}
                className="rounded text-emerald-700"
              />
              تفعيل
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">عدد الأيام</label>
              <input
                type="number"
                min={1}
                max={31}
                value={shiftSeedRules.seedDays}
                onChange={(e) =>
                  setShiftSeedRules((prev) => ({
                    ...prev,
                    seedDays: Math.max(1, Math.min(31, parseInt(e.target.value, 10) || 7)),
                  }))
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">يوم الراحة الإداري</label>
              <select
                value={shiftSeedRules.adminWeekendOffDay}
                onChange={(e) =>
                  setShiftSeedRules((prev) => ({ ...prev, adminWeekendOffDay: parseInt(e.target.value, 10) || 5 }))
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
              >
                <option value={5}>الجمعة</option>
                <option value={6}>السبت</option>
                <option value={0}>الأحد</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => void handleSaveRules()}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold"
              >
                حفظ القواعد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">كلمات الكادر الطبي</label>
              <input
                type="text"
                value={shiftSeedRules.medicalKeywords}
                onChange={(e) => setShiftSeedRules((prev) => ({ ...prev, medicalKeywords: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">كلمات الأمن والحراسة</label>
              <input
                type="text"
                value={shiftSeedRules.securityKeywords}
                onChange={(e) => setShiftSeedRules((prev) => ({ ...prev, securityKeywords: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">معاينة التوزيع ({previewDays.length} يوم)</h4>
            {[
              { id: 'medical' as const, label: 'الكادر الطبي' },
              { id: 'security' as const, label: 'الأمن' },
              { id: 'admin' as const, label: 'الإداري' },
            ].map((track) => (
              <div key={track.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 mb-2">{track.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {previewDays.map((day) => {
                    const shift = getPreviewShift(track.id, day.index, day.dayNumber);
                    return (
                      <span
                        key={`${track.id}_${day.index}`}
                        className={`px-2 py-1 rounded-md border text-[10px] font-bold ${shift.className}`}
                      >
                        {day.dayName}: {shift.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200 pt-3">
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold">
                <input
                  type="radio"
                  name="sa-shift-seed-mode"
                  checked={shiftSeedRunMode === 'preserve_existing'}
                  onChange={() => setShiftSeedRunMode('preserve_existing')}
                />
                دون استبدال الموجود
              </label>
              <label className="inline-flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold">
                <input
                  type="radio"
                  name="sa-shift-seed-mode"
                  checked={shiftSeedRunMode === 'overwrite_window'}
                  onChange={() => setShiftSeedRunMode('overwrite_window')}
                />
                استبدال كامل للفترة
              </label>
            </div>
            <button
              type="button"
              disabled={isRunningShiftSeed || !companyId}
              onClick={() => void handleRunShiftSeedNow()}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50"
            >
              {isRunningShiftSeed ? 'جاري التنفيذ...' : 'تنفيذ التهيئة الآن'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm">
        <div className="flex items-center gap-2.5 text-rose-800 mb-4">
          <ShieldAlert className="w-5 h-5" />
          <div>
            <h3 className="text-sm font-bold">منطقة الخطر: تصفير الذاكرة المحلية التجريبية</h3>
            <p className="text-[11px] text-rose-600">
              يمسح مفاتيح المتصفح legacy فقط — لا يحذف بيانات Firestore. للعمليات السحابية استخدم النسخ الاحتياطي في التبويب المجاور.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleDemoWipe}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
          >
            <Trash2 size={16} />
            تصفير ذاكرة المتصفح التجريبية
          </button>
        </div>
      </div>
    </div>
  );
};
