import type { AuditEvent } from './auditLog';

function plainEvent(event: AuditEvent): Record<string, unknown> {
  return {
    id: event.id,
    at: event.at,
    userId: event.userId,
    userName: event.userName,
    role: event.role,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    before: event.before,
    after: event.after,
    ip: event.ip,
    companyId: event.companyId,
    details: event.details,
  };
}

/** Admin SDK create only. Clients cannot write this collection. */
export async function appendAuditToFirestore(event: AuditEvent): Promise<void> {
  const { getAdminFirestore } = await import('./firebaseAdmin');
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore admin is not available');
  await db.collection('audit_logs').doc(event.id).create(plainEvent(event));
}

export async function listAuditFromFirestore(): Promise<AuditEvent[]> {
  const { getAdminFirestore } = await import('./firebaseAdmin');
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore admin is not available');
  const snap = await db.collection('audit_logs').get();
  return snap.docs.map((item) => item.data() as AuditEvent);
}
