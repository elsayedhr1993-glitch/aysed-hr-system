import React, { useState } from 'react';
import { X, ShieldCheck, Save, KeyRound, AlertTriangle } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminSecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose, onLogout }) => {
  const currentEmail = localStorage.getItem('aysed_admin_email') || 'admin@aysed-hr.com';
  const currentPwd = localStorage.getItem('aysed_admin_pwd') || 'Admin@2026';

  const [oldPassword, setOldPassword] = useState('');
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (oldPassword !== currentPwd) {
      setError('كلمة المرور الحالية غير صحيحة. عملية مرفوضة.');
      return;
    }
    
    if (!newEmail.trim() || !newPassword.trim()) {
      setError('يرجى تعبئة جميع الحقول بشكل صحيح.');
      return;
    }

    // حفظ البيانات الجديدة محلياً
    localStorage.setItem('aysed_admin_email', newEmail.trim());
    localStorage.setItem('aysed_admin_pwd', newPassword.trim());
    
    setSuccess('تم تغيير بيانات الدخول بنجاح! سيتم تسجيل خروجك لإعادة تسجيل الدخول...');
    
    setTimeout(() => {
      onClose();
      onLogout();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs font-sans dir-rtl" dir="rtl">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border space-y-4 text-slate-800">
        
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2 font-black text-sm text-[#714B67]">
            <KeyRound size={20} />
            <span>جدار الأمان وتغيير بيانات الدخول</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2 font-bold">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2 font-bold">
            <ShieldCheck size={14} />
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">كلمة المرور الحالية (للتحقق)</label>
            <input 
              type="password" 
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#714B67]"
              required
            />
          </div>

          <div className="pt-3 border-t space-y-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">البريد الإلكتروني الجديد</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#714B67] dir-ltr text-left"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="font-bold text-slate-700">كلمة المرور الجديدة</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#714B67]"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-2 bg-[#714B67] hover:bg-[#5a3a52] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            <Save size={15} />
            <span>حفظ بيانات الدخول الجديدة</span>
          </button>
        </form>

      </div>
    </div>
  );
};
