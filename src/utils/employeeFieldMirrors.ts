/** Firestore keys mirrored when persisting a primary employee field inline. */
export const EMPLOYEE_FIELD_MIRRORS: Record<string, string[]> = {
  dept: ['department'],
  manager: ['directSupervisor'],
  civilId: ['civil_id_number'],
  personalPhone: ['mobile'],
  dob: ['birthDate'],
};
