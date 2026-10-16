export type ScanWizardStep = 'type' | 'upload' | 'review' | 'save';

/** Save stays closed until the reviewer explicitly approves the extracted fields. */
export function canSaveScan(step: ScanWizardStep, approved: boolean): boolean {
  return step === 'save' && approved;
}
