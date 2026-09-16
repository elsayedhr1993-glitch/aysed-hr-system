import React from 'react';
import { Printer, X, ShieldCheck, Calendar, User, FileText, CheckCircle2, Award, DollarSign, Building2 } from 'lucide-react';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';
import { HolidayDutyAssignment } from '../OdooPublicHolidaysApp';

interface PrintableHolidayDutyModalProps {
  duty: HolidayDutyAssignment | null;
  onClose: () => void;
  activeCompanyName?: string;
  pamFileNumber?: string;
  civilIdCompany?: string;
}

export const PrintableHolidayDutyModal: React.FC<PrintableHolidayDutyModalProps> = ({
  duty,
  onClose,
  activeCompanyName = 'المنشأة المركزية المتكاملة',
  pamFileNumber = '12345678',
  civilIdCompany = '123456789012'
}) => {
  if (!duty) return null;

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
        <div id="printable-holiday-duty-form" className="p-6 border-2 border-slate-800 rounded-xl space-y-6 text-slate-900 bg-white">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-base font-black text-slate-900">{activeCompanyName}</div>
              <div className="text-[11px] text-slate-600">دولة الكويت - سجل تجاري معتمد</div>
              <div className="text-[10px] text-slate-500 font-mono">
                ملف الشؤون (PAM): {pamFileNumber} | الرقم المدني للجهة: {civilIdCompany}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-wider text-slate-700">دولة الكويت</div>
              <div className="text-xs font-bold text-slate-500">قانون العمل في القطاع الأهلي</div>
              <div className="text-[10px] text-purple-900 font-bold mt-1 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                تنفيذاً للمادة 68 من القانون 6/2010
              </div>
            </div>

            <div className="text-left font-mono text-[10px] text-slate-500 space-y-1">
              <div>رقم التكليف: <strong className="text-slate-900">{formRef}</strong></div>
              <div>تاريخ الإصدار: <strong className="text-slate-900">{todayStr}</strong></div>
              <div className="text-emerald-700 font-bold">الحالة: معتمد وموثق</div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center py-2 bg-slate-50 border border-slate-300 rounded-lg">
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
            
            <table className="w-full text-right border border-slate-300 rounded-lg overflow-hidden text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
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

          {/* Acknowledgement and Tripartite Signatures */}
          <div className="space-y-4 pt-2">
            <div className="font-bold text-xs text-slate-900 border-r-4 border-[#714B67] pr-2">
              ثالثاً: الإقرارات والتوقيعات الرسمية
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              
              {/* Employee Signature */}
              <div className="border border-slate-300 rounded-lg p-3 space-y-5 bg-slate-50/50 text-center">
                <div className="font-bold text-[10px] text-slate-700">توقيع الموظف المكلف بالعلم</div>
                <div className="text-[10px] text-slate-400 italic">أقر بالتكليف واستلام الحقوق المقررة</div>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mt-4"></div>
                <div className="text-[10px] font-mono text-slate-600">التاريخ: {duty.dutyDate}</div>
              </div>

              {/* Department Head */}
              <div className="border border-slate-300 rounded-lg p-3 space-y-5 bg-slate-50/50 text-center">
                <div className="font-bold text-[10px] text-slate-700">اعتماد مدير القسم والتشغيل</div>
                <div className="text-[10px] text-slate-400 italic">أؤكد حاجة القسم لمباشرة العمل</div>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mt-4"></div>
                <div className="text-[10px] font-mono text-slate-600">التاريخ: {todayStr}</div>
              </div>

              {/* HR & General Management */}
              <div className="border border-slate-300 rounded-lg p-3 space-y-5 bg-slate-50/50 text-center">
                <div className="font-bold text-[10px] text-slate-700">إدارة الموارد البشرية والشؤون القانونية</div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} /> تم التحقق وترحيل المستحقات
                </div>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mt-4"></div>
                <div className="text-[10px] font-mono text-slate-600">الختم الرسمي للمنشأة</div>
              </div>

            </div>
          </div>

          {/* Footer Official Notice */}
          <div className="border-t pt-3 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>نسخة محفوظة في ملف خدمة الموظف | نسخة لقسم الرواتب والأجور</span>
            <span>نظام أودو 18 للموارد البشرية - مطابقة التفتيش العمالي PAM</span>
          </div>

        </div>

      </div>
    </div>
  );
};
