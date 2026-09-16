type AuditUserProfile = {
  id?: string;
  name?: string;
};

export async function logAction(
  profile: AuditUserProfile | null,
  action: 'create' | 'update' | 'delete' | string,
  resource: string,
  targetId: string | null,
  details: string
) {
  console.log(`[AUDIT LOG] [${new Date().toISOString()}] User: ${profile?.name || profile?.id || 'System'} | Action: ${action} | Resource: ${resource} | ID: ${targetId || 'N/A'} | Details: ${details}`);
  return true;
}
