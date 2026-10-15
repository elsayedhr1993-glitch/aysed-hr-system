/**
 * Retired env map. A device company is taken only from its database registration.
 * This function stays so older imports cannot assign a default facility.
 */
export function companyForDevice(_serial: string | undefined): undefined {
  return undefined;
}
