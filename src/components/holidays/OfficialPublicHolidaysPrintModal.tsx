import React, { useMemo } from 'react';
import { X, Printer, Building2, Sparkles, Award } from 'lucide-react';
import { OdooPdf } from '../../services/odooPdfService';
import { PublicHoliday, HolidayDutyAssignment } from './holidayTypes';
import { getCompensatedHolidays2026 } from '../../data/kuwaitPublicHolidays2026';
import type { Company } from '../../types';
import { getCompanyPrintProfile } from '../../utils/companyPrintProfile';
import { OfficialA4CompanyLetterhead } from '../print/OfficialA4CompanyLetterhead';
import { OdooReportFooter, OdooReportLegalNotice } from '../print/OdooReportPrimitives';

interface OfficialPublicHolidaysPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
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

  const profile = getCompanyPrintProfile(company);

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
    void OdooPdf.report.print(printRootId, `سجل_العطلات_والتكليفات_${calendarYear}`);
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
            className="odoo-report-sheet bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-10 border border-slate-300 shadow-sm text-slate-900 text-right font-sans"
            dir="rtl"
          >
            <OfficialA4CompanyLetterhead
              company={company}
              showKuwaitMinistryLine
              logoClassName="w-14 h-14"
              className="mb-5"
              rightSlot={
                <div className="text-[10px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">إدارة الموارد البشرية</div>
                  <div>رقم السجل: <span className="font-mono font-bold">{reportRef}</span></div>
                  <div>تاريخ الاستخراج: <span className="font-mono">{todayLabel}</span></div>
                  <div className="inline-block mt-1 px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-900 font-bold">
                    قانون العمل 6/2010 — العطلات والمادة 68
                  </div>
                </div>
              }
            />

            <div className="odoo-report-center-title mb-6">
              <h1 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-[#714B67]" />
                السجل الرسمي للعطلات الرسمية لعام {calendarYear}م
              </h1>
              <p className="text-[11px] text-slate-600 mt-1 font-bold">
                جدول المناسبات المعتمدة — مدفوعة الأجر 100% وفق قرارات مجلس الوزراء والمراسيم
              </p>
            </div>

            <div className="odoo-report-table-wrap mb-3">
            <table className="odoo-report-table w-full text-[10px]">
              <thead>
                <tr>
                  <th className="p-2 w-8">م</th>
                  <th className="p-2">المناسبة</th>
                  <th className="p-2">المرسوم / القرار</th>
                  <th className="p-2">التصنيف</th>
                  <th className="p-2 font-mono">من</th>
                  <th className="p-2 font-mono">إلى</th>
                  <th className="p-2 text-center">الأيام</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h, idx) => (
                  <tr key={h.id}>
                    <td className="p-2 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 font-bold">{h.nameAr}</td>
                    <td className="p-2 text-slate-700">{h.decreeNumber || 'مرسوم رسمي'}</td>
                    <td className="p-2">{holidayTypeLabel[h.type]}</td>
                    <td className="p-2 font-mono">{h.startDate}</td>
                    <td className="p-2 font-mono">{h.endDate}</td>
                    <td className="p-2 text-center font-bold">{h.daysCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

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
              className="odoo-report-center-title mb-4 break-before-page"
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

            <div className="odoo-report-table-wrap mb-4">
            <table className="odoo-report-table w-full text-[10px]">
              <thead>
                <tr>
                  <th className="p-2 w-8">م</th>
                  <th className="p-2">رقم التكليف</th>
                  <th className="p-2">الموظف</th>
                  <th className="p-2 font-mono">المدني</th>
                  <th className="p-2">العطلة</th>
                  <th className="p-2 font-mono">تاريخ العمل</th>
                  <th className="p-2">التعويض</th>
                  <th className="p-2">البدل النقدي</th>
                  <th className="p-2 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {duties.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-slate-500 font-bold">
                      لا توجد تكليفات مسجلة حتى تاريخ هذا التقرير.
                    </td>
                  </tr>
                ) : (
                  duties.map((d, idx) => (
                    <tr key={d.id}>
                      <td className="p-2 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 font-mono text-[9px]">{d.id}</td>
                      <td className="p-2 font-bold">{d.employeeName}</td>
                      <td className="p-2 font-mono">{d.civilId || '—'}</td>
                      <td className="p-2">{d.holidayName}</td>
                      <td className="p-2 font-mono">{d.dutyDate}</td>
                      <td className="p-2">{compensationLabel(d.compensationType)}</td>
                      <td className="p-2 font-mono font-bold text-emerald-900">
                        {dutyAmountDisplay(d)}
                      </td>
                      <td className="p-2 text-center">
                        {d.status === 'settled' ? 'رُحل للرواتب' : 'معتمد'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            <div className="text-[10px] text-slate-700 mb-8">
              إجمالي البدلات النقدية المستحقة (200%):{' '}
              <strong className="font-mono text-emerald-800">{totalDutyCash.toFixed(3)} د.ك</strong>
            </div>

            <OdooReportLegalNotice title="ملاحظات الامتثال — العطلات الرسمية">
              <p>• العطلات مستمدة من المصدر الموحد لنظام أيسد (SSOT) لعام {calendarYear} مع تعويض الجمعة الرسمي.</p>
              <p>• احتسب بدل المادة (68) على أساس الراتب الشامل ÷ 26 × 2 لليوم المكلف.</p>
              <p>• هذا السجل معد للمراجعة الداخلية وملف الشؤون والهيئة العامة للقوى العاملة عند الطلب.</p>
            </OdooReportLegalNotice>

            <OdooReportFooter
              companyName={company ? getCompanyPrintProfile(company).displayNameAr : undefined}
              reportRef={reportRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialPublicHolidaysPrintModal;
