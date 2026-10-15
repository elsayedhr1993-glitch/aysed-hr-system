import { tokens } from '../../design/tokens';
import { formatStatValue } from './phase6Logic';

export type StatItem = {
  id: string;
  label: string;
  value: number;
  kind?: 'count' | 'money';
};

export function StatStrip({
  items,
  activeId,
  onSelect,
}: {
  items: readonly StatItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="ملخص الأرقام"
      className="flex flex-nowrap overflow-x-auto border-b bg-white"
      style={{
        paddingInline: tokens.space[3],
        columnGap: tokens.space[4],
        borderColor: tokens.color.gray[200],
        fontFamily: 'var(--font-sans)',
      }}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(item.id)}
            style={{
              paddingInline: tokens.space[2],
              paddingBlock: tokens.space[2],
              marginInline: 0,
              background: 'transparent',
              borderBottom: active ? `2px solid ${tokens.color.primary}` : '2px solid transparent',
              color: tokens.color.gray[700],
              textAlign: 'start',
            }}
          >
            <span className="block" style={{ fontSize: tokens.text.xs }}>
              {item.label}
            </span>
            <span
              className="block font-bold tabular-nums"
              style={{ color: tokens.color.gray[900], fontSize: tokens.text.sm }}
            >
              {formatStatValue(item.value, item.kind)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
