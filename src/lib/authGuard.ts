export function getAuthBearerToken(req: any): string | null {
  const header = req?.headers?.authorization || req?.headers?.Authorization;
  if (typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function sanitizeForLogs(value: string | undefined, maxLen = 20): string {
  if (!value) return 'N/A';
  const clean = String(value).replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}...` : clean;
}
