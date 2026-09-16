import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { EmployeeProfile } from '../OdooEmployeesDirectoryApp';

interface EmployeeDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employee: EmployeeProfile | null;
  count?: number;
}

export const EmployeeDeleteConfirmModal: React.FC<EmployeeDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employee,
  count = 1
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl text-right" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-rose-950 text-sm">
                {count > 1 ? `تأكيد حذف ${count} موظفين` : 'تأكيد حذف ملف الموظف'}
              </h3>
              <p className="text-[11px] text-rose-700">
                إجراء نهائي لا يمكن التراجع عنه (Odoo HR Unlink)
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {employee && count === 1 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${employee.avatarBg || 'bg-[#714B67]'} text-white font-bold flex items-center justify-center text-sm shrink-0`}>
                  {employee.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{employee.name}</div>
                  <div className="text-slate-500 text-[11px]">{employee.jobTitle} - {employee.department}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] font-mono">
                <div>الرقم التعريفي: <span className="font-bold text-slate-900">{employee.id}</span></div>
                <div>الرقم المدني: <span className="font-bold text-slate-900">{employee.civilId}</span></div>
              </div>
            </div>
          ) : (
            <p className="font-bold text-slate-900">
              أنت على وشك حذف {count} موظفاً مع كافة البيانات والوثائق الملحقة بهم نهائياً.
            </p>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>تنبيه قانوني (Kuwait HR Law):</strong> سيتم إزالة هذا الموظف من مسيرات الرواتب WPS، وسجلات الحضور، وأرصدة الإجازات.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition cursor-pointer text-xs"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer text-xs"
          >
            <Trash2 size={14} />
            <span>تأكيد الحذف النهائي</span>
          </button>
        </div>

      </div>
    </div>
  );
};
