/** The table shows the custody lifecycle. Condition stays a separate field. */
export function custodyTableStatus(item: { status?: string; condition?: string }): {
  column: 'status';
  value: string;
  conditionHint: string;
} {
  return {
    column: 'status',
    value: item.status || '',
    conditionHint: item.condition || '',
  };
}

/** Unreturned custody is an alert. It is not an amount taken from the settlement. */
export function undeliveredCustodyAlert(assignedCount: number): string | null {
  return assignedCount > 0 ? 'عهدة غير مسلّمة' : null;
}

export function custodySettlementDeduction(): number {
  return 0;
}
