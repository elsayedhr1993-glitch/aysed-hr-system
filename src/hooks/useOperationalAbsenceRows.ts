import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { OperationalAbsenceRow } from '../components/timeoff/OperationalAbsencePanel';

export function useOperationalAbsenceRows(companyId: string | undefined, limit = 200) {
  const [rows, setRows] = useState<OperationalAbsenceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const absenceQuery = query(collection(db, 'attendance_records'), where('companyId', '==', companyId));
    return onSnapshot(
      absenceQuery,
      (snapshot) => {
        const mapped = snapshot.docs
          .map((item) => ({ ...item.data(), id: item.id } as Record<string, unknown>))
          .filter((row) => {
            const status = String(row.status || '').toLowerCase();
            const unpaid = Number(row.unpaidAbsenceDays ?? row.unexcusedAbsenceDays ?? 0) > 0;
            return status === 'absent' || unpaid;
          })
          .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
          .slice(0, limit)
          .map((row) => ({
            id: String(row.id),
            date: String(row.date || ''),
            employeeName: String(row.employeeName || ''),
            employeeId: String(row.employeeId || ''),
            department: String(row.department || ''),
            status: String(row.status || ''),
            notes: String(row.notes || ''),
            excuseReason: String(row.excuseReason || ''),
          }));
        setRows(mapped);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load operational absences', error);
        setRows([]);
        setLoading(false);
      }
    );
  }, [companyId, limit]);

  return { rows, loading };
}
