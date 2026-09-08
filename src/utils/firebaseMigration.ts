import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MANARA_STORAGE_KEYS, getPersistentData } from './persistentStorage';

export async function migrateLocalStorageToFirestore(activeCompanyId: string) {
  if (!activeCompanyId) return;
  console.log('Starting migration to Firestore for company:', activeCompanyId);
  try {
    const batch = writeBatch(db);
    let migratedCount = 0;

    // Migrate Employees
    const employees = getPersistentData<any[]>(MANARA_STORAGE_KEYS.EMPLOYEES, []);
    for (const emp of employees) {
      const ref = doc(db, 'employees', emp.id || `emp_${Date.now()}_${Math.random()}`);
      batch.set(ref, { ...emp, companyId: activeCompanyId }, { merge: true });
      migratedCount++;
    }

    // Migrate Contracts
    const contracts = getPersistentData<any[]>(MANARA_STORAGE_KEYS.CONTRACTS, []);
    for (const contract of contracts) {
      const ref = doc(db, 'contracts', contract.id || `contract_${Date.now()}_${Math.random()}`);
      batch.set(ref, { ...contract, companyId: activeCompanyId }, { merge: true });
      migratedCount++;
    }

    // Migrate Leaves
    const leaves = getPersistentData<any[]>(MANARA_STORAGE_KEYS.LEAVES, []);
    for (const leave of leaves) {
      const ref = doc(db, 'leaves', leave.id || `leave_${Date.now()}_${Math.random()}`);
      batch.set(ref, { ...leave, companyId: activeCompanyId }, { merge: true });
      migratedCount++;
    }

    // Migrate Attendance
    const attendanceData = getPersistentData<any>(MANARA_STORAGE_KEYS.ATTENDANCE, {});
    // Attendance is a dictionary mapping employeeId to record
    for (const [empId, record] of Object.entries(attendanceData)) {
      const ref = doc(db, 'attendance', `${activeCompanyId}_${empId}`);
      batch.set(ref, { ...(record as any), employeeId: empId, companyId: activeCompanyId }, { merge: true });
      migratedCount++;
    }

    // Migrate Payslips
    const payslips = getPersistentData<any[]>(MANARA_STORAGE_KEYS.PAYSLIPS, []);
    for (const ps of payslips) {
      const ref = doc(db, 'payslips', ps.id || `ps_${Date.now()}_${Math.random()}`);
      batch.set(ref, { ...ps, companyId: activeCompanyId }, { merge: true });
      migratedCount++;
    }

    if (migratedCount > 0) {
      await batch.commit();
      console.log(`Successfully migrated ${migratedCount} records to Firestore.`);
      
      // Optionally clear local storage to force reliance on Firestore
      // localStorage.removeItem(MANARA_STORAGE_KEYS.EMPLOYEES);
      // localStorage.removeItem(MANARA_STORAGE_KEYS.CONTRACTS);
      // localStorage.removeItem(MANARA_STORAGE_KEYS.LEAVES);
      // localStorage.removeItem(MANARA_STORAGE_KEYS.ATTENDANCE);
      // localStorage.removeItem(MANARA_STORAGE_KEYS.PAYSLIPS);
    } else {
      console.log('No local records to migrate.');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  }
}
