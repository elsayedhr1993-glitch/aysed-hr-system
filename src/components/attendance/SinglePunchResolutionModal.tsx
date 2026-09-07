import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, CheckCircle2, User, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SinglePunchResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    date: string;
    checkIn: string;
    checkOut?: string;
  } | null;
  onResolve: (recordId: string, checkOut: string, reason: string) => void;
}

const COMMON_RESOLVE_REASONS = [
  'نسيان التبصيم عند الانصراف مع إفادة المشرف',
  'خروج مباشر لمهمة عمل ميدانية خارجية',
  'انقطاع تيار كهربائي / عطل في جهاز البصمة وقت الخروج',
  'استئذان طارئ معتمد من الإدارة',
  'مغادرة مع الوفد الرسمي للمنشأة'
];

export const SinglePunchResolutionModal: React.FC<SinglePunchResolutionModalProps> = ({
  isOpen,
  onClose,
  record,
  onResolve
}) => {
  const [checkOut, setCheckOut] = useState('16:00');
  const [reason, setReason] = useState(COMMON_RESOLVE_REASONS[0]);

  useEffect(() => {
    if (record) {
      // Default to 8 hours after checkIn or 16:00
      setCheckOut('16:00');
      setReason(COMMON_RESOLVE_REASONS[0]);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkOut) {
      toast.error('يرجى تحديد وقت الانصراف');
      return;
    }
    onResolve(record.id, checkOut, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-rose-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">تصحيح وإغلاق البصمة الواحدة</h3>
              <p className="text-xs text-slate-500">
                إدخال وقت الانصراف المعتمد لمن نسوا التبصيم
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Employee Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{record.employeeName}</span>
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                {record.employeeId}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                <span>{record.date}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-emerald-600" />
                <span>حضور: <strong className="font-mono text-emerald-700">{record.checkIn}</strong></span>
              </span>
            </div>
          </div>

          {/* Check-Out Time Input */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              وقت الانصراف الفعلي المعتمد <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white">
              <Clock size={16} className="text-blue-600" />
              <input
                type="time"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full outline-none font-mono font-bold text-sm text-blue-700 bg-transparent"
                required
              />
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              مبرر وسند إغلاق البصمة <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#714B67]"
            >
              {COMMON_RESOLVE_REASONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>اعتماد وإغلاق البصمة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
