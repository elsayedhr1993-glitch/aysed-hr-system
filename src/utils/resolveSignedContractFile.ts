export type SignedContractFileKind = 'pdf' | 'image';

export interface SignedContractFileView {
  url: string;
  name: string;
  kind: SignedContractFileKind;
}

function inferKind(url: string, mimeOrType?: string, fileName?: string): SignedContractFileKind {
  const hay = `${mimeOrType || ''} ${fileName || ''} ${url}`.toLowerCase();
  if (hay.includes('pdf') || hay.includes('application/pdf')) return 'pdf';
  return 'image';
}

function fromLooseFile(file: Record<string, unknown> | undefined | null): SignedContractFileView | null {
  if (!file) return null;
  const url = String(file.url || file.fileUrl || '').trim();
  if (!url) return null;
  const name = String(file.name || file.fileName || 'عقد العمل الموقع').trim();
  const kind = inferKind(url, String(file.type || file.fileType || ''), name);
  return { url, name, kind };
}

/** Resolve uploaded signed employment contract (PDF / scan) — never a generated text template. */
export function resolveSignedContractFile(
  employeeOrRecord?: Record<string, unknown> | null
): SignedContractFileView | null {
  if (!employeeOrRecord) return null;

  const files = employeeOrRecord.documentFiles as Record<string, Record<string, unknown>> | undefined;
  const fromSigned = fromLooseFile(files?.signedContract);
  if (fromSigned) return fromSigned;

  for (const key of ['employmentContract', 'contractScan', 'signed_contract', 'contractFile']) {
    const alt = fromLooseFile(files?.[key]);
    if (alt) return alt;
  }

  const directUrl = String(
    employeeOrRecord.signedContractUrl ||
      employeeOrRecord.contractFileUrl ||
      employeeOrRecord.contractScanUrl ||
      ''
  ).trim();
  if (directUrl) {
    return {
      url: directUrl,
      name: String(employeeOrRecord.contractFileName || 'عقد العمل الموقع'),
      kind: inferKind(directUrl),
    };
  }

  return null;
}
