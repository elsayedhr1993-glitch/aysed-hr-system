import { useEffect, useState } from 'react';
import { tokens } from '../../design/tokens';
import { useLang } from '../../lib/i18n';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmWord,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmWord: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  const confirmText = confirmLabel ?? t('confirm');
  const cancelText = cancelLabel ?? t('cancel');
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  const ready = typed.trim() === confirmWord;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgb(15 23 42 / 0.45)', paddingInline: tokens.space[4] }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md bg-white shadow-md"
        style={{
          borderRadius: tokens.radius.lg,
          paddingInline: tokens.space[4],
          paddingBlock: tokens.space[4],
          fontFamily: 'var(--font-sans)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="font-bold" style={{ color: tokens.color.gray[900], fontSize: tokens.text.base }}>
          {title}
        </h2>
        <p style={{ color: tokens.color.gray[500], fontSize: tokens.text.xs, marginBlockStart: tokens.space[2] }}>
          {message}
        </p>
        <label className="block" style={{ marginBlockStart: tokens.space[4], color: tokens.color.gray[700], fontSize: tokens.text.xs }}>
          اكتب «{confirmWord}» للتأكيد
          <input
            value={typed}
            autoFocus
            autoComplete="off"
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && ready) onConfirm();
            }}
            className="block w-full border bg-white"
            style={{
              marginBlockStart: tokens.space[1],
              paddingInline: tokens.space[2],
              paddingBlock: tokens.space[2],
              borderColor: tokens.color.gray[200],
              borderRadius: tokens.radius.md,
              color: tokens.color.gray[900],
            }}
          />
        </label>
        <div className="flex" style={{ marginBlockStart: tokens.space[4], columnGap: tokens.space[2] }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              marginInlineStart: 'auto',
              paddingInline: tokens.space[3],
              paddingBlock: tokens.space[2],
              color: tokens.color.gray[700],
              fontSize: tokens.text.xs,
              fontWeight: 700,
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={onConfirm}
            style={{
              background: tokens.color.danger,
              color: '#ffffff',
              paddingInline: tokens.space[3],
              paddingBlock: tokens.space[2],
              borderRadius: tokens.radius.md,
              fontSize: tokens.text.xs,
              fontWeight: 700,
              opacity: ready ? 1 : 0.45,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
