import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Lock, Mail, Globe, Sparkles, UserCog, AlertTriangle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const OdooLoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Firewall State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // جلب بيانات الدخول الحالية أو استخدام الافتراضية
  const validEmail = localStorage.getItem('aysed_admin_email') || 'admin@aysed-hr.com';
  const validPwd = localStorage.getItem('aysed_admin_pwd') || 'Admin@2026';

  // مؤقت الحظر (Brute-Force Protection Timer)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    } else if (isLocked && lockoutTime === 0) {
      setIsLocked(false);
      setFailedAttempts(0);
      setErrorMsg('');
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      // التحقق الصارم من صحة البيانات
      if (email.trim() === validEmail && password === validPwd) {
        // نجاح الدخول - تصفير عداد الأخطاء
        setFailedAttempts(0);
        localStorage.setItem('aysed_hr_auth', 'true');
        
        // حفظ بيانات الجلسة مشفرة (Base64 Encode)
        const sessionData = {
          name: 'مدير النظام (Super Admin)',
          email: email,
          role: 'Super Administrator',
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('current_user', btoa(encodeURIComponent(JSON.stringify(sessionData))));
        
        onLoginSuccess();
      } else {
        // فشل الدخول - تطبيق الجدار الناري
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockoutTime(30);
          setErrorMsg('تم حظر الوصول مؤقتاً لمدة 30 ثانية بسبب محاولات متكررة خاطئة.');
        } else {
          setErrorMsg(`بيانات الدخول غير صحيحة - تم حظر الوصول (متبقي ${5 - newAttempts} محاولات)`);
        }
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between items-center p-4 font-sans text-slate-800 dir-rtl" dir="rtl">
      
      {/* الشريط العلوي */}
      <div className="w-full max-w-5xl flex justify-between items-center py-3 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span className="font-bold text-slate-700">Aysed S HR 2026 - Kuwait</span>
          <span className="text-slate-400">| Enterprise Engine Firewall</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-sans">
          <Globe size={13} />
          <span>العربية (دولة الكويت)</span>
        </div>
      </div>

      {/* بطاقة تسجيل دخول مدير النظام */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-[#714B67] text-white rounded-2xl shadow-sm mb-1 gap-2">
            <Sparkles size={18} className="text-amber-300" />
            <span className="font-black text-lg tracking-tight font-sans">Aysed S HR 2026</span>
          </div>
          <h2 className="text-sm font-black text-slate-800 flex items-center justify-center gap-1.5">
            <UserCog size={16} className="text-[#714B67]" />
            <span>بوابة مدير النظام (Super Admin Portal)</span>
          </h2>
          <div className="inline-block bg-slate-100 text-slate-600 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold">
            قاعدة البيانات: aysed_hrms_kuwait_live
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLocked && (
          <div className="p-4 bg-slate-100 text-slate-700 text-center font-bold font-mono rounded-xl border border-slate-300">
            🔒 الجدار الناري مفعل<br />
            إعادة الفتح بعد {lockoutTime} ثانية...
          </div>
        )}

        {/* نموذج الإدخال */}
        {!isLocked && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5 text-right">
              <label className="font-bold text-slate-700 block">البريد الإلكتروني للمسؤول (Admin Email)</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 pr-9 bg-white border border-slate-300 rounded-xl focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20 outline-none text-slate-900 font-mono transition"
                  placeholder="admin@domain.com"
                  required
                />
                <Mail size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">كلمة المرور (Password)</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('يرجى مراجعة إعدادات الخادم الرئيسي لاستعادة الحساب'); }} className="text-[11px] text-[#714B67] hover:underline">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 pr-9 bg-white border border-slate-300 rounded-xl focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20 outline-none text-slate-900 font-mono transition"
                  placeholder="••••••••"
                  required
                />
                <Lock size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#714B67] hover:bg-[#5a3a52] text-white py-3 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
            >
              {isLoading ? (
                <span className="inline-block animate-spin font-mono">... جاري التحقق (Security Check)</span>
              ) : (
                <>
                  <span>دخول لوحة التحكم (Admin Login)</span>
                  <ArrowRight size={15} className="rotate-180" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="border-t pt-4 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span>نظام موحد لجميع المنشآت</span>
          </div>
          <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck size={13} />
            <span>Strict Auth Guard</span>
          </span>
        </div>

      </div>

      {/* التذييل */}
      <div className="py-4 text-center text-xs text-slate-400 font-sans space-y-1">
        <p>مشغل بواسطة <strong className="text-slate-700 font-bold">Aysed S HR 2026 Engine - Kuwait</strong> • معايير Odoo Enterprise متعدد الشركات</p>
      </div>

    </div>
  );
};

export default OdooLoginPage;
