import { tokens } from '../../design/tokens';
import { OverflowMenu, type OverflowItem } from './OverflowMenu';

export function PageHeader({
  title,
  subtitle,
  primaryAction,
  menu,
}: {
  title: string;
  subtitle?: string;
  primaryAction: { label: string; onClick: () => void };
  menu: readonly OverflowItem[];
}) {
  return (
    <header
      className="flex items-center justify-between border-b bg-white"
      style={{
        paddingInline: tokens.space[4],
        paddingBlock: tokens.space[3],
        columnGap: tokens.space[3],
        borderColor: tokens.color.gray[200],
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 className="font-bold" style={{ color: tokens.color.gray[900], fontSize: tokens.text.lg }}>
          {title}
        </h1>
        {subtitle ? (
          <p style={{ color: tokens.color.gray[500], fontSize: tokens.text.xs, marginBlockStart: tokens.space[1] }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center" style={{ columnGap: tokens.space[2] }}>
        <button
          type="button"
          onClick={primaryAction.onClick}
          style={{
            background: tokens.color.primary,
            color: '#ffffff',
            paddingInline: tokens.space[3],
            paddingBlock: tokens.space[2],
            borderRadius: tokens.radius.md,
            fontSize: tokens.text.xs,
            fontWeight: 700,
          }}
        >
          {primaryAction.label}
        </button>
        <OverflowMenu items={menu} />
      </div>
    </header>
  );
}
