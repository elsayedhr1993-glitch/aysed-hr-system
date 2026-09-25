import React, { useMemo } from 'react';
import { X, Printer, Building2, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { printDocument } from '../../utils/printUtils';
import { PublicHoliday, HolidayDutyAssignment } from './holidayTypes';
import { getCompensatedHolidays2026 } from '../../data/kuwaitPublicHolidays2026';

export interface OfficialHolidaysPrintCompany {
  nameAr?: string;
  name?: string;
  commercialLicenseNo?: string;
  wsiCode?: string;
  civilIdCompany?: string;
  authorizedSignatory?: string;
}

interface OfficialPublicHolidaysPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: OfficialHolidaysPrintCompany | null;
  holidays: PublicHoliday[];
  duties: HolidayDutyAssignment[];
  calendarYear?: number;
}

const holidayTypeLabel: Record<PublicHoliday['type'], string> = {
  national: 'عطلة وطنية',
  religious: 'عطلة دينية',
  official: 'عطلة رسمية',
  cabinet_decision: 'قرار مجلس الوزراء',
};

function compensationLabel(type: HolidayDutyAssignment['compensationType']): string {
  if (type === 'double_pay') return 'أجر مضاعف 200% (مادة 68)';
  if (type === 'comp_day_off') return 'يوم راحة بديل (Comp-Off)';
  return 'إضافة للرصيد السنوي (+1 يوم)';
}

function dutyAmountDisplay(duty: HolidayDutyAssignment): string {
  if (duty.compensationType !== 'double_pay') return '—';
  const base = Number(duty.totalSalary || duty.basicSalary || 0);
  const amount =
    duty.calculatedAmount > 0 ? duty.calculatedAmount : base > 0 ? Math.round((base / 26) * 2 * 1000) / 1000 : 0;
  return amount > 0 ? `${amount.toFixed(3)} د.ك` : '0.000 د.ك';
}

export const OfficialPublicHolidaysPrintModal: React.FC<OfficialPublicHolidaysPrintModalProps> = ({
  isOpen,
  onClose,
  company,
  holidays,
  duties,
  calendarYear = 2026,
}) => {
  const printRootId = 'official-holidays-registry-print';

  const compName = company?.nameAr || company?.name || 'المنشأة المركزية';
  const commercialNo = company?.commercialLicenseNo || '—';
  const wsiCode = company?.wsiCode || '—';
  const civilIdCompany = company?.civilIdCompany || '—';
  const signatory = company?.authorizedSignatory || 'المدير العام المفوض بالتوقيع';

  const todayLabel = new Date().toLocaleDateString('ar-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const reportRef = `HOL-REG-${calendarYear}-${Date.now().toString().slice(-6)}`;

  const totalHolidayDays = holidays.reduce((sum, h) => sum + (h.daysCount || 1), 0);
  const totalDutyCash = duties.reduce((sum, d) => {
    if (d.compensationType !== 'double_pay') return sum;
    const base = Number(d.totalSalary || d.basicSalary || 0);
    const amount =
      d.calculatedAmount > 0 ? d.calculatedAmount : base > 0 ? Math.round((base / 26) * 2 * 1000) / 1000 : 0;
    return sum + amount;
  }, 0);

  const compensationDays = useMemo(() => getCompensatedHolidays2026().filter((d) => d.isCompensationDay), []);

  if (!isOpen) return null;

  const handlePrint = () => {
    void printDocument(printRootId, `سجل_العطلات_والتكليفات_${calendarYear}`);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:hidden"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Building2 size={16} className="text-[#714B67]" />
            <span>معاينة السجل الرسمي A4 — العطلات الرسمية وتكليفات المادة (68)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={14} />
              طباعة المستند (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 bg-slate-100/60 flex justify-center">
          <div
            id={printRootId}
            className="bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-10 border border-slate-300 shadow-sm text-slate-900 text-right font-sans"
            dir="rtl"
          >
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center shrink-0 bg-gradient-to-b from-emerald-50 to-white"
                  aria-hidden
                >
                  <ShieldCheck className="text-emerald-800" size={28} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500">دولة الكويت — وزارة الشؤون الاجتماعية والعمل</div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">{compName}</h2>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono space-y-0.5">
                    <div>س.ت: <strong>{commercialNo}</strong> | ملف الشؤون (PAM/WPS): <strong>{wsiCode}</strong></div>
                    <div>الرقم المدني للجهة: <strong>{civilIdCompany}</strong></div>
                  </div>
                </div>
              </div>
              <div className="text-left text-[10px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">إدارة الموارد البشرية</div>
                <div>رقم السجل: <span className="font-mono font-bold">{reportRef}</span></div>
                <div>تاريخ الاستخراج: <span className="font-mono">{todayLabel}</span></div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-900 font-bold">
                  قانون العمل 6/2010 — العطلات والمادة 68
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center mb-6">
              <h1 className="text-base font-black text-slate-900 flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-[#714B67]" />
                السجل الرسمي للعطلات الرسمية لعام {calendarYear}م
              </h1>
              <p className="text-[11px] text-slate-600 mt-1 font-bold">
                جدول المناسبات المعتمدة — مدفوعة الأجر 100% وفق قرارات مجلس الوزراء والمراسيم
              </p>
            </div>

            <table className="w-full text-[10px] border border-slate-400 border-collapse mb-3">
              <thead>
                <tr className="bg-slate-200 font-bold text-slate-800">
                  <th className="p-2 border border-slate-400 w-8">م</th>
                  <th className="p-2 border border-slate-400">المناسبة</th>
                  <th className="p-2 border border-slate-400">المرسوم / القرار</th>
                  <th className="p-2 border border-slate-400">التصنيف</th>
                  <th className="p-2 border border-slate-400 font-mono">من</th>
                  <th className="p-2 border border-slate-400 font-mono">إلى</th>
                  <th className="p-2 border border-slate-400 text-center">الأيام</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h, idx) => (
                  <tr key={h.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-bold">{h.nameAr}</td>
                    <td className="p-2 border border-slate-300 text-slate-700">{h.decreeNumber || 'مرسوم رسمي'}</td>
                    <td className="p-2 border border-slate-300">{holidayTypeLabel[h.type]}</td>
                    <td className="p-2 border border-slate-300 font-mono">{h.startDate}</td>
                    <td className="p-2 border border-slate-300 font-mono">{h.endDate}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">{h.daysCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[10px] text-slate-600 mb-6 flex flex-wrap gap-4 justify-between">
              <span>
                إجمالي المناسبات: <strong>{holidays.length}</strong> | إجمالي أيام العطل:{' '}
                <strong>{totalHolidayDays}</strong> يوماً
              </span>
              {compensationDays.length > 0 && (
                <span>
                  أيام تعويض الجمعة (SSOT):{' '}
                  <strong className="font-mono">{compensationDays.map((d) => d.date).join('، ')}</strong>
                </span>
              )}
            </div>

            <div
              className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center mb-4 break-before-page"
              style={{ breakBefore: 'page', pageBreakBefore: 'always' }}
            >
              <h2 className="text-sm font-black text-slate-900 flex items-center justify-center gap-2">
                <Award size={15} className="text-[#714B67]" />
                سجل تكليفات العمل أثناء العطلات الرسمية (المادة 68)
              </h2>
              <p className="text-[10px] text-slate-600 mt-0.5">
                أمر تكليف — أجر مضاعف أو راحة بديلة أو إضافة رصيد سنوي
              </p>
            </div>

            <table className="w-full text-[10px] border border-slate-400 border-collapse mb-4">
              <thead>
                <tr className="bg-slate-200 font-bold text-slate-800">
                  <th className="p-2 border border-slate-400 w-8">م</th>
                  <th className="p-2 border border-slate-400">رقم التكليف</th>
                  <th className="p-2 border border-slate-400">الموظف</th>
                  <th className="p-2 border border-slate-400 font-mono">المدني</th>
                  <th className="p-2 border border-slate-400">العطلة</th>
                  <th className="p-2 border border-slate-400 font-mono">تاريخ العمل</th>
                  <th className="p-2 border border-slate-400">التعويض</th>
                  <th className="p-2 border border-slate-400">البدل النقدي</th>
                  <th className="p-2 border border-slate-400 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {duties.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-slate-500 font-bold border border-slate-300">
                      لا توجد تكليفات مسجلة حتى تاريخ هذا التقرير.
                    </td>
                  </tr>
                ) : (
                  duties.map((d, idx) => (
                    <tr key={d.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono text-[9px]">{d.id}</td>
                      <td className="p-2 border border-slate-300 font-bold">{d.employeeName}</td>
                      <td className="p-2 border border-slate-300 font-mono">{d.civilId || '—'}</td>
                      <td className="p-2 border border-slate-300">{d.holidayName}</td>
                      <td className="p-2 border border-slate-300 font-mono">{d.dutyDate}</td>
                      <td className="p-2 border border-slate-300">{compensationLabel(d.compensationType)}</td>
                      <td className="p-2 border border-slate-300 font-mono font-bold text-emerald-900">
                        {dutyAmountDisplay(d)}
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        {d.status === 'settled' ? 'رُحل للرواتب' : 'معتمد'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="text-[10px] text-slate-700 mb-8">
              إجمالي البدلات النقدية المستحقة (200%):{' '}
              <strong className="font-mono text-emerald-800">{totalDutyCash.toFixed(3)} د.ك</strong>
            </div>

            <div className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-8 space-y-1">
              <div>• العطلات مستمدة من المصدر الموحد لنظام أيسد (SSOT) لعام {calendarYear} مع تعويض الجمعة الرسمي.</div>
              <div>• احتسب بدل المادة (68) على أساس الراتب الشامل ÷ 26 × 2 لليوم المكلف.</div>
              <div>• هذا السجل معد للمراجعة الداخلية وملف الشؤون والهيئة العامة للقوى العاملة عند الطلب.</div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-900 text-center text-[11px]">
              <div className="space-y-8">
                <div className="font-bold text-slate-800">إعداد / مسؤول العطلات والشؤون</div>
                <div className="text-slate-500">التوقيع: .......................................</div>
              </div>
              <div className="space-y-8">
                <div className="font-bold text-slate-800">تدقيق / مدير الموارد البشرية</div>
                <div className="text-slate-500">التوقيع: .......................................</div>
              </div>
              <div className="space-y-4">
                <div className="font-bold text-slate-800">اعتماد وختم المنشأة</div>
                <div className="w-24 h-24 border-2 border-dashed border-slate-400 rounded-full mx-auto flex flex-col items-center justify-center text-[9px] text-slate-500 leading-snug px-2">
                  <span className="font-bold text-slate-700">ختم رسمي</span>
                  <span>{signatory}</span>
                </div>
                <div className="text-[10px] text-slate-400">التاريخ: .... / .... / {calendarYear}</div>
              </div>
            </div>

            <div className="mt-6 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-2">
              مستند مولّد آلياً من تطبيق العطلات الرسمية — منظومة أيسد للموارد البشرية
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialPublicHolidaysPrintModal;
