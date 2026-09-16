import React, { useState } from 'react';
import { Printer, X, BellRing, Copy, Check, FileText, Building2, Calendar, Sparkles } from 'lucide-react';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';
import { PublicHoliday } from '../OdooPublicHolidaysApp';
import { toast } from 'react-hot-toast';

interface HolidayCircularModalProps {
  holiday: PublicHoliday | null;
  onClose: () => void;
  companyName?: string;
}

export const HolidayCircularModal: React.FC<HolidayCircularModalProps> = ({
  holiday,
  onClose,
  companyName = 'شركة المنارة للرعاية الصحية والخدمات الإدارية'
}) => {
  const [copied, setCopied] = useState(false);
  if (!holiday) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const circularNo = `CIR-${new Date().getFullYear()}-${holiday.id.replace('HOL-KW-', '')}`;

  // Calculate resumption date (day after endDate)
  const endDateObj = new Date(holiday.endDate || holiday.startDate);
  const resumptionDateObj = new Date(endDateObj);
  resumptionDateObj.setDate(resumptionDateObj.getDate() + 1);
  const resumptionDateStr = resumptionDateObj.toISOString().split('T')[0];

  const circularText = `
دولة الكويت
${companyName}
إدارة الموارد البشرية والشؤون الإدارية

تعميم إداري رسمي رقم: (${circularNo})
التاريخ: ${todayStr}

الموضوع: عطلة ${holiday.nameAr} لعام 2026م

تهديكم إدارة الشركة أطيب تحياتها وتمنياتها لكم بدوام التوفيق والنجاح.

بمناسبة (${holiday.nameAr})، واستناداً إلى قرار مجلس الوزراء الموقر وقوانين العمل بدولة الكويت:
1. تقرر تعطيل العمل بجميع فروع وإدارات الشركة اعتباراً من يوم (${holiday.startDate}) وحتى نهاية يوم (${holiday.endDate}).
2. يستأنف الدوام الرسمي بمشيئة الله تعالى في صباح يوم (${resumptionDateStr}).
3. يراعى تواجد المكلفين بنظام المناوبة والعمل الإضافي وفق الجداول المعتمدة لكل قسم، مع حفظ استحقاقاتهم المقررة طبقاً للمادة (68) من قانون العمل الكويتي.

وكل عام وأنتم بخير،،،

إدارة الموارد البشرية
${companyName}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(circularText);
    setCopied(true);
    toast.success('تم نسخ نص التعميم الإداري للحافظة بنجاح.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-xs my-6 text-right font-sans" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-xl">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">إصدار تعميم إداري رسمي بمناسبة العطلة</h3>
              <p className="text-[11px] text-slate-500">نص معتمد للنشر الداخلي عبر البريد أو لوحة الإعلانات أو الواتساب الرسمي</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 font-bold transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Circular Preview Container */}
        <div className="border-2 border-slate-700 rounded-xl p-6 bg-slate-50/50 space-y-4 text-slate-900">
          <div className="flex justify-between items-center border-b pb-3 text-[11px]">
            <div>
              <strong className="block text-sm font-black">{companyName}</strong>
              <span className="text-slate-500">إدارة الموارد البشرية والخدمات الإدارية</span>
            </div>
            <div className="text-left font-mono">
              <div>رقم التعميم: <strong>{circularNo}</strong></div>
              <div>التاريخ: <strong>{todayStr}</strong></div>
            </div>
          </div>

          <div className="text-center py-2 bg-white border rounded-lg shadow-2xs">
            <h2 className="text-sm font-black text-[#714B67]">
              تعميم إداري رسمي بشأن عطلة {holiday.nameAr}
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">OFFICIAL ADMINISTRATIVE CIRCULAR</span>
          </div>

          <div className="space-y-3 leading-relaxed text-[11px] text-slate-800 bg-white p-4 rounded-xl border">
            <p className="font-bold">السادة / كافة موظفي ومنتسبي المنشأة المحترمين،،،</p>
            <p>تحية طيبة وبعد،،،</p>
            <p>
              تهديكم إدارة المنشأة أطيب تحياتها وخالص تمنياتها. بمناسبة <strong>{holiday.nameAr}</strong>، واستناداً إلى المرسوم وقرار مجلس الوزراء الموقر رقم <strong>({holiday.decreeNumber || 'العطلات الرسمية 2026'})</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 font-semibold text-slate-900 pr-2">
              <li>
                تقرر تعطيل العمل بالمنشأة اعتباراً من صباح يوم <span className="font-mono text-purple-900">({holiday.startDate})</span> وحتى مساء يوم <span className="font-mono text-purple-900">({holiday.endDate})</span> مدفوعة الأجر 100%.
              </li>
              <li>
                يستأنف العمل الرسمي وتفتح كافة المقار والأقسام في تمام الساعة المعتادة من صباح يوم <span className="font-mono text-emerald-800">({resumptionDateStr})</span>.
              </li>
              <li>
                يستثنى من ذلك العاملون بنظام المناوبات والطوارئ الطبية الذين تقتضي طبيعة عملهم التواجد، مع استحقاقهم لكافة البدلات المقررة بالمادة (68) من قانون العمل.
              </li>
            </ul>
            <p className="pt-2 text-center font-bold text-[#714B67]">وكل عام وأنتم والكويت الحبيبة بخير ورفعة،،،</p>
          </div>

          <div className="flex justify-between items-end pt-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px]">الاعتماد والختم:</span>
              <strong className="text-slate-800">إدارة الموارد البشرية والشؤون القانونية</strong>
            </div>
            <div className="w-28 border-b-2 border-slate-400 text-center pb-1 text-[10px] text-slate-500 italic">
              الختم الرسمي
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            <span>{copied ? 'تم النسخ للحافظة' : 'نسخ النص للواتساب / الإيميل'}</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={() => safePrintAction(`تعميم_عطلة_${holiday.nameAr}`)}
              className="px-5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={15} /> طباعة التعميم A4
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
