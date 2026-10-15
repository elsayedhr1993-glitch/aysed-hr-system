import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { tokens } from '../../design/tokens';
import { canRevealIdentity } from '../../security/accessRoles';
import { shownIdentity, type IdentityKind } from '../../security/identityMask';

export type MaskedValueViewProps = {
  value?: string | number | null;
  kind: IdentityKind;
  role?: string | null;
  fallback?: string;
  autoReveal?: boolean;
  purpose?: string;
  className?: string;
};

function reportView(kind: IdentityKind, purpose: string): void {
  void import('../../security/logIdentityView').then((mod) => mod.logIdentityView(kind, purpose));
}

export function MaskedValueView({
  value,
  kind,
  role,
  fallback = '—',
  autoReveal = false,
  purpose = 'view',
  className = '',
}: MaskedValueViewProps) {
  const allowed = canRevealIdentity(role);
  const raw = String(value ?? '').trim();
  const [open, setOpen] = useState(false);
  const logged = useRef(false);

  useEffect(() => {
    if (!allowed || !autoReveal || !raw || logged.current) return;
    logged.current = true;
    setOpen(true);
    reportView(kind, purpose);
  }, [allowed, autoReveal, raw, kind, purpose]);

  if (!raw) {
    return (
      <span className={className} style={{ paddingInline: tokens.space[1] }}>
        {fallback}
      </span>
    );
  }

  const shown = shownIdentity(value, kind, role, open);

  const reveal = () => {
    if (!allowed) return;
    setOpen((prev) => {
      const next = !prev;
      if (next && !logged.current) {
        logged.current = true;
        reportView(kind, purpose);
      }
      return next;
    });
  };

  return (
    <span
      className={`inline-flex items-center font-mono ${className}`}
      dir="ltr"
      style={{ columnGap: tokens.space[1], marginInline: tokens.space[1] }}
    >
      <span>{shown}</span>
      {allowed && (
        <button
          type="button"
          onClick={reveal}
          className="no-print"
          aria-label={open ? 'إخفاء' : 'إظهار'}
          style={{ color: tokens.color.gray[500], paddingInline: tokens.space[1] }}
        >
          {open ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      )}
    </span>
  );
}
