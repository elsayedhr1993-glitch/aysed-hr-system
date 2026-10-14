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
} as const;

export function hasBrandSupport(): boolean {
  return brand.supportEmail.length > 0 || brand.supportUrl.length > 0;
}
