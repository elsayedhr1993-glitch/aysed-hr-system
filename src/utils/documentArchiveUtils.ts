/** Map employee profile document slot keys to central archive categories. */
export function mapEmployeeDocKeyToCategory(docKey: string): string {
  switch (docKey) {
    case 'civilIdScan':
      return 'CIVIL_ID';
    case 'passportScan':
      return 'PASSPORT';
    case 'pamWorkPermit':
      return 'RESIDENCY';
    case 'mohLicense':
      return 'MOH_LICENSE';
    case 'medicalFitness':
      return 'OTHER';
    case 'signedContract':
      return 'WORK_CONTRACT';
    default:
      return 'OTHER';
  }
}
