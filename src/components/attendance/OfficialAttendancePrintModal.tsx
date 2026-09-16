import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';

interface OfficialAttendancePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    nameAr?: string;
    name?: string;
    commercialLicenseNo?: string;
    wsiCode?: string;
  } | null;
  reportData: {
    mode: 'daily' | 'monthly';
    title: string;
    dateOrMonth: string;
    rows: any[];
    totals?: {
      totalHours?: number;
      totalOvertime?: number;
      totalLate?: number;
      totalPresent?: number;
      totalAbsent?: number;
    };
  } | null;
}

export const OfficialAttendancePrintModal: React.FC<OfficialAttendancePrintModalProps> = ({
  isOpen,
  onClose,
  company,
  reportData
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    safePrintAction(reportData.title);
  };

  const compName = company?.nameAr || company?.name || 'الشركة الكويتية لإدارة الأعمال';
  const commercialNo = company?.commercialLicenseNo || '412093 / ك';
  const wsiCode = company?.wsiCode || 'MOSAL-KW-88412';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Building2 size={16} className="text-[#714B67]" />
            <span>معاينة كشف الحضور والانصراف الرسمي للطباعة (A4 Landscape)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={14} />
              <span>طباعة المستند الآن (Print)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="overflow-y-auto p-8 bg-slate-100/50 flex justify-center">
          <div 
            ref={printableRef}
            className="bg-white w-full max-w-4xl p-8 border border-slate-300 shadow-sm rounded-lg text-right font-sans text-slate-900"
            dir="rtl"
          >
            
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-500 font-bold">دولة الكويت</div>
                <h2 className="text-lg font-black text-slate-900">{compName}</h2>
                <div className="text-[11px] text-slate-600 mt-0.5 space-x-3 space-x-reverse font-mono">
                  <span>س.ت: <strong>{commercialNo}</strong></span>
                  <span>|</span>
                  <span>ملف الشؤون WPS: <strong>{wsiCode}</strong></span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-600">قطاع الشؤون الإدارية والموارد البشرية</div>
                <div className="text-[11px] text-slate-500 mt-0.5">تاريخ الطباعة: {new Date().toLocaleDateString('ar-KW')}</div>
                <div className="inline-block bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 mt-1">
                  معتمد قانون العمل الكويتي (م 67)
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 text-center mb-5">
              <h1 className="text-base font-black text-slate-900">{reportData.title}</h1>
              <div className="text-xs text-slate-600 mt-0.5 font-bold">
                عن الفترة / التاريخ: <span className="font-mono text-[#714B67]">{reportData.dateOrMonth}</span>
              </div>
            </div>

            {/* Printable Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-right text-[11px] border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 border-l border-slate-300">م</th>
                    <th className="p-2 border-l border-slate-300">كود الموظف</th>
                    <th className="p-2 border-l border-slate-300">اسم الموظف</th>
                    <th className="p-2 border-l border-slate-300">القسم الوظيفي</th>
                    {reportData.mode === 'daily' ? (
                      <>
                        <th className="p-2 text-center border-l border-slate-300">حضور</th>
                        <th className="p-2 text-center border-l border-slate-300">انصراف</th>
                        <th className="p-2 text-center border-l border-slate-300">الساعات</th>
                        <th className="p-2 text-center border-l border-slate-300">إضافي</th>
                        <th className="p-2 text-center border-l border-slate-300">تأخير</th>
                        <th className="p-2 text-center">الحالة</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2 text-center border-l border-slate-300">أيام الحضور</th>
                        <th className="p-2 text-center border-l border-slate-300">ساعات العمل</th>
                        <th className="p-2 text-center border-l border-slate-300">ساعات الإضافي</th>
                        <th className="p-2 text-center border-l border-slate-300">دقائق التأخير</th>
                        <th className="p-2 text-center border-l border-slate-300">استحقاق الإضافي</th>
                        <th className="p-2 text-center">صافي الأثر</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="p-2 text-center font-mono border-l border-slate-200">{idx + 1}</td>
                      <td className="p-2 font-mono font-bold border-l border-slate-200">{row.employeeId}</td>
                      <td className="p-2 font-bold border-l border-slate-200">{row.employeeName}</td>
                      <td className="p-2 border-l border-slate-200">{row.department}</td>
                      {reportData.mode === 'daily' ? (
                        <>
                          <td className="p-2 text-center font-mono border-l border-slate-200">{row.checkIn || '--:--'}</td>
                          <td className="p-2 text-center font-mono border-l border-slate-200">{row.checkOut || '--:--'}</td>
                          <td className="p-2 text-center font-mono font-bold border-l border-slate-200">{row.workHours || 0} س</td>
                          <td className="p-2 text-center font-mono border-l border-slate-200">{row.overtimeHours > 0 ? `+${row.overtimeHours}` : '0'}</td>
                          <td className="p-2 text-center font-mono border-l border-slate-200">{row.lateMinutes > 0 ? `${row.lateMinutes} د` : '0'}</td>
                          <td className="p-2 text-center font-bold">
                            {row.status === 'present' ? 'حاضر ملتزم' : row.status === 'late' ? 'متأخر' : row.status === 'overtime' ? 'عمل إضافي' : row.status === 'single_punch' ? 'بصمة واحدة' : 'غياب'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 text-center font-mono font-bold border-l border-slate-200">{row.presentDays} يوم</td>
                          <td className="p-2 text-center font-mono border-l border-slate-200">{row.actualHours} س</td>
                          <td className="p-2 text-center font-mono font-bold border-l border-slate-200">+{row.overtimeHours} س</td>
                          <td className="p-2 text-center font-mono border-l border-slate-200">{row.lateMinutes} د</td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-800 border-l border-slate-200">
                            {row.overtimePay ? `${row.overtimePay.toFixed(3)} د.ك` : '0.000'}
                          </td>
                          <td className="p-2 text-center font-mono font-black">
                            {row.netAdjustment ? `${row.netAdjustment.toFixed(3)} د.ك` : '0.000'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legal Disclaimers & Notes */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-600 mb-8 space-y-1">
              <div>• احتسبت ساعات العمل الإضافي وفق المادة 66 من قانون العمل الكويتي (1.25x للأيام العادية).</div>
              <div>• احتسبت بدلات وأجور اليوم على أساس قسمة الراتب الإجمالي على 26 يوم عمل.</div>
              <div>• هذا المستند رسمي ومعد للإرفاق مع ملف مسير الرواتب المرفوع لنظام حماية الأجور (WPS).</div>
            </div>

            {/* Triple Official Approval Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-800 text-center text-xs">
              <div className="space-y-10">
                <div className="font-bold text-slate-800">إعداد / مسؤول الحضور والانصراف</div>
                <div className="text-[11px] text-slate-500">التوقيع: .......................................</div>
                <div className="text-[10px] text-slate-400">التاريخ: .... / .... / 2026</div>
              </div>

              <div className="space-y-10">
                <div className="font-bold text-slate-800">تدقيق ومراجعة / مدير الموارد البشرية</div>
                <div className="text-[11px] text-slate-500">التوقيع: .......................................</div>
                <div className="text-[10px] text-slate-400">التاريخ: .... / .... / 2026</div>
              </div>

              <div className="space-y-10">
                <div className="font-bold text-slate-800">اعتماد / المدير العام (المفوض بالتوقيع)</div>
                <div className="text-[11px] text-slate-500">الختم والتوقيع: .......................................</div>
                <div className="text-[10px] text-slate-400">التاريخ: .... / .... / 2026</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
