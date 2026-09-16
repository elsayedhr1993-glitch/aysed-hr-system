import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, Calendar, User, FileText, Info } from 'lucide-react';
import { LeaveRequest } from '../OdooTimeOffApp';

interface ReturnToWorkModalProps {
  request: LeaveRequest | null;
  onClose: () => void;
  onConfirmReturn: (requestId: string, returnDate: string, notes: string, earlyOrDelayedDays: number) => void;
}

export const ReturnToWorkModal: React.FC<ReturnToWorkModalProps> = ({
  request,
  onClose,
  onConfirmReturn
}) => {
  if (!request) return null;

  // Expected return date is the day following endDate
  const getExpectedReturnDate = (endDateStr: string) => {
    try {
      const d = new Date(endDateStr);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const expectedDate = getExpectedReturnDate(request.endDate);
  const [actualReturnDate, setActualReturnDate] = useState<string>(expectedDate);
  const [notes, setNotes] = useState<string>('باشر الموظف مهام عمله بانتظام وتم استلام العهد من الموظف البديل.');
  const [handoverVerified, setHandoverVerified] = useState<boolean>(true);

  // Compute days difference between actual and expected
  const computeDifference = () => {
    try {
      const exp = new Date(expectedDate).getTime();
      const act = new Date(actualReturnDate).getTime();
      const diffMs = act - exp;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  const diffDays = computeDifference();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReturn(request.id, actualReturnDate, notes, diffDays);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs my-6 text-right font-sans" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">تسجيل مباشرة العمل بعد الإجازة (Return to Work)</h3>
              <p className="text-[11px] text-slate-500">إشعار عودة رسمي واستئناف المهام الوظيفية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="flex items-center gap-1">
              <User size={14} className="text-[#714B67]" />
              {request.employeeName}
            </span>
            <span className="text-slate-500 text-[11px]">{request.department}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">فترة الإجازة:</span>
              <span className="font-mono text-slate-700">{request.startDate} إلى {request.endDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">المدة المعتمدة:</span>
              <span className="font-black text-slate-900">{request.daysCount} يوم</span>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-200 text-[11px] flex items-center justify-between">
            <span className="text-slate-500">تاريخ العودة المتوقع رسمياً:</span>
            <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{expectedDate}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              تاريخ مباشرة العمل الفعلي (Actual Return Date) *
            </label>
            <input
              type="date"
              required
              value={actualReturnDate}
              onChange={(e) => setActualReturnDate(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl outline-none font-mono font-bold text-slate-900 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* Diff Status Card */}
          <div className="rounded-xl p-3 border text-xs">
            {diffDays === 0 && (
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-bold">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>باشر الموظف العمل في الموعد المحدد تماماً دون أي تأخير.</span>
              </div>
            )}
            {diffDays > 0 && (
              <div className="flex items-start gap-2 text-amber-900 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">تأخر في مباشرة العمل بمقدار (+{diffDays} يوم)!</span>
                  <span className="text-[10px] text-amber-800">
                    سيتم تنبيه قسم الرواتب لإدراج أيام التأخير إما كـ (خصم غياب غير مدفوع) أو خصمها من رصيد الإجازات السنوية المتبقي بموافقة الإدارة.
                  </span>
                </div>
              </div>
            )}
            {diffDays < 0 && (
              <div className="flex items-center gap-2 text-blue-900 bg-blue-50 border border-blue-200 p-2.5 rounded-lg font-bold">
                <Info size={16} className="text-blue-600 shrink-0" />
                <span>باشر الموظف مبكراً قبل الموعد بـ ({Math.abs(diffDays)} يوم). سيتم استرداد وإضافة الأيام غير المستهلكة لرصيده.</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ملاحظات وتأكيد استئناف المهام
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات تتعلق باستلام المهام أو جاهزية الموظف..."
              className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-[#714B67] text-xs"
            />
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="handoverVerified"
              checked={handoverVerified}
              onChange={(e) => setHandoverVerified(e.target.checked)}
              className="w-4 h-4 text-[#714B67] rounded focus:ring-[#714B67] cursor-pointer"
            />
            <label htmlFor="handoverVerified" className="text-[11px] font-bold text-slate-700 cursor-pointer">
              تم تسليم واسترداد كافة العهد والملفات من الموظف البديل ({request.replacementEmployee || 'البديل المكلف'})
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={15} /> اعتماد تسجيل مباشرة العمل
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
