import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { tokens } from '../../design/tokens';
import { useLang } from '../../lib/i18n';

export type OverflowItem = {
  id: string;
  label: string;
  onSelect: () => void;
};

export function OverflowMenu({ items }: { items: readonly OverflowItem[] }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; inlineEnd: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  if (items.length === 0) return null;

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
    setCoords({
      top: rect.bottom + 4,
      inlineEnd: rtl ? rect.left : window.innerWidth - rect.right,
    });
    setOpen(true);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t('more')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        style={{
          paddingInline: tokens.space[2],
          paddingBlock: tokens.space[1],
          color: tokens.color.gray[700],
          borderRadius: tokens.radius.md,
        }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open &&
        coords &&
        createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="min-w-40 border bg-white shadow-sm"
          style={{
            position: 'fixed',
            top: coords.top,
            insetInlineEnd: coords.inlineEnd,
            zIndex: 40,
            paddingInline: tokens.space[1],
            paddingBlock: tokens.space[1],
            borderColor: tokens.color.gray[200],
            borderRadius: tokens.radius.md,
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="block w-full text-start"
              style={{
                paddingInline: tokens.space[2],
                paddingBlock: tokens.space[2],
                fontSize: tokens.text.xs,
                color: tokens.color.gray[900],
                fontFamily: 'var(--font-sans)',
              }}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>,
          document.body,
        )}
    </div>
  );
}
