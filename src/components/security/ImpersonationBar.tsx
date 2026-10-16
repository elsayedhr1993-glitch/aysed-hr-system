import { useEffect, useState } from 'react';
import { buildAuthedJsonHeaders } from '../../lib/clientAuth';
import { setImpersonationGate } from '../../security/impersonationGate';
import { Modal } from '../ui';

type SessionView = {
  active: boolean;
  hideSensitive: boolean;
  expiresAt: number;
  breakGlass: boolean;
};

export function ImpersonationBar({
  companyName,
  onExit,
}: {
  companyName: string;
  onExit: () => void;
}) {
  const [session, setSession] = useState<SessionView | null>(null);
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    const pull = async () => {
      try {
        const headers = await buildAuthedJsonHeaders();
        const response = await fetch('/api/admin/impersonate', { headers });
        const body = await response.json().catch(() => ({}));
        if (!live) return;
        const active = response.ok && body.active === true;
        setSession(
          active
            ? {
                active: true,
                hideSensitive: body.hideSensitive !== false && body.breakGlass !== true,
                expiresAt: Number(body.expiresAt || 0),
                breakGlass: body.breakGlass === true,
              }
            : null
        );
        setImpersonationGate({
          readOnly: active,
          hideSensitive: active && body.breakGlass !== true,
        });
      } catch {
        if (!live) return;
        setSession(null);
        setImpersonationGate({ readOnly: false, hideSensitive: false });
      }
    };
    void pull();
    const timer = window.setInterval(() => void pull(), 15000);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!session?.active) return null;
  const until = session.expiresAt ? new Date(session.expiresAt).toLocaleTimeString('ar') : '';

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between gap-3 bg-red-700 px-4 py-2 text-xs font-bold text-white">
        <span>
          دخول كمسؤول — قراءة فقط — {companyName}
          {until ? ` — حتى ${until}` : ''}
          {session.hideSensitive ? ' — الرواتب والهويات مخفية' : ' — break-glass مفعّل'}
        </span>
        <span className="flex items-center gap-2">
          {!session.breakGlass && (
            <button type="button" className="rounded bg-white px-2 py-1 text-red-800" onClick={() => setOpen(true)}>
              إظهار الرواتب والهويات
            </button>
          )}
          <button
            type="button"
            className="rounded bg-red-950 px-2 py-1"
            onClick={() => {
              void (async () => {
                const headers = await buildAuthedJsonHeaders();
                await fetch('/api/admin/impersonate/end', { method: 'POST', headers }).catch(() => undefined);
                setImpersonationGate({ readOnly: false, hideSensitive: false });
                onExit();
              })();
            }}
          >
            إنهاء الجلسة
          </button>
        </span>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="break-glass"
        subtitle="سبب مكتوب إلزامي. القراءة فقط تبقى."
        footer={
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => {
              void (async () => {
                const headers = await buildAuthedJsonHeaders();
                const response = await fetch('/api/admin/impersonate/break-glass', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ reason: reason.trim() }),
                });
                if (response.ok) {
                  setImpersonationGate({ readOnly: true, hideSensitive: false });
                  setSession((current) => (current ? { ...current, breakGlass: true, hideSensitive: false } : current));
                  setOpen(false);
                  setReason('');
                }
              })();
            }}
          >
            تفعيل
          </button>
        }
      >
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="w-full border rounded p-2 text-xs" rows={3} />
      </Modal>
    </>
  );
}
