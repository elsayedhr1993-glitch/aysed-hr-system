import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { buildAuthedJsonHeaders } from '../../lib/clientAuth';
import { canRevealIdentity } from '../../security/accessRoles';
import { maskIdentity, type IdentityKind } from '../../security/identityMask';

interface MaskedValueProps {
  value?: string | number | null;
  kind: IdentityKind;
  fallback?: string;
  /** Official prints: authorized roles see the full value and the view is logged. */
  autoReveal?: boolean;
  purpose?: string;
  className?: string;
}

async function logIdentityView(kind: IdentityKind, purpose: string): Promise<void> {
  try {
    const headers = await buildAuthedJsonHeaders();
    await fetch('/api/audit/identity-view', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ kind, purpose }),
    });
  } catch {
    /* the view log must not block the screen */
  }
}

export const MaskedValue: React.FC<MaskedValueProps> = ({
  value,
  kind,
  fallback = '—',
  autoReveal = false,
  purpose = 'view',
  className = '',
}) => {
  const { user } = useAuth();
  const allowed = canRevealIdentity(user?.role);
  const raw = String(value ?? '').trim();
  const [open, setOpen] = useState(false);
  const logged = useRef(false);

  useEffect(() => {
    if (!allowed || !autoReveal || !raw || logged.current) return;
    logged.current = true;
    setOpen(true);
    void logIdentityView(kind, purpose);
  }, [allowed, autoReveal, raw, kind, purpose]);

  if (!raw) return <span className={className}>{fallback}</span>;

  const shown = open && allowed ? raw : maskIdentity(raw, kind);

  const reveal = () => {
    if (!allowed) return;
    setOpen((prev) => {
      const next = !prev;
      if (next && !logged.current) {
        logged.current = true;
        void logIdentityView(kind, purpose);
      }
      return next;
    });
  };

  return (
    <span className={`inline-flex items-center gap-1 font-mono ${className}`} dir="ltr">
      <span>{shown}</span>
      {allowed && (
        <button
          type="button"
          onClick={reveal}
          className="no-print text-slate-400 hover:text-slate-700"
          aria-label={open ? 'إخفاء' : 'إظهار'}
        >
          {open ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </span>
  );
};

interface MaskedCivilFieldProps {
  value?: string | number | null;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  readOnly?: boolean;
}

/**
 * The stored civil id is shown with MaskedValue.
 * The text box starts empty, so the stored number is not its value.
 */
export const MaskedCivilField: React.FC<MaskedCivilFieldProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'إدخال أو تصحيح الرقم',
  maxLength,
  readOnly = false,
}) => {
  const [draft, setDraft] = useState('');
  const stored = String(value ?? '').trim();

  const commit = (nextRaw: string) => {
    const next = nextRaw.trim();
    if (!onChange || !next || next === stored) return;
    onChange(next);
    setDraft('');
  };

  return (
    <div className="space-y-1">
      <MaskedValue kind="civil" value={value} />
      {!readOnly && onChange && (
        <input
          value={draft}
          maxLength={maxLength}
          placeholder={stored ? placeholder : 'الرقم المدني'}
          className={className}
          autoComplete="off"
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            if (!stored) onChange(next);
            else if (next.replace(/\D/g, '').length >= 12) commit(next);
          }}
          onBlur={() => {
            if (stored && draft.trim().length >= 6) commit(draft);
            setDraft('');
          }}
        />
      )}
    </div>
  );
};

interface IdentityInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string | number | null;
  kind: IdentityKind;
  onChange?: (value: string) => void;
}

/** Edit control that never writes the mask back over the real number. */
export const IdentityInput: React.FC<IdentityInputProps> = ({
  value,
  kind,
  onChange,
  onFocus,
  ...rest
}) => {
  const { user } = useAuth();
  const allowed = canRevealIdentity(user?.role);
  const raw = String(value ?? '');
  const logged = useRef(false);

  if (!allowed) {
    return (
      <input
        {...rest}
        value={maskIdentity(raw, kind)}
        readOnly
        onChange={() => {}}
      />
    );
  }

  return (
    <input
      {...rest}
      value={raw}
      onChange={(event) => onChange?.(event.target.value)}
      onFocus={(event) => {
        if (!logged.current && raw.trim()) {
          logged.current = true;
          void logIdentityView(kind, 'edit');
        }
        onFocus?.(event);
      }}
    />
  );
};
