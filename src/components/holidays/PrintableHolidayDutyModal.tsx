import React from 'react';
import { Printer, X, Award, DollarSign } from 'lucide-react';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';
import { HolidayDutyAssignment } from '../OdooPublicHolidaysApp';
import type { Company } from '../../types';
import { getCompanyPrintProfile } from '../../utils/companyPrintProfile';
import { formatEmployerRegistryLine } from '../../utils/mohMedicalFacility';
import { OdooReportFooter } from '../print/OdooReportPrimitives';
import { OfficialA4CompanyLetterheadCompact } from '../print/OfficialA4CompanyLetterhead';

interface PrintableHolidayDutyModalProps {
  duty: HolidayDutyAssignment | null;
  onClose: () => void;
  company: Company | null;
}

export const PrintableHolidayDutyModal: React.FC<PrintableHolidayDutyModalProps> = ({
  duty,
  onClose,
  company,
}) => {
  if (!duty) return null;

  const profile = getCompanyPrintProfile(company);

  const todayStr = new Date().toISOString().split('T')[0];
  const formRef = `PAM-DTY-${duty.id || '2026-001'}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-xs my-6 text-right font-sans" dir="rtl">
        
        {/* Actions Bar on top (Hidden during print) */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-lg">
              <Award size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">أمر تكليف رسمي بالعمل أثناء العطلة الرسمية (Article 68 Duty Order)</h3>
              <p className="text-[11px] text-slate-500">مستند قانوني معتمد وموثق لتقديمه للهيئة العامة للقوى العاملة ومفتشي العمل</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => safePrintAction(`أمر_تكليف_${duty.employeeName}_${duty.dutyDate}`)}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={15} /> طباعة المستند (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Document Container */}
        <div id="printable-holiday-duty-form" className="odoo-report-sheet p-6 border border-slate-200 rounded-xl space-y-6 text-slate-900 bg-white">
          
          <OfficialA4CompanyLetterheadCompact
            company={company}
            rightSlot={
              <div className="text-left font-mono text-[10px] text-slate-500 space-y-1">
                <div>رقم التكليف: <strong className="text-slate-900">{formRef}</strong></div>
                <div>تاريخ الإصدار: <strong className="text-slate-900">{todayStr}</strong></div>
                <div className="text-emerald-700 font-bold">الحالة: معتمد وموثق</div>
              </div>
            }
          />
          <p className="text-[10px] text-slate-600 -mt-2">{formatEmployerRegistryLine(profile, company)}</p>

          <div className="odoo-report-center-title">
            <h2 className="text-sm font-black text-slate-900">
              قرار وأمر تكليف بالعمل أثناء العطلة الرسمية والراحة الأسبوعية
            </h2>
            <div className="text-[11px] text-slate-600 font-bold mt-0.5">
              OFFICIAL PUBLIC HOLIDAY WORK ASSIGNMENT ORDER
            </div>
          </div>

          {/* Legal Premise */}
          <div className="text-[11px] text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-200">
            <strong>السند القانوني:</strong> استناداً إلى أحكام <strong>المادة (68)</strong> من قانون العمل الكويتي رقم (6) لسنة 2010، ونظراً لمقتضيات وحاجة العمل الملحة والتشغيل المستمر بالمنشأة، فقد تقرر تكليف الموظف الموضحة بياناته أدناه بالعمل ومباشرة مهامه خلال العطلة الرسمية المقررة، مع حفظ كافة حقوقه المقررة قانوناً بالتعويض المالي أو الراحة البديلة.
          </div>

          {/* Employee Information Grid */}
          <div className="space-y-2">
            <div className="font-bold text-xs text-slate-900 border-r-4 border-[#714B67] pr-2">
              أولاً: البيانات الأساسية للموظف المكلف
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] font-sans">اسم الموظف:</span>
                <strong className="text-slate-900 font-sans">{duty.employeeName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] font-sans">الرقم المدني:</span>
                <strong className="text-slate-900">{duty.civilId || '---'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] font-sans">المسمى الوظيفي:</span>
                <strong className="text-slate-800 font-sans">{duty.jobTitle || 'موظف'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] font-sans">الراتب الشامل المقيد:</span>
                <strong className="text-emerald-800">{duty.totalSalary?.toFixed(3) || '0.000'} د.ك</strong>
              </div>
            </div>
          </div>

          {/* Assignment & Compensation Details */}
          <div className="space-y-2">
            <div className="font-bold text-xs text-slate-900 border-r-4 border-[#714B67] pr-2">
              ثانياً: تفاصيل التكليف والتعويض المقرر (المادة 68)
            </div>
            
            <div className="odoo-report-table-wrap">
            <table className="odoo-report-table w-full text-right text-[11px]">
              <thead>
                <tr>
                  <th className="p-2.5">مناسبة العطلة الرسمية</th>
                  <th className="p-2.5">تاريخ التكليف الفعلي</th>
                  <th className="p-2.5">طبيعة التعويض القانوني</th>
                  <th className="p-2.5 text-left">الأثر المالي / الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">{duty.holidayName}</td>
                  <td className="p-2.5 font-mono font-bold text-slate-800">{duty.dutyDate}</td>
                  <td className="p-2.5">
                    {duty.compensationType === 'double_pay' && (
                      <span className="font-bold text-blue-900">أجر مضاعف 200% (أجر اليوم + أجر يوم إضافي)</span>
                    )}
                    {duty.compensationType === 'comp_day_off' && (
                      <span className="font-bold text-purple-900">يوم راحة بديل معتمد (Comp-Off)</span>
                    )}
                    {duty.compensationType === 'add_to_annual_leave' && (
                      <span className="font-bold text-emerald-900">إضافة يوم إلى رصيد الإجازات السنوية</span>
                    )}
                  </td>
                  <td className="p-2.5 text-left font-mono font-black text-slate-900">
                    {duty.compensationType === 'double_pay' ? (
                      <span className="text-emerald-700 text-xs">+{duty.calculatedAmount?.toFixed(3)} د.ك (WPS)</span>
                    ) : (
                      <span className="text-purple-700">+1.0 يوم رصيد راحة</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <OdooReportFooter companyName={profile.displayNameAr} reportRef={formRef} />

        </div>

      </div>
    </div>
  );
};
