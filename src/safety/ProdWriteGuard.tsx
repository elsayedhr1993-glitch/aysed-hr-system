import { useEffect } from 'react';

const WRITE_CONTROL = /(حفظ|حذف|اعتماد|تصدير|\bsave\b|\bdelete\b|\bapprove\b|\bexport\b)/i;

export function isLocalProdLocked(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const local = host === 'localhost' || host === '127.0.0.1';
  if (!local) return false;
  if (import.meta.env.VITE_USE_EMULATOR === 'true') return false;
  if (typeof __AYSED_ALLOW_PROD_WRITES__ !== 'undefined' && __AYSED_ALLOW_PROD_WRITES__) return false;
  return true;
}

function controlText(el: Element): string {
  return [
    el.textContent || '',
    el.getAttribute('aria-label') || '',
    el.getAttribute('title') || '',
  ].join(' ');
}

function isWriteControl(el: Element): boolean {
  return WRITE_CONTROL.test(controlText(el));
}

export function ProdWriteGuard() {
  const locked = isLocalProdLocked();

  useEffect(() => {
    if (!locked) return;

    const previousPadding = document.body.style.paddingTop;
    document.body.style.paddingTop = '40px';

    const mark = () => {
      document.querySelectorAll('button, a, [role="button"], input[type="submit"]').forEach((el) => {
        if (!isWriteControl(el)) return;
        el.setAttribute('data-prod-locked', 'true');
        el.setAttribute('aria-disabled', 'true');
        if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
          el.disabled = true;
        }
      });
    };

    mark();
    const observer = new MutationObserver(mark);
    observer.observe(document.body, { childList: true, subtree: true });

    const block = (event: Event) => {
      const submitter = event instanceof SubmitEvent ? event.submitter : null;
      if (submitter && isWriteControl(submitter)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest('button, a, [role="button"], input[type="submit"]');
      if (!control || !isWriteControl(control)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const originalFetch = window.fetch.bind(window);
    const blockFetch: typeof window.fetch = async (input, init) => {
      const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const sameOrigin = url.startsWith('/') || url.startsWith(window.location.origin);
      if (sameOrigin && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
        return new Response(JSON.stringify({ error: 'read-only' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch(input, init);
    };
    window.fetch = blockFetch;

    document.addEventListener('click', block, true);
    document.addEventListener('submit', block, true);
    return () => {
      document.body.style.paddingTop = previousPadding;
      observer.disconnect();
      document.removeEventListener('click', block, true);
      document.removeEventListener('submit', block, true);
      window.fetch = originalFetch;
      document.querySelectorAll('[data-prod-locked="true"]').forEach((el) => {
        el.removeAttribute('data-prod-locked');
        el.removeAttribute('aria-disabled');
        if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) el.disabled = false;
      });
    };
  }, [locked]);

  if (!locked) return null;

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[100000] bg-red-700 text-white text-center text-sm font-bold py-2 shadow-md"
    >
      متصل ببيانات حقيقية
    </div>
  );
}
