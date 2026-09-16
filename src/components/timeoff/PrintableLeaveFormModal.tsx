import React from 'react';
import { Printer, X, ShieldCheck, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { LeaveRequest } from '../OdooTimeOffApp';
import { safePrintAction } from '../../guards/SystemIntegrityGuard';

interface PrintableLeaveFormModalProps {
  request: LeaveRequest | null;
  onClose: () => void;
  activeCompanyName?: string;
  pamFileNumber?: string;
  civilIdCompany?: string;
}

export const PrintableLeaveFormModal: React.FC<PrintableLeaveFormModalProps> = ({
  request,
  onClose,
  activeCompanyName = 'المنشأة المركزية المتكاملة',
  pamFileNumber = '12345678',
  civilIdCompany = '123456789012'
}) => {
  if (!request) return null;

  const leaveTypeNamesAr: Record<string, string> = {
    annual: 'إجازة سنوية اعتيادية (Annual Leave - مادة 70)',
    sick: 'إجازة مرضية (Sick Leave - مادة 69)',
    emergency: 'إجازة طارئة (Emergency Leave)',
    hajj: 'إجازة أداء فريضة الحج (Hajj Leave - مادة 76)',
    maternity: 'إجازة وضع وأمومة (Maternity Leave - مادة 24)',
    bereavement: 'إجازة عزاء وحداد (Bereavement Leave - مادة 77)',
    unpaid: 'إجازة بدون راتب (Unpaid Leave)',
  };

  const formRef = `PAM-LV-${request.id || '2026-001'}`;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-xs my-6 text-right font-sans" dir="rtl">
        
        {/* Actions Bar on top (Hidden during print) */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-lg">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">استمارة طلب إجازة رسمية وإقرار تسليم مهام (Official Leave Form)</h3>
              <p className="text-[11px] text-slate-500">جاهزة للطباعة والاعتماد الإداري وفق قانون العمل الكويتي رقم 6 لسنة 2010</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => safePrintAction(`استمارة_إجازة_${request.employeeName}_${request.id}`)}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer size={15} /> طباعة الاستمارة (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- PRINTABLE DOCUMENT CONTAINER --- */}
        <div id="printable-leave-document" className="border border-slate-300 rounded-xl p-6 bg-white space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="text-right">
              <h2 className="text-base font-black text-slate-900">{activeCompanyName}</h2>
              <p className="text-[11px] text-slate-600 font-medium">إدارة الموارد البشرية والشؤون الإدارية (HR Dept)</p>
              <p className="text-[10px] text-slate-500 font-mono">ملف الشؤون (PAM): {pamFileNumber} | الرقم المدني للجهة: {civilIdCompany}</p>
            </div>
            <div className="text-center">
              <div className="border border-slate-800 px-4 py-1.5 rounded-lg bg-slate-50">
                <span className="block text-xs font-black text-slate-900">استمارة إجازة رسمية</span>
                <span className="block text-[10px] font-mono text-slate-500">{formRef}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">التاريخ: {todayStr}</span>
            </div>
            <div className="text-left text-[11px] text-slate-500 font-mono">
              <span>دولة الكويت</span>
              <span className="block text-[10px]">قانون العمل رقم 6/2010</span>
              <span className="block text-emerald-700 font-bold text-[10px]">نظام Odoo 18 المعتمد</span>
            </div>
          </div>

          {/* Employee Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-[11px]">
              <User size={14} className="text-[#714B67]" />
              أولاً: بيانات الموظف طالب الإجازة (Employee Information)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">اسم الموظف:</span>
                <span className="font-bold text-slate-900">{request.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الرقم المدني:</span>
                <span className="font-mono font-bold text-slate-800">{request.civilId || '---'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">القسم / الإدارة:</span>
                <span className="font-bold text-slate-800">{request.department || 'الإدارة العامة'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الراتب الشامل:</span>
                <span className="font-mono font-bold text-emerald-800">{request.totalSalary?.toFixed(3) || '0.000'} د.ك</span>
              </div>
            </div>
          </div>

          {/* Leave Details Card */}
          <div className="border border-slate-200 rounded-xl p-3.5">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-[11px]">
              <Calendar size={14} className="text-[#714B67]" />
              ثانياً: بيانات الإجازة والمدة المطلوبة (Leave Specifications)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">نوع الإجازة:</span>
                <span className="font-bold text-[#714B67]">{leaveTypeNamesAr[request.leaveType] || request.leaveType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">تاريخ البداية:</span>
                <span className="font-mono font-bold text-slate-900">{request.startDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">تاريخ الانتهاء:</span>
                <span className="font-mono font-bold text-slate-900">{request.endDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المدة الفعلية المعتمدة:</span>
                <span className="font-black text-emerald-800 text-sm">{request.daysCount}</span> <span className="text-slate-500 font-bold">يوم عمل</span>
              </div>
            </div>
            {request.reason && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-bold">سبب الإجازة: </span>
                <span className="text-slate-800">{request.reason}</span>
              </div>
            )}
          </div>

          {/* Replacement Staff & Work Handover Pledge */}
          <div className="border border-purple-200 bg-purple-50/40 rounded-xl p-3.5">
            <h4 className="font-bold text-purple-950 mb-1.5 flex items-center gap-1.5 text-[11px]">
              <ShieldCheck size={14} className="text-[#714B67]" />
              ثالثاً: إقرار تغطية واستلام مهام العمل من الموظف البديل (Replacement Handover)
            </h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              أقر أنا الموظف البديل الموضح اسمي أدناه بأنني تسلمت كافة ملفات ومهام العمل الخاصة بالزميل/ <strong>{request.employeeName}</strong>، وأتعهد بمتابعة كافة الأعمال المنوطة به طوال فترة إجازته وحتى مباشرته للعمل دون أي تأخير.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs pt-2 border-t border-purple-200/60">
              <div>
                <span className="text-slate-400 block text-[10px]">اسم الموظف البديل:</span>
                <span className="font-bold text-purple-900">{request.replacementEmployee || 'تم التكليف من قبل رئيس القسم'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">حالة التغطية:</span>
                <span className="font-bold text-emerald-700">موافق ومستلم للمهام</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">توقيع الموظف البديل:</span>
                <div className="border-b border-dashed border-slate-400 h-5 w-32 mt-1"></div>
              </div>
            </div>
          </div>

          {/* Kuwait Labor Law Article 71 Note */}
          {request.leaveType === 'annual' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-900 leading-relaxed">
              <strong className="text-amber-950 font-bold">تنويه قانوني (المادة 71 من قانون العمل الكويتي):</strong> يُصرف للعامل أجره عن الإجازة السنوية مقدماً قبل قيامه بها، ولا يجوز النزول عن حق الإجازة أو الاستعاضة عنها ببدل مالي إلا عند انتهاء عقد العمل أو باتفاق الطرفين.
            </div>
          )}

          {/* Official Endorsements & Signatures (Triple Signature Grid) */}
          <div className="pt-3 border-t-2 border-slate-800">
            <h4 className="font-black text-slate-900 mb-3 text-center text-xs">
              الاعتمادات والموافقات الرسمية (Administrative Approvals)
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              
              {/* Box 1: Employee */}
              <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">1. توقيع طالب الإجازة</span>
                <span className="text-[10px] text-slate-500 block">{request.employeeName}</span>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  <span className="text-[9px] text-slate-300">التوقيع</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono block">التاريخ: {request.appliedDate || todayStr}</span>
              </div>

              {/* Box 2: Direct Manager */}
              <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">2. موافقة المدير المباشر</span>
                <span className="text-[10px] text-slate-500 block">
                  {request.managerApprovedBy ? `المعتمد: ${request.managerApprovedBy}` : 'رئيس القسم / المدير المباشر'}
                </span>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  {request.managerApprovedBy ? (
                    <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={12} /> معتمد إلكترونياً
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-300">التوقيع والخاتم</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-mono block">
                  {request.managerApprovedAt ? request.managerApprovedAt.slice(0, 10) : 'التاريخ: .... / .... / 2026'}
                </span>
              </div>

              {/* Box 3: HR & General Manager */}
              <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">3. اعتماد الموارد البشرية</span>
                <span className="text-[10px] text-slate-500 block">
                  {request.hrApprovedBy ? `المعتمد: ${request.hrApprovedBy}` : 'إدارة الموارد البشرية والشؤون القانونية'}
                </span>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  {request.hrApprovedBy ? (
                    <span className="text-purple-900 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={12} /> معتمد ومسجل بالسجلات
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-300">الختم الرسمي للمنشأة</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-mono block">
                  {request.hrApprovedAt ? request.hrApprovedAt.slice(0, 10) : 'التاريخ: .... / .... / 2026'}
                </span>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t text-center text-[9px] text-slate-400 flex items-center justify-between font-mono">
            <span>تم الإنشاء عبر منظومة Aysed S HR 2026 - Odoo 18 Time Off Hub</span>
            <span>النسخة الأصلية تحفظ في ملف خدمة الموظف</span>
          </div>

        </div>
      </div>
    </div>
  );
};
