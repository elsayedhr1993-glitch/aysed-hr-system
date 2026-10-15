import { tokens } from '../../design/tokens';
import { statusToneColor, STATUS_TONES, type StatusTone } from './phase6Logic';

export { STATUS_TONES, statusToneColor };
export type { StatusTone };

/** Exception marker. Only the three status colors from the design tokens. */
export function StatusBadge({ tone, children }: { tone: StatusTone; children: string }) {
  return (
    <span
      style={{
        background: statusToneColor(tone),
        color: '#ffffff',
        paddingInline: tokens.space[2],
        paddingBlock: '0.125rem',
        borderRadius: tokens.radius.sm,
        fontSize: tokens.text.xs,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </span>
  );
}
