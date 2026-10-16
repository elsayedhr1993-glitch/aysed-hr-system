import { useState } from 'react';
import type { ReactNode } from 'react';
import { tokens } from '../../design/tokens';
import { useLang } from '../../lib/i18n';
import { formatKwdUiOrDash } from '../../lib/localeFormat';
import { formatTableNumber, selectColumns } from './phase6Logic';

export type DataTableColumn<Row> = {
  id: string;
  header: string;
  hideable?: boolean;
  money?: boolean;
  cell: (row: Row) => ReactNode | number | null | undefined;
  total?: (rows: readonly Row[]) => number | null;
};

export type DataTableEmpty = {
  message: string;
  actionLabel: string;
  onAction: () => void;
};

function displayValue<Row>(column: DataTableColumn<Row>, raw: ReactNode | number | null | undefined): ReactNode {
  if (typeof raw !== 'number') return raw ?? '';
  return column.money ? formatKwdUiOrDash(raw) : formatTableNumber(raw);
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  pageSize = 25,
  empty,
}: {
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  pageSize?: number;
  empty: DataTableEmpty;
}) {
  const { t } = useLang();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(0);
  const signature = rows.map((row) => rowKey(row)).join('\0');
  const [tracked, setTracked] = useState(signature);
  if (tracked !== signature) {
    setTracked(signature);
    setPage(0);
  }
  const shown = selectColumns(columns, hiddenIds);
  const hideable = columns.filter((column) => column.hideable);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(tracked === signature ? page : 0, pageCount - 1);
  const start = current * pageSize;
  const visible = rows.slice(start, start + pageSize);

  const toggleColumn = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (rows.length === 0) {
    return (
      <div
        className="flex items-center bg-white"
        style={{
          paddingInline: tokens.space[4],
          paddingBlock: tokens.space[3],
          columnGap: tokens.space[3],
          fontFamily: 'var(--font-sans)',
        }}
      >
        <p style={{ color: tokens.color.gray[500], fontSize: tokens.text.sm }}>{empty.message}</p>
        <button
          type="button"
          onClick={empty.onAction}
          style={{
            marginInlineStart: 'auto',
            background: tokens.color.primary,
            color: '#ffffff',
            paddingInline: tokens.space[3],
            paddingBlock: tokens.space[2],
            borderRadius: tokens.radius.md,
            fontSize: tokens.text.xs,
            fontWeight: 700,
          }}
        >
          {empty.actionLabel}
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {hideable.length > 0 && (
        <div className="flex bg-white" style={{ paddingInline: tokens.space[3], paddingBlock: tokens.space[1] }}>
          <details style={{ marginInlineStart: 'auto' }}>
            <summary
              className="cursor-pointer"
              style={{ fontSize: tokens.text.xs, color: tokens.color.gray[700], paddingInline: tokens.space[2] }}
            >
              الأعمدة
            </summary>
            <div
              className="border bg-white"
              style={{
                paddingInline: tokens.space[2],
                paddingBlock: tokens.space[1],
                borderColor: tokens.color.gray[200],
                borderRadius: tokens.radius.md,
              }}
            >
              {hideable.map((column) => (
                <label
                  key={column.id}
                  className="flex items-center"
                  style={{ columnGap: tokens.space[1], fontSize: tokens.text.xs, paddingBlock: '0.125rem' }}
                >
                  <input
                    type="checkbox"
                    checked={!hiddenIds.has(column.id)}
                    onChange={() => toggleColumn(column.id)}
                  />
                  {column.header}
                </label>
              ))}
            </div>
          </details>
        </div>
      )}
      <div className="overflow-auto bg-white" style={{ maxHeight: '22rem' }}>
        <table className="w-full border-collapse tabular-nums" style={{ fontSize: tokens.text.xs }}>
          <thead className="sticky top-0 z-10 bg-white">
            <tr style={{ borderBottom: `1px solid ${tokens.color.gray[200]}` }}>
              {shown.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="text-start font-bold"
                  style={{
                    paddingInline: tokens.space[3],
                    paddingBlock: tokens.space[2],
                    color: tokens.color.gray[500],
                    background: '#ffffff',
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={rowKey(row)} style={{ borderBottom: `1px solid ${tokens.color.gray[100]}` }}>
                {shown.map((column) => (
                  <td
                    key={column.id}
                    className="text-start"
                    style={{
                      paddingInline: tokens.space[3],
                      paddingBlock: tokens.space[2],
                      color: tokens.color.gray[900],
                    }}
                  >
                    {displayValue(column, column.cell(row))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr>
              {shown.map((column, index) => {
                const total = column.total?.(rows);
                const text =
                  typeof total === 'number'
                    ? column.money
                      ? formatKwdUiOrDash(total)
                      : formatTableNumber(total)
                    : index === 0
                      ? t('total')
                      : '';
                return (
                  <td
                    key={column.id}
                    className="text-start font-bold tabular-nums"
                    style={{
                      paddingInline: tokens.space[3],
                      paddingBlock: tokens.space[2],
                      background: tokens.color.gray[50],
                      color: tokens.color.gray[900],
                      borderTop: `1px solid ${tokens.color.gray[200]}`,
                    }}
                  >
                    {text}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
      <div
        className="flex items-center bg-white"
        style={{
          paddingInline: tokens.space[3],
          paddingBlock: tokens.space[2],
          columnGap: tokens.space[2],
          borderTop: `1px solid ${tokens.color.gray[200]}`,
        }}
      >
        <button
          type="button"
          disabled={current === 0}
          onClick={() => setPage(current - 1)}
          style={{ paddingInline: tokens.space[2], fontSize: tokens.text.xs, color: tokens.color.gray[700] }}
        >
          السابق
        </button>
        <span className="tabular-nums" style={{ fontSize: tokens.text.xs, color: tokens.color.gray[500] }}>
          {start + 1}–{start + visible.length} من {rows.length}
        </span>
        <button
          type="button"
          disabled={current >= pageCount - 1}
          onClick={() => setPage(current + 1)}
          style={{
            marginInlineStart: 'auto',
            paddingInline: tokens.space[2],
            fontSize: tokens.text.xs,
            color: tokens.color.gray[700],
          }}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
