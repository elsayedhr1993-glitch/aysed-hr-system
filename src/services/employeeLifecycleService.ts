import { collection, doc, runTransaction } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../lib/firebase';
import { EmployeeLifecycleStatus, normalizeEmployeeStatus } from '../utils/employeeLifecycle';

export async function changeEmployeeStatus(
  employeeId: string,
  companyId: string,
  nextStatus: EmployeeLifecycleStatus | string,
  reason = '',
  changedBy = 'HR System'
): Promise<void> {
  if (!employeeId || !companyId) throw new Error('بيانات الموظف والشركة غير مكتملة');

  const normalizedStatus = normalizeEmployeeStatus(nextStatus);
  const employeeRef = doc(db, 'employees', employeeId);
  const eventRef = doc(collection(db, 'employee_lifecycle_events'));

  await runTransaction(db, async transaction => {
    const employeeSnapshot = await transaction.get(employeeRef);
    if (!employeeSnapshot.exists()) throw new Error('ملف الموظف غير موجود');

    const current = employeeSnapshot.data();
    const previousStatus = normalizeEmployeeStatus(current.status);
    const changedAt = new Date().toISOString();

    transaction.set(employeeRef, cleanFirestoreData({
      status: normalizedStatus,
      companyId,
      updatedAt: changedAt
    }), { merge: true });

    transaction.set(eventRef, cleanFirestoreData({
      id: eventRef.id,
      employeeId,
      companyId,
      previousStatus,
      nextStatus: normalizedStatus,
      reason,
      changedBy,
      changedAt
    }));
  });
}