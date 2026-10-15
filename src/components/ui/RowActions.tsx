import type { LucideIcon } from 'lucide-react';
import { tokens } from '../../design/tokens';
import { OverflowMenu, type OverflowItem } from './OverflowMenu';

export type IconAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
};

/**
 * Two icon actions with tooltips, plus the overflow menu.
 * Dangerous removal stays in that menu and a confirm dialog, not as a trash icon here.
 */
export function RowActions({
  actions,
  menu,
}: {
  actions: readonly [IconAction, IconAction];
  menu: readonly OverflowItem[];
}) {
  return (
    <div className="inline-flex items-center" style={{ columnGap: tokens.space[1] }}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <span key={action.id} className="group relative">
            <button
              type="button"
              aria-label={action.label}
              onClick={action.onSelect}
              style={{
                paddingInline: tokens.space[1],
                paddingBlock: tokens.space[1],
                color: tokens.color.gray[700],
                borderRadius: tokens.radius.sm,
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute z-20 hidden whitespace-nowrap text-white group-focus-within:block group-hover:block"
              style={{
                bottom: '100%',
                insetInlineStart: 0,
                marginBlockEnd: tokens.space[1],
                background: tokens.color.gray[900],
                paddingInline: tokens.space[2],
                paddingBlock: '0.125rem',
                borderRadius: tokens.radius.sm,
                fontSize: tokens.text.xs,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {action.label}
            </span>
          </span>
        );
      })}
      <OverflowMenu items={menu} />
    </div>
  );
}
