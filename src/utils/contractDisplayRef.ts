/** Firestore / legacy doc ids — hide in UI, keep for persistence only. */
export function isInternalContractDocId(ref: string): boolean {
  const r = (ref || '').trim();
  if (!r) return true;
  if (r.length > 28 && r.includes('-')) return true;
  return /^contract-comp-/i.test(r) || /^CONTRACT-comp-/i.test(r);
}

export type ContractRefFields = {
  contractRef?: string;
  displayRef?: string;
  startDate?: string;
};

/** Human-readable contract code for lists, exports, and modal titles. */
export function formatContractDisplayRef(
  contract: ContractRefFields,
  sequenceIndex?: number,
): string {
  const stored = (contract.displayRef || '').trim();
  if (stored) return stored;

  const ref = (contract.contractRef || '').trim();
  if (ref && !isInternalContractDocId(ref)) {
    const pamStyle = ref.match(/^CONTRACT\/(\d{4})\/(\d+)$/i);
    if (pamStyle) {
      const [, year, num] = pamStyle;
      return `CNT-${year}-${num}`;
    }
    if (/^CNT-\d{4}-\d+$/i.test(ref)) return ref;
    if (/^عقد\/\d{4}\/\d+$/i.test(ref)) return ref;
    return ref;
  }

  const year = (contract.startDate || '').slice(0, 4) || String(new Date().getFullYear());
  const seq =
    sequenceIndex !== undefined
      ? String(sequenceIndex + 1).padStart(3, '0')
      : '001';
  return `CNT-${year}-${seq}`;
}

export function nextContractDisplaySequence(
  contracts: ContractRefFields[],
  year = new Date().getFullYear(),
): number {
  let max = 0;
  const yearStr = String(year);
  for (const c of contracts) {
    const candidates = [c.displayRef, c.contractRef].filter(Boolean) as string[];
    for (const raw of candidates) {
      const cnt = raw.match(/^CNT-\d{4}-(\d+)$/i);
      const slash = raw.match(/^CONTRACT\/(\d{4})\/(\d+)$/i);
      const arabic = raw.match(/^عقد\/(\d{4})\/(\d+)$/i);
      if (cnt && cnt[0].includes(yearStr)) max = Math.max(max, parseInt(cnt[1], 10));
      if (slash && slash[1] === yearStr) max = Math.max(max, parseInt(slash[2], 10));
      if (arabic && arabic[1] === yearStr) max = Math.max(max, parseInt(arabic[2], 10));
    }
  }
  return max + 1;
}
