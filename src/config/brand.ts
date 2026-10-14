import { tokens } from '../design/tokens';

function readPublicEnv(name: 'VITE_SUPPORT_EMAIL' | 'VITE_SUPPORT_URL'): string {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

export const brand = {
  name: 'Aysed HR',
  logoSrc: '',
  logoAlt: 'Aysed HR',
  supportEmail: readPublicEnv('VITE_SUPPORT_EMAIL'),
  supportUrl: readPublicEnv('VITE_SUPPORT_URL'),
  colors: {
    primary: tokens.color.primary,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
} as const;

export function hasBrandSupport(): boolean {
  return brand.supportEmail.length > 0 || brand.supportUrl.length > 0;
}
