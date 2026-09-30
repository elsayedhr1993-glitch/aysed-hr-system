import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import type { CompanyComplianceDoc, CompanyComplianceTrack } from '../types';
import type { CompanyDocument } from '../types/companyDocuments';
import { getDocumentStatus } from '../types/companyDocuments';

export const COMPANY_COMPLIANCE_DOC_ID = 'licences';

const TRACK_DEFS: { key: CompanyComplianceTrack['key']; label: string; matchers: RegExp[] }[] = [
  {
    key: 'health',
    label: 'ترخيص الصحة (MOH)',
    matchers: [/صح/i, /health/i, /moh/i, /medical_license/i, /طبي/i],
  },
  {
    key: 'municipality',
    label: 'رخصة البلدية',
    matchers: [/بلد/i, /municipal/i, /municipality/i, /baladiya/i],
  },
  {
    key: 'fire',
    label: 'المطافئ / الدفاع المدني',
    matchers: [/مطاف/i, /fire/i, /دفاع/i, /civil_defense/i, /kff/i],
  },
];

function matchTrack(doc: CompanyDocument): CompanyComplianceTrack['key'] | null {
  const hay = `${doc.documentType || ''} ${doc.name || ''} ${doc.issuingAuthority || ''}`.toLowerCase();
  for (const def of TRACK_DEFS) {
    if (def.matchers.some((re) => re.test(hay))) return def.key;
  }
  return null;
}

function pickBestDoc(docs: CompanyDocument[], key: CompanyComplianceTrack['key']): CompanyDocument | null {
  const def = TRACK_DEFS.find((d) => d.key === key);
  if (!def) return null;
  const matched = docs.filter((d) => matchTrack(d) === key);
  if (!matched.length) return null;
  return matched.sort((a, b) => String(b.expiryDate || '').localeCompare(String(a.expiryDate || '')))[0];
}

export function buildComplianceFromCompanyDocuments(
  companyId: string,
  docs: CompanyDocument[]
): CompanyComplianceDoc {
  const companyDocs = docs.filter((d) => !d.companyId || d.companyId === companyId);
  const tracks: CompanyComplianceTrack[] = TRACK_DEFS.map((def) => {
    const source = pickBestDoc(companyDocs, def.key);
    if (!source?.expiryDate) {
      return {
        key: def.key,
        label: def.label,
        expiryDate: null,
        status: 'missing',
        daysRemaining: null,
        documentId: source?.id,
        documentNumber: source?.documentNumber,
      };
    }
    const validity = getDocumentStatus(source.expiryDate);
    return {
      key: def.key,
      label: def.label,
      expiryDate: source.expiryDate,
      status: validity.status === 'expired' ? 'expired' : validity.status === 'expiring_soon' ? 'expiring_soon' : 'valid',
      daysRemaining: validity.daysRemaining,
      documentId: source.id,
      documentNumber: source.documentNumber,
    };
  });

  const scored = tracks.filter((t) => t.status === 'valid' || t.status === 'expiring_soon').length;
  const overallPercent = Math.round((scored / tracks.length) * 100);

  return {
    id: COMPANY_COMPLIANCE_DOC_ID,
    companyId,
    tracks,
    overallPercent,
    alertCount: tracks.filter((t) => t.status === 'expired' || t.status === 'expiring_soon' || t.status === 'missing').length,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

export async function syncCompanyComplianceFromDocuments(
  companyId: string,
  docs: CompanyDocument[]
): Promise<CompanyComplianceDoc> {
  const payload = buildComplianceFromCompanyDocuments(companyId, docs);
  await setDoc(
    doc(db, 'companies', companyId, 'compliance', COMPANY_COMPLIANCE_DOC_ID),
    cleanFirestoreData(payload),
    { merge: true }
  );
  return payload;
}

export function subscribeCompanyCompliance(
  companyId: string,
  onData: (doc: CompanyComplianceDoc | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const ref = doc(db, 'companies', companyId, 'compliance', COMPANY_COMPLIANCE_DOC_ID);
  const unsubDoc = onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CompanyComplianceDoc);
        return;
      }
      onData(null);
    },
    (error) => {
      console.error('company compliance subscribe failed:', error);
      onError?.(error);
      onData(null);
    }
  );

  const docsQuery = query(collection(db, 'company_documents'), where('companyId', '==', companyId));
  const unsubDocs = onSnapshot(
    docsQuery,
    async (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as CompanyDocument));
      try {
        const synced = await syncCompanyComplianceFromDocuments(companyId, docs);
        onData(synced);
      } catch (e) {
        console.error('syncCompanyComplianceFromDocuments failed:', e);
      }
    },
    (error) => console.error('company_documents for compliance failed:', error)
  );

  return () => {
    unsubDoc();
    unsubDocs();
  };
}
