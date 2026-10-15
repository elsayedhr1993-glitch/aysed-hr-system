/**
 * Local TOTP confirm and password change may skip the read-only guard
 * only outside production and outside Vercel. Request metadata is never consulted.
 */
export function localAuthWriteBypassEnabled(
  env: { NODE_ENV?: string; VERCEL?: string } = process.env
): boolean {
  const vercel = env.VERCEL;
  const vercelSet = typeof vercel === 'string' && vercel.trim() !== '';
  return env.NODE_ENV !== 'production' && !vercelSet;
}
