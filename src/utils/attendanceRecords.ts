import { doc, setDoc } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import type { AttendanceLog } from '../context/OdooHierarchyContext';

export function getAttendanceRecordDocId(companyId: string, employeeId: string, date: string): string {
  const day = String(date || '').slice(0, 10);
  return `ATT-${companyId}-${employeeId}-${day}`;
}

export function mapAttendanceRecordToLog(
  data: Record<string, unknown>,
  companyId: string
): AttendanceLog | null {
  const employeeId = String(data.employeeId || '');
  if (!employeeId) return null;

  const date = String(data.date || '').slice(0, 10);
  const status = String(data.status || '').toLowerCase();
  const unpaidAbsenceDays =
    status === 'absent'
      ? 1
      : Number(data.unpaidAbsenceDays ?? data.unexcusedAbsenceDays ?? 0) || 0;

  return {
    companyId: String(data.companyId || companyId),
    employeeId,
    date,
    delayMinutes: Number(data.lateMinutes ?? data.delayMinutes ?? 0) || 0,
    overtimeHours: Number(data.overtimeHours ?? 0) || 0,
    unpaidAbsenceDays,
    checkIn: data.checkIn ? String(data.checkIn) : undefined,
    checkOut: data.checkOut ? String(data.checkOut) : undefined,
    actualHours: Number(data.workHours ?? data.actualHours ?? 0) || undefined,
    isHoliday: Boolean(data.isHoliday),
  };
}

export async function upsertAttendanceRecordDoc(
  companyId: string,
  record: Record<string, unknown> & { employeeId: string; date: string }
): Promise<string> {
  const date = String(record.date).slice(0, 10);
  const id = String(record.id || getAttendanceRecordDocId(companyId, record.employeeId, date));
  await setDoc(
    doc(db, 'attendance_records', id),
    cleanFirestoreData({
      ...record,
      id,
      companyId,
      date,
    }),
    { merge: true }
  );
  return id;
}
