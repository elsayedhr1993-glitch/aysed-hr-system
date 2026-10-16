import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AnimatePresence, motion } from 'motion/react';
import { useLang } from '../lib/i18n';
import { useAuth } from '../context/AuthContext';
import { brand, hasBrandSupport } from '../config/brand';

const REMEMBER_ME_KEY = 'aysed_remember_me';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loginCopy(translate: (key: string) => string) {
  return {
    badge: translate('login_badge'),
    title: translate('login_title'),
    subtitle: translate('login_subtitle'),
    leftTitle: brand.name,
    leftSubtitle: translate('login_left_subtitle'),
    hero: translate('login_hero'),
    secureCloud: translate('login_secure_cloud'),
    emailLabel: translate('login_email'),
    passwordLabel: translate('login_password'),
    forgotPassword: translate('login_forgot'),
    resetSending: translate('login_sending'),
    rememberMe: translate('login_remember'),
    submit: translate('login_submit'),
    loadingSubmit: translate('login_loading'),
    lockTitle: translate('login_lock_title'),
    lockRemaining: translate('login_lock_remaining'),
    terms: translate('login_terms'),
    privacy: translate('login_privacy'),
    footerSecurity: translate('login_footer'),
    emailPlaceholder: 'name@company.com',
    emailRequired: translate('login_email_required'),
    emailInvalid: translate('login_email_invalid'),
    passwordRequired: translate('login_password_required'),
    loginInvalid: translate('login_invalid'),
    loginThrottled: translate('login_invalid'),
    loginGeneric: translate('login_invalid'),
    lockedError: translate('login_invalid'),
    resetNeedEmail: translate('login_reset_need_email'),
    resetSuccess: translate('login_reset_sent'),
    resetFailed: translate('login_reset_sent'),
    showPassword: translate('login_show_password'),
    hidePassword: translate('login_hide_password'),
    langAr: translate('lang_name_ar'),
    langEn: translate('lang_name_en'),
    supportTitle: translate('login_support'),
    supportLink: translate('login_support_link'),
    featureLines: [
      translate('login_feature_1'),
      translate('login_feature_2'),
      translate('login_feature_3'),
    ],
  };
}

export const OdooLoginPage: React.FC = () => {
  const { lang, setLang, t: translate } = useLang();
  const { user: sessionUser, isLoading: authHydrating } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
  const resetToken = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('resetToken') || '';
  }, []);
  const [newPassword, setNewPassword] = useState('');

  const isArabic = lang === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const t = loginCopy(translate);
  const isBusy = isLoading || isResettingPassword || isSigningIn;
  const featureLines = t.featureLines;

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

  const cardAlignment = 'text-start';

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
      const guard = await fetch('/api/auth/login-guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (guard.status === 429) {
        setIsLocked(true);
        setLockoutTime(15 * 60);
        setErrorMsg(t.loginInvalid);
        return;
      }
      persistRememberPreference(rememberMe);
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      awaitingSession = true;
      setIsSigningIn(true);
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      await auth.authStateReady();
      setFailedAttempts(0);
      return;
    } catch {
      awaitingSession = false;
      setIsSigningIn(false);
      await fetch('/api/auth/login-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      }).catch(() => {});
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);
      if (newFailed >= 5) {
        setIsLocked(true);
        setLockoutTime(15 * 60);
      }
      setErrorMsg(t.loginInvalid);
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
      await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      setErrorMsg(t.resetSuccess);
      setFeedbackType('success');
    } catch {
      setErrorMsg(t.resetSuccess);
      setFeedbackType('success');
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (resetToken) {
    return (
      <form
        className="min-h-screen flex items-center justify-center p-6"
        dir={dir}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsResettingPassword(true);
          const res = await fetch('/api/auth/password-reset/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken, password: newPassword }),
          });
          setIsResettingPassword(false);
          setFeedbackType(res.ok ? 'success' : 'error');
          setErrorMsg(res.ok ? t.resetSuccess : t.loginInvalid);
        }}
      >
        <div className="w-full max-w-sm space-y-3">
          <h1 className="text-lg font-bold">{t.forgotPassword}</h1>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="new-password"
          />
          {errorMsg && <p className="text-sm">{errorMsg}</p>}
          <button type="submit" className="w-full bg-slate-900 text-white rounded-lg py-2" disabled={isResettingPassword}>
            {t.submit}
          </button>
        </div>
      </form>
    );
  }

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
            {brand.logoSrc ? (
              <img src={brand.logoSrc} alt={brand.logoAlt} className="w-12 h-12 rounded-xl bg-white object-contain shadow-md" />
            ) : (
              <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                <Shield size={22} className="text-[#16476b]" />
              </div>
            )}
            <div>
              <span className="text-2xl font-black tracking-tight text-white block">{t.leftTitle}</span>
              <span className="text-sm text-slate-300 font-medium leading-snug block mt-1 max-w-md">{t.leftSubtitle}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl leading-tight font-black text-white max-w-xl mt-4">
            {brand.name}
          </h1>
          <p className="text-base text-slate-300 mt-3 max-w-xl leading-relaxed font-medium">
            {t.hero}
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
          <span className="bg-black/25 px-2 py-1 rounded font-medium">{brand.name}</span>
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
                    className="w-full p-3.5 ps-11 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:border-[#1f6a7a] focus:ring-2 focus:ring-[#1f6a7a]/20 outline-none text-slate-900 text-xs transition-all"
                    placeholder={t.emailPlaceholder}
                    autoComplete="email"
                    required
                    dir="ltr"
                    disabled={isBusy}
                  />
                  <Mail size={17} className="absolute start-3.5 top-3.5 text-slate-400 group-focus-within:text-[#1f6a7a] transition-colors" />
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
                    className="w-full p-3.5 ps-11 pe-11 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:border-[#1f6a7a] focus:ring-2 focus:ring-[#1f6a7a]/20 outline-none text-slate-900 text-xs transition-all"
                    placeholder=""
                    autoComplete="off"
                    required
                    dir="ltr"
                    disabled={isBusy}
                  />
                  <Lock size={17} className="absolute start-3.5 top-3.5 text-slate-400 group-focus-within:text-[#1f6a7a] transition-colors" />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    disabled={isBusy}
                    className="absolute end-3.5 top-3.5 text-slate-400 hover:text-[#1f6a7a] disabled:opacity-50"
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
                    <ArrowRight size={15} className="directional-icon" />
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

            {hasBrandSupport() && (
              <div
                className={`w-full mt-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5 space-y-2 ${cardAlignment}`}
                aria-label={t.supportTitle}
              >
                <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-snug">{t.supportTitle}</p>
                {brand.supportEmail && (
                  <a
                    href={`mailto:${brand.supportEmail}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 text-slate-700 hover:border-[#1f6a7a]/30 hover:text-[#1f6a7a] transition-colors"
                  >
                    <Mail size={14} aria-hidden />
                    <span className="text-[11px] font-bold truncate dir-ltr text-left" dir="ltr">{brand.supportEmail}</span>
                  </a>
                )}
                {brand.supportUrl && (
                  <a
                    href={brand.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#1f6a7a] hover:underline"
                  >
                    {t.supportLink}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OdooLoginPage;
