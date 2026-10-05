import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { HrLeaveAllocation, LeaveRequest, LeaveSettlementVoucher } from '../types';
import { isSettlementArchiveCompanyId } from '../services/leaveSettlementService';

/**
 * SSOT Firestore listeners for leave_requests, leave_allocations, leave_settlements (per company).
 */
export function useCompanyLeaveFinanceSnapshots(companyId?: string) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveAllocations, setLeaveAllocations] = useState<HrLeaveAllocation[]>([]);
  const [leaveSettlements, setLeaveSettlements] = useState<LeaveSettlementVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSettlementArchiveCompanyId(companyId)) {
      setLeaveRequests([]);
      setLeaveAllocations([]);
      setLeaveSettlements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tenantId = companyId as string;
    const requestsQuery = query(collection(db, 'leave_requests'), where('companyId', '==', tenantId));
    const allocationsQuery = query(collection(db, 'leave_allocations'), where('companyId', '==', tenantId));
    const settlementsQuery = query(collection(db, 'leave_settlements'), where('companyId', '==', tenantId));

    const unsubscribeRequests = onSnapshot(
      requestsQuery,
      (snapshot) => {
        setLeaveRequests(snapshot.docs.map((item) => ({ ...(item.data() as LeaveRequest), id: item.id })));
        setLoading(false);
      },
      (error) => {
        console.error('[useCompanyLeaveFinanceSnapshots] leave_requests', error);
        setLoading(false);
      }
    );

    const unsubscribeAllocations = onSnapshot(
      allocationsQuery,
      (snapshot) => {
        setLeaveAllocations(snapshot.docs.map((item) => ({ ...(item.data() as HrLeaveAllocation), id: item.id })));
      },
      (error) => console.error('[useCompanyLeaveFinanceSnapshots] leave_allocations', error)
    );

    const unsubscribeSettlements = onSnapshot(
      settlementsQuery,
      (snapshot) => {
        setLeaveSettlements(
          snapshot.docs.map((item) => ({ ...(item.data() as LeaveSettlementVoucher), id: item.id }))
        );
      },
      (error) => console.error('[useCompanyLeaveFinanceSnapshots] leave_settlements', error)
    );

    return () => {
      unsubscribeRequests();
      unsubscribeAllocations();
      unsubscribeSettlements();
    };
  }, [companyId]);

  return {
    leaveRequests,
    setLeaveRequests,
    leaveAllocations,
    setLeaveAllocations,
    leaveSettlements,
    loading,
  };
}
