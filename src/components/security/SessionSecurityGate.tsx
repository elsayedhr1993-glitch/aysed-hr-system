import React, { useEffect, useState } from 'react';
import { buildAuthedJsonHeaders } from '../../lib/clientAuth';
import { totpRequiredForRole } from '../../security/accessRoles';

type Policy = {
  role: string;
  totpRequired: boolean;
  totpEnrolled: boolean;
  mustChangePassword: boolean;
};

type Step = 'loading' | 'ready' | 'totp' | 'enroll' | 'password';

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = await buildAuthedJsonHeaders();
  return fetch(path, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
    credentials: 'same-origin',
  });
}

export const SessionSecurityGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<Step>('loading');
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [optionalDismissed, setOptionalDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authedFetch('/api/auth/session-policy');
        if (!res.ok) {
          if (!cancelled) setStep('ready');
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const next: Policy = {
          role: String(data.role || ''),
          totpRequired: Boolean(data.totpRequired),
          totpEnrolled: Boolean(data.totpEnrolled),
          mustChangePassword: Boolean(data.mustChangePassword),
        };
        setPolicy(next);
        if (next.mustChangePassword) {
          setStep('password');
          return;
        }
        if (next.totpRequired && next.totpEnrolled) {
          setStep('totp');
          return;
        }
        if (next.totpRequired && !next.totpEnrolled) {
          if (sessionStorage.getItem('aysed_totp_enroll_deferred') === '1') {
            setStep('ready');
            return;
          }
          const setup = await authedFetch('/api/auth/totp/setup');
          const body = await setup.json().catch(() => ({}));
          if (!cancelled && setup.ok && body.secret) setSecret(String(body.secret));
          setStep('enroll');
          return;
        }
        setStep('ready');
      } catch {
        if (!cancelled) setStep('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const verify = async () => {
    setMessage('');
    const res = await authedFetch('/api/auth/totp/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      setStep('ready');
      return;
    }
    setMessage('رمز التحقق غير صحيح');
  };

  const confirmEnroll = async () => {
    setMessage('');
    const res = await authedFetch('/api/auth/totp/confirm', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      setStep('ready');
      return;
    }
    setMessage('تعذر تثبيت التحقق بخطوتين');
  };

  const changePassword = async () => {
    setMessage('');
    const res = await authedFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setStep(policy?.totpRequired ? (policy.totpEnrolled ? 'totp' : 'enroll') : 'ready');
      return;
    }
    setMessage('تعذر تغيير كلمة المرور');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        جاري التحقق من الجلسة...
      </div>
    );
  }

  if (step === 'password' || step === 'totp' || step === 'enroll') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
        <form
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (step === 'password') void changePassword();
            else if (step === 'totp') void verify();
            else void confirmEnroll();
          }}
        >
          <h1 className="text-lg font-bold text-slate-900">
            {step === 'password' ? 'تغيير كلمة المرور' : 'التحقق بخطوتين'}
          </h1>
          {step === 'password' ? (
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="كلمة المرور الجديدة"
              autoComplete="new-password"
            />
          ) : (
            <>
              {step === 'enroll' && secret && (
                <p className="text-xs text-slate-600 break-all" dir="ltr">
                  {secret}
                </p>
              )}
              <input
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="رمز التطبيق"
                autoComplete="one-time-code"
              />
            </>
          )}
          {message && <p className="text-sm text-rose-700">{message}</p>}
          <button type="submit" className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm">
            متابعة
          </button>
        </form>
      </div>
    );
  }

  const offerOptional =
    policy &&
    !optionalDismissed &&
    !policy.totpEnrolled &&
    !totpRequiredForRole(policy.role) &&
    policy.role !== 'UNKNOWN';

  return (
    <>
      {offerOptional && (
        <div className="no-print bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between gap-3" dir="rtl">
          <span>التحقق بخطوتين اختياري لهذا الدور.</span>
          <button type="button" className="underline" onClick={() => setOptionalDismissed(true)}>
            لاحقاً
          </button>
        </div>
      )}
      {children}
    </>
  );
};
