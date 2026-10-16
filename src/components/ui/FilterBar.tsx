import { Search } from 'lucide-react';
import { tokens } from '../../design/tokens';
import { useLang } from '../../lib/i18n';

export type FilterSegment = {
  id: string;
  label: string;
  count: number;
};

export type FilterDropdown = {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function FilterBar({
  search,
  onSearch,
  searchPlaceholder,
  segments,
  activeSegment,
  onSegment,
  dropdowns,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  segments: readonly FilterSegment[];
  activeSegment: string;
  onSegment: (id: string) => void;
  dropdowns: readonly FilterDropdown[];
}) {
  const { t } = useLang();
  const placeholder = searchPlaceholder ?? t('search');
  return (
    <div
      className="flex flex-nowrap items-center overflow-x-auto border-b bg-white"
      style={{
        paddingInline: tokens.space[3],
        paddingBlock: tokens.space[2],
        columnGap: tokens.space[2],
        borderColor: tokens.color.gray[200],
        fontFamily: 'var(--font-sans)',
      }}
    >
      <label className="flex min-w-40 flex-1 items-center" style={{ columnGap: tokens.space[1] }}>
        <Search className="h-3.5 w-3.5 shrink-0" style={{ color: tokens.color.gray[500] }} />
        <input
          type="search"
          value={search}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => onSearch(event.target.value)}
          className="w-full bg-transparent outline-none"
          style={{
            paddingInline: tokens.space[2],
            paddingBlock: tokens.space[1],
            fontSize: tokens.text.xs,
            color: tokens.color.gray[900],
          }}
        />
      </label>
      <div
        role="radiogroup"
        aria-label={t('status')}
        className="inline-flex shrink-0"
        style={{
          padding: 2,
          background: tokens.color.gray[100],
          borderRadius: tokens.radius.md,
          columnGap: tokens.space[1],
        }}
      >
        {segments.map((segment) => {
          const active = segment.id === activeSegment;
          return (
            <button
              key={segment.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSegment(segment.id)}
              style={{
                paddingInline: tokens.space[2],
                paddingBlock: tokens.space[1],
                borderRadius: tokens.radius.sm,
                background: active ? tokens.color.primary : 'transparent',
                color: active ? '#ffffff' : tokens.color.gray[700],
                fontSize: tokens.text.xs,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {segment.label} {segment.count}
            </button>
          );
        })}
      </div>
      {dropdowns.map((dropdown) => (
        <select
          key={dropdown.id}
          aria-label={dropdown.label}
          value={dropdown.value}
          onChange={(event) => dropdown.onChange(event.target.value)}
          className="shrink-0 bg-white"
          style={{
            paddingInline: tokens.space[2],
            paddingBlock: tokens.space[1],
            marginInline: 0,
            border: `1px solid ${tokens.color.gray[200]}`,
            borderRadius: tokens.radius.md,
            color: tokens.color.gray[700],
            fontSize: tokens.text.xs,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {dropdown.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
