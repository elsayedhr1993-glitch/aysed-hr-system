import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Clock,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AnimatePresence, motion } from 'motion/react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../context/AuthContext';

const REMEMBER_ME_KEY = 'aysed_remember_me';

type UiLanguage = 'ar' | 'en';

type UiText = {
  badge: string;
  title: string;
  subtitle: string;
  leftTitle: string;
  leftSubtitle: string;
  secureCloud: string;
  emailLabel: string;
  passwordLabel: string;
  forgotPassword: string;
  resetSending: string;
  rememberMe: string;
  submit: string;
  loadingSubmit: string;
  lockTitle: string;
  lockRemaining: string;
  terms: string;
  privacy: string;
  footerSecurity: string;
  emailPlaceholder: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  loginInvalid: string;
  loginThrottled: string;
  loginGeneric: string;
  lockedError: string;
  resetNeedEmail: string;
  resetSuccess: string;
  resetFailed: string;
  showPassword: string;
  hidePassword: string;
  langAr: string;
  langEn: string;
  contactPerson: string;
  contactRole: string;
  contactPhoneLabel: string;
  contactEmailLabel: string;
  contactHours: string;
};

const SUPPORT_WHATSAPP_URL = 'https://wa.me/96566968180';
const SUPPORT_EMAIL = 'elsayedhr1993@gmail.com';
const SUPPORT_PHONE_DISPLAY = '+965 66968180';

const UI_TEXT: Record<UiLanguage, UiText> = {
  ar: {
    badge: 'بوابة دخول مؤسسية',
    title: 'تسجيل الدخول',
    subtitle: 'أدخل بيانات الحساب المعتمد للوصول إلى بيئة الشركة.',
    leftTitle: 'منظومة Aysed HR 2026',
    leftSubtitle: 'الحل المؤسسي الشامل للموارد البشرية والامتثال الكويتي',
    secureCloud: 'بيئة سحابية مؤمنة للشركات',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetSending: 'جاري الإرسال...',
    rememberMe: 'تذكرني على هذا الجهاز',
    submit: 'تسجيل الدخول',
    loadingSubmit: 'جاري تسجيل الدخول وتجهيز بيئة الشركة...',
    lockTitle: 'تم قفل المحاولات مؤقتا',
    lockRemaining: 'الوقت المتبقي',
    terms: 'شروط الاستخدام المؤسسي',
    privacy: 'سياسة الخصوصية',
    footerSecurity: 'يتم تطبيق سياسات الأمان المؤسسية على جلسة الدخول.',
    emailPlaceholder: 'name@company.com',
    emailRequired: 'يرجى إدخال البريد الإلكتروني.',
    emailInvalid: 'صيغة البريد الإلكتروني غير صحيحة.',
    passwordRequired: 'يرجى إدخال كلمة المرور.',
    loginInvalid: 'بيانات الدخول غير صحيحة.',
    loginThrottled: 'تم تقييد المحاولات مؤقتا. يرجى المحاولة لاحقا.',
    loginGeneric: 'تعذر إتمام تسجيل الدخول حاليا. يرجى المحاولة مرة أخرى.',
    lockedError: 'تم تعليق المحاولات لمدة 60 ثانية لحماية الحساب.',
    resetNeedEmail: 'أدخل البريد الإلكتروني أولا لإرسال رابط الاستعادة.',
    resetSuccess: 'تم إرسال رابط استعادة كلمة المرور إلى البريد الإلكتروني.',
    resetFailed: 'تعذر إرسال رابط الاستعادة حاليا. يرجى المحاولة لاحقا.',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    langAr: 'العربية',
    langEn: 'English',
    contactPerson: 'السيد بخيت سويلم',
    contactRole: 'تطوير المنظومة والدعم الفني',
    contactPhoneLabel: 'هاتف / واتساب',
    contactEmailLabel: 'البريد الإلكتروني',
    contactHours: 'ساعات العمل: السبت – الخميس (9:00 ص – 9:00 م)',
  },
  en: {
    badge: 'Enterprise Access Gateway',
    title: 'Sign In',
    subtitle: 'Use your approved account credentials to access your company workspace.',
    leftTitle: 'Aysed HR 2026',
    leftSubtitle: 'Enterprise HR & Kuwait compliance platform',
    secureCloud: 'Secure business cloud environment',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    resetSending: 'Sending...',
    rememberMe: 'Remember me on this device',
    submit: 'Sign In',
    loadingSubmit: 'Signing in and preparing your workspace...',
    lockTitle: 'Sign-in attempts temporarily locked',
    lockRemaining: 'Time remaining',
    terms: 'Enterprise Terms of Use',
    privacy: 'Privacy Policy',
    footerSecurity: 'Enterprise security policies are enforced for this sign-in session.',
    emailPlaceholder: 'name@company.com',
    emailRequired: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
    passwordRequired: 'Please enter your password.',
    loginInvalid: 'Invalid login credentials.',
    loginThrottled: 'Too many attempts. Please try again later.',
    loginGeneric: 'Unable to complete sign-in right now. Please try again.',
    lockedError: 'Attempts are blocked for 60 seconds to protect your account.',
    resetNeedEmail: 'Enter your email first to receive a reset link.',
    resetSuccess: 'A password reset link has been sent to your email.',
    resetFailed: 'Unable to send reset link right now. Please try again later.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    langAr: 'العربية',
    langEn: 'English',
    contactPerson: 'Mr. Bukhit Suwailam',
    contactRole: 'Platform development & technical support',
    contactPhoneLabel: 'Phone / WhatsApp',
    contactEmailLabel: 'Email',
    contactHours: 'Hours: Sat – Thu (9:00 AM – 9:00 PM)',
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FEATURE_SLIDES: Record<UiLanguage, string[]> = {
  ar: [
    'توليد معتمد لملفات حماية الأجور الكويتية (WPS & CBK)',
    'محرك قانوني لمستحقات العمل، الإجازات، ونهاية الخدمة',
    'حوكمة مركزية للوثائق والتراخيص الحكومية',
  ],
  en: [
    'Certified Kuwait WPS & CBK payroll file generation',
    'Legal engine for leave, payroll, and end-of-service entitlements',
    'Centralized governance for documents and government licenses',
  ],
};

export const OdooLoginPage: React.FC = () => {
  const { lang, setLang } = useLang();
  const { user: sessionUser, isLoading: authHydrating } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [featureSlide, setFeatureSlide] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'error' | 'success'>('error');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const language: UiLanguage = lang;
  const isArabic = lang === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const t = UI_TEXT[language];
  const isBusy = isLoading || isResettingPassword || isSigningIn;
  const featureLines = FEATURE_SLIDES[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setFeatureSlide((prev) => (prev + 1) % featureLines.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [featureLines.length]);

  useEffect(() => {
    if (!isSigningIn) return;
    if (!sessionUser || authHydrating) return;

    const role = String(sessionUser.role || '').toUpperCase();
    const companyId =
      sessionUser.companyId ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('activeCompanyId') || localStorage.getItem('lastActiveCompanyId')
        : '') ||
      '';

    if (role === 'SUPER_ADMIN' || companyId) {
      setIsSigningIn(false);
      setIsLoading(false);
    }
  }, [isSigningIn, sessionUser, authHydrating]);

  useEffect(() => {
    if (!isSigningIn) return;
    const timeout = setTimeout(() => {
      setIsSigningIn(false);
      setIsLoading(false);
      setErrorMsg(t.loginGeneric);
      setFeedbackType('error');
    }, 30000);
    return () => clearTimeout(timeout);
  }, [isSigningIn, t.loginGeneric]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isLocked && lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    } else if (isLocked && lockoutTime === 0) {
      setIsLocked(false);
      setFailedAttempts(0);
      setErrorMsg('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockoutTime]);

  const cardAlignment = useMemo(() => (isArabic ? 'text-right' : 'text-left'), [isArabic]);

  const persistRememberPreference = (enabled: boolean) => {
    try {
      if (enabled) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        sessionStorage.removeItem(REMEMBER_ME_KEY);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        sessionStorage.setItem(REMEMBER_ME_KEY, 'false');
      }
    } catch {}
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isBusy) return;

    setErrorMsg('');
    setFeedbackType('error');
    setIsLoading(true);
    setIsSigningIn(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMsg(t.emailRequired);
      setIsLoading(false);
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg(t.emailInvalid);
      setIsLoading(false);
      return;
    }

    if (!cleanPassword) {
      setErrorMsg(t.passwordRequired);
      setIsLoading(false);
      return;
    }

    let awaitingSession = false;
    try {
      persistRememberPreference(rememberMe);
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      awaitingSession = true;
      setIsSigningIn(true);
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      await auth.authStateReady();
      setFailedAttempts(0);
      return;
    } catch (error: any) {
      awaitingSession = false;
      setIsSigningIn(false);
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);

      if (newFailed >= 4) {
        setIsLocked(true);
        setLockoutTime(60);
        setErrorMsg(t.lockedError);
      } else if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password' || error?.code === 'auth/user-not-found') {
        setErrorMsg(`${t.loginInvalid} (${4 - newFailed})`);
      } else if (error?.code === 'auth/too-many-requests') {
        setErrorMsg(t.loginThrottled);
      } else {
        setErrorMsg(t.loginGeneric);
      }
    } finally {
      if (!awaitingSession) setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (isBusy || isLocked) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setFeedbackType('error');
      setErrorMsg(t.resetNeedEmail);
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setFeedbackType('error');
      setErrorMsg(t.emailInvalid);
      return;
    }

    setIsResettingPassword(true);
    setErrorMsg('');

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setErrorMsg(t.resetSuccess);
      setFeedbackType('success');
    } catch {
      setErrorMsg(t.resetFailed);
      setFeedbackType('error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-800 selection:bg-[#1f4d4d] selection:text-white" dir={dir}>
      <motion.div
        initial={{ opacity: 0, x: isArabic ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0f2b46] via-[#16476b] to-[#1f6a7a] flex-col justify-between p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
              <Shield size={22} className="text-[#16476b]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block">{t.leftTitle}</span>
              <span className="text-sm text-slate-300 font-medium leading-snug block mt-1 max-w-md">{t.leftSubtitle}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl leading-tight font-black text-white max-w-xl mt-4">
            {isArabic ? 'منظومة Aysed HR 2026' : 'Aysed HR 2026'}
          </h1>
          <p className="text-base text-slate-300 mt-3 max-w-xl leading-relaxed font-medium">
            {isArabic
              ? 'الحل المؤسسي الشامل للموارد البشرية والامتثال الكويتي'
              : 'Your enterprise suite for HR operations and Kuwait regulatory compliance'}
          </p>

          <div className="mt-10 min-h-[5.5rem] max-w-xl">
            <AnimatePresence mode="wait">
              <motion.p
                key={featureSlide}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-lg sm:text-xl font-bold text-white leading-relaxed"
              >
                «{featureLines[featureSlide]}»
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-1.5 mt-4">
              {featureLines.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === featureSlide ? 'w-8 bg-white' : 'w-2 bg-white/35'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-slate-300 text-xs border-t border-white/20 pt-5">
          <div className="flex items-center gap-2">
            <Globe size={15} />
            <span>{t.secureCloud}</span>
          </div>
          <span className="bg-black/25 px-2 py-1 rounded font-medium">Enterprise</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 xl:p-16 bg-[#f8fbfc]"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl p-6 sm:p-8 space-y-6 relative">
          {isSigningIn && (
            <div className="absolute inset-0 z-20 rounded-3xl bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 text-center px-6">
              <Loader2 size={28} className="animate-spin text-[#1f6a7a]" />
              <p className="text-sm font-bold text-slate-800">{t.loadingSubmit}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className={`space-y-1 ${cardAlignment}`}>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                <ShieldCheck size={12} />
                <span>{t.badge}</span>
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.title}</h2>
              <p className="text-xs text-slate-500 font-medium">{t.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              disabled={isBusy}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              aria-label="Toggle language"
            >
              {isArabic ? t.langEn : t.langAr}
            </button>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role={feedbackType === 'success' ? 'status' : 'alert'}
              aria-live="polite"
              className={`p-3 text-xs font-bold rounded-xl flex items-start gap-2 ${feedbackType === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}
            >
              {feedbackType === 'success' ? <ShieldCheck size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {isLocked && (
            <div className="p-4 bg-slate-900 text-white text-center rounded-2xl border border-slate-800 space-y-1">
              <div className="text-sm font-bold">{t.lockTitle}</div>
              <div className="text-xs text-slate-300">{t.lockRemaining}</div>
              <div className="text-2xl font-black text-amber-300">{lockoutTime}s</div>
            </div>
          )}

          {!isLocked && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="font-bold text-xs text-slate-700 block">{t.emailLabel}</label>
                <div className="relative group">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3.5 ${isArabic ? 'pr-11' : 'pl-11'} bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:border-[#1f6a7a] focus:ring-2 focus:ring-[#1f6a7a]/20 outline-none text-slate-900 text-xs transition-all`}
                    placeholder={t.emailPlaceholder}
                    autoComplete="email"
                    required
                    dir="ltr"
                    disabled={isBusy}
                  />
                  <Mail size={17} className={`absolute ${isArabic ? 'right-3.5' : 'left-3.5'} top-3.5 text-slate-400 group-focus-within:text-[#1f6a7a] transition-colors`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="font-bold text-xs text-slate-700 block">{t.passwordLabel}</label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isBusy}
                    className="text-[11px] font-bold text-[#1f6a7a] hover:underline disabled:opacity-50"
                  >
                    {isResettingPassword ? t.resetSending : t.forgotPassword}
                  </button>
                </div>

                <div className="relative group">
                  <input
                    id="login-password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-3.5 ${isArabic ? 'pr-11' : 'pl-11'} ${isArabic ? 'pl-11' : 'pr-11'} bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:border-[#1f6a7a] focus:ring-2 focus:ring-[#1f6a7a]/20 outline-none text-slate-900 text-xs transition-all`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    dir="ltr"
                    disabled={isBusy}
                  />
                  <Lock size={17} className={`absolute ${isArabic ? 'right-3.5' : 'left-3.5'} top-3.5 text-slate-400 group-focus-within:text-[#1f6a7a] transition-colors`} />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    disabled={isBusy}
                    className={`absolute ${isArabic ? 'left-3.5' : 'right-3.5'} top-3.5 text-slate-400 hover:text-[#1f6a7a] disabled:opacity-50`}
                    aria-label={isPasswordVisible ? t.hidePassword : t.showPassword}
                  >
                    {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isBusy}
                  className="w-4 h-4 rounded border-slate-300 text-[#1f6a7a] focus:ring-[#1f6a7a]/30"
                />
                <span>{t.rememberMe}</span>
              </label>

              <button
                type="submit"
                disabled={isBusy || isLocked}
                aria-busy={isBusy}
                className="w-full bg-[#1f6a7a] hover:bg-[#174f5c] text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isBusy ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>{t.loadingSubmit}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submit}</span>
                    <ArrowRight size={15} className={isArabic ? 'rotate-180' : ''} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-center">
              {t.footerSecurity}
            </span>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-3">
              <span>{t.terms}</span>
              <span>•</span>
              <span>{t.privacy}</span>
            </div>

            <div
              className={`w-full mt-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5 space-y-2.5 ${cardAlignment}`}
              aria-label={isArabic ? 'بيانات التواصل مع الدعم الفني' : 'Technical support contact'}
            >
              <div>
                <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-snug">{t.contactPerson}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t.contactRole}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 text-slate-700 hover:border-[#1f6a7a]/30 hover:text-[#1f6a7a] transition-colors"
                >
                  <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-[#1f6a7a]/8 text-[#1f6a7a]">
                    <Phone size={14} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {t.contactPhoneLabel}
                    </span>
                    <span className="block text-[10px] sm:text-[11px] font-bold dir-ltr text-left" dir="ltr">
                      {SUPPORT_PHONE_DISPLAY}
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 text-slate-700 hover:border-[#1f6a7a]/30 hover:text-[#1f6a7a] transition-colors"
                >
                  <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-[#1f6a7a]/8 text-[#1f6a7a]">
                    <Mail size={14} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {t.contactEmailLabel}
                    </span>
                    <span className="block text-[10px] sm:text-[11px] font-bold truncate dir-ltr text-left" dir="ltr">
                      {SUPPORT_EMAIL}
                    </span>
                  </span>
                </a>
              </div>
              <div className="flex items-start sm:items-center gap-1.5 text-[10px] text-slate-500 font-medium pt-0.5">
                <Clock size={13} className="shrink-0 text-slate-400 mt-0.5 sm:mt-0" aria-hidden />
                <span>{t.contactHours}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OdooLoginPage;
