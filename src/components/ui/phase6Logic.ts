import type { IdentityKind } from '../../security/identityMask';
import { shownIdentity } from '../../security/identityMask';

export { shownIdentity };
export type { IdentityKind };

export const STATUS_TONES = ['success', 'warning', 'danger'] as const;
export type StatusTone = (typeof STATUS_TONES)[number];

const STATUS_COLOR_VAR: Record<StatusTone, string> = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

export function statusToneColor(tone: StatusTone): string {
  return STATUS_COLOR_VAR[tone];
}

export type HideableColumn = {
  id: string;
  hideable?: boolean;
};

/** Hideable columns drop out. A column that is not hideable stays visible. */
export function selectColumns<Column extends HideableColumn>(
  columns: readonly Column[],
  hiddenIds: ReadonlySet<string>,
): Column[] {
  return columns.filter((column) => !column.hideable || !hiddenIds.has(column.id));
}

/** Zero is a dash. Any other finite number is shown as-is. */
export function formatTableNumber(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  return String(value);
}

/** Dinar amounts use three decimal places. Zero is a dash. */
export function formatMoneyOrDash(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  return `${value.toFixed(3)} د.ك`;
}

export function formatStatValue(value: number, kind: 'count' | 'money' = 'count'): string {
  return kind === 'money' ? formatMoneyOrDash(value) : formatTableNumber(value);
}
