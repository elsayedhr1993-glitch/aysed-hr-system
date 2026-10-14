/** Design tokens. Change `color.primary` here to recolor the product. */
export const tokens = {
  color: {
    primary: '#714B67',
    success: '#059669',
    warning: '#D97706',
    danger: '#E11D48',
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      500: '#64748B',
      700: '#334155',
      900: '#0F172A',
    },
  },
  font: {
    sans: '"Cairo", "Inter", "Tajawal", sans-serif',
  },
  space: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
  },
  text: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadow: {
    sm: '0 1px 2px rgb(15 23 42 / 0.06)',
    md: '0 8px 24px rgb(15 23 42 / 0.08)',
  },
} as const;

export function applyDesignTokens(target: HTMLElement = document.documentElement): void {
  const { color, font } = tokens;
  target.style.setProperty('--color-primary', color.primary);
  target.style.setProperty('--color-success', color.success);
  target.style.setProperty('--color-warning', color.warning);
  target.style.setProperty('--color-danger', color.danger);
  target.style.setProperty('--font-sans', font.sans);
}
