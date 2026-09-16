import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, FileText, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface ManualPunchPayload {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  reason: string;
  isExcused: boolean;
  notes?: string;
  method: 'تسجيل يدوي (Manual)';
}

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Array<{
    id: string;
    name: string;
    department: string;
    jobTitle?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
  }>;
  selectedDate: string;
  onSave: (record: ManualPunchPayload) => void;
  initialData?: Partial<ManualPunchPayload> | null;
}

const COMMON_REASONS = [
  'مهمة عمل خارجية معتمدة',
  'نسيان التبصيم في الجهاز',
  'عطل فني في جهاز البصمة / انقطاع شبكة',
  'إذن إداري مسبق من المشرف المباشر',
  'استئذان رسمي معتمد براتب',
  'مراجعة طبية طارئة معتمدة',
  'تطبيق جدول مناوبات ميداني'
];

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  isOpen,
  onClose,
  employees,
  selectedDate,
  onSave,
  initialData
}) => {
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || (employees[0]?.id || ''));
  const [date, setDate] = useState(initialData?.date || selectedDate || new Date().toISOString().split('T')[0]);
  const [checkIn, setCheckIn] = useState(initialData?.checkIn || '08:00');
  const [checkOut, setCheckOut] = useState(initialData?.checkOut || '16:00');
  const [reason, setReason] = useState(initialData?.reason || COMMON_REASONS[0]);
  const [isExcused, setIsExcused] = useState(initialData?.isExcused || false);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [searchEmp, setSearchEmp] = useState('');

  useEffect(() => {
    if (initialData) {
      if (initialData.employeeId) setEmployeeId(initialData.employeeId);
      if (initialData.date) setDate(initialData.date);
      if (initialData.checkIn) setCheckIn(initialData.checkIn);
      if (initialData.checkOut) setCheckOut(initialData.checkOut);
      if (initialData.reason) setReason(initialData.reason);
      if (initialData.isExcused !== undefined) setIsExcused(initialData.isExcused);
      if (initialData.notes) setNotes(initialData.notes);
    } else {
      if (employees.length > 0 && !employeeId) {
        setEmployeeId(employees[0].id);
      }
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
    }
  }, [initialData, selectedDate, employees]);

  if (!isOpen) return null;

  const selectedEmployee = employees.find(e => e.id === employeeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error('يرجى اختيار الموظف أولاً');
      return;
    }
    if (!checkIn) {
      toast.error('يرجى إدخال وقت الحضور على الأقل');
      return;
    }

    onSave({
      employeeId,
      date,
      checkIn,
      checkOut,
      reason,
      isExcused,
      notes,
      method: 'تسجيل يدوي (Manual)'
    });

    onClose();
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchEmp.toLowerCase()) || 
    e.id.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.department.toLowerCase().includes(searchEmp.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {initialData ? 'تعديل أو تصحيح سجل الحضور' : 'تسجيل حضور / انصراف يدوي'}
              </h3>
              <p className="text-xs text-slate-500">
                تسجيل حركة دوام معتمدة مع توثيق المبرر وإسقاط التأخير للأعذار الرسمية
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1 text-xs">
          
          {/* Employee Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              الموظف المعني <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="تصفية الموظفين بالاسم أو الكود..."
                value={searchEmp}
                onChange={e => setSearchEmp(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#714B67]"
              />
              <select
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#714B67]"
              >
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>
            {selectedEmployee && (
              <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-2">
                <span>المسمى: <strong>{selectedEmployee.jobTitle || 'موظف'}</strong></span>
                <span>|</span>
                <span>الدوام المعتاد: <strong>{selectedEmployee.shiftStartTime || '08:00'} - {selectedEmployee.shiftEndTime || '16:00'}</strong></span>
              </div>
            )}
          </div>

          {/* Date & Shift Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                تاريخ الدوام <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white">
                <Calendar size={14} className="text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full outline-none font-mono font-bold text-xs bg-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                وقت الحضور (In) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white">
                <Clock size={14} className="text-emerald-600" />
                <input
                  type="time"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full outline-none font-mono font-bold text-xs bg-transparent text-emerald-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                وقت الانصراف (Out)
              </label>
              <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white">
                <Clock size={14} className="text-blue-600" />
                <input
                  type="time"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full outline-none font-mono font-bold text-xs bg-transparent text-blue-700"
                />
              </div>
            </div>
          </div>

          {/* Justification Reason */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              مبرر وسند التسجيل اليدوي <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#714B67]"
            >
              {COMMON_REASONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Excuse / Waiver Checkbox */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="isExcused"
              checked={isExcused}
              onChange={e => setIsExcused(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded mt-0.5 accent-emerald-600 cursor-pointer"
            />
            <label htmlFor="isExcused" className="cursor-pointer text-xs">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-700" />
                <span>إسقاط احتساب التأخير الصباحي (إذن رسمي معتمد)</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                تفعيل هذا الخيار يعفي الموظف من خصومات التأخير الصباحي في مسير الرواتب وحماية الأجور (WPS).
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              ملاحظات إضافية / رقم المعاملة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: تم التأخير بناءً على تكليف المهمة رقم 402 الصادر من الإدارة..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#714B67]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>حفظ واعتماد الحركة</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
