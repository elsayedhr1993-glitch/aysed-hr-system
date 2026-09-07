import React, { useState } from 'react';
import { X, AlertCircle, Ban, User, Calendar } from 'lucide-react';
import { LeaveRequest } from '../OdooTimeOffApp';

interface LeaveRejectionModalProps {
  request: LeaveRequest | null;
  onClose: () => void;
  onConfirmReject: (requestId: string, reason: string) => void;
  stageLabel: string; // 'موافقة المدير المباشر' or 'اعتماد الموارد البشرية'
}

export const LeaveRejectionModal: React.FC<LeaveRejectionModalProps> = ({
  request,
  onClose,
  onConfirmReject,
  stageLabel
}) => {
  if (!request) return null;

  const [reason, setReason] = useState<string>('');

  const quickPresets = [
    'عدم توفر موظف بديل لتغطية المهام في هذا التوقيت',
    'ضغط العمل في القسم وتزامن ذروة تشغيلية ومواعيد حرجة',
    'تعارض مع إجازات موظفين آخرين في نفس القسم',
    'الرصيد المتاح غير كافٍ لتغطية كامل المدة المطلوبة',
    'عدم تقديم المرفقات والتقارير الطبية الرسمية المعتمدة'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmReject(request.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 text-xs my-6 text-right font-sans" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Ban size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">رفض طلب الإجازة ({stageLabel})</h3>
              <p className="text-[11px] text-slate-500">توثيق السبب الإداري أو القانوني للرفض</p>
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

        {/* Request Summary */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 mb-4 text-[11px] space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <User size={13} className="text-rose-700" />
            <span>{request.employeeName}</span>
            <span className="text-slate-400 font-normal">({request.department})</span>
          </div>
          <div className="text-slate-600 font-mono">
            الفترة: {request.startDate} إلى {request.endDate} ({request.daysCount} يوم)
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              سبب الرفض (Rejection Reason) *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب عدم الموافقة على الطلب..."
              className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-xs"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1.5">أسباب شائعة (انقر للاختيار):</span>
            <div className="flex flex-col gap-1">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="text-right text-[10px] p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 transition text-slate-700 cursor-pointer font-medium"
                >
                  • {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Ban size={15} /> تأكيد قرار الرفض
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
