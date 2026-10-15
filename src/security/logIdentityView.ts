import { buildAuthedJsonHeaders } from '../lib/clientAuth';
import type { IdentityKind } from './identityMask';

/** Same identity-view audit call the existing mask control already uses. */
export async function logIdentityView(kind: IdentityKind, purpose: string): Promise<void> {
  try {
    const headers = await buildAuthedJsonHeaders();
    await fetch('/api/audit/identity-view', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ kind, purpose }),
    });
  } catch {
    /* the view log must not block the screen */
  }
}
