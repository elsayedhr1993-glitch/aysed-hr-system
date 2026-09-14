import test from 'node:test';
import assert from 'node:assert/strict';

import { computeAttendanceAndOvertime } from './OdooHierarchyContext.tsx';

test('computeAttendanceAndOvertime excludes grace period before counting late minutes', () => {
  const result = computeAttendanceAndOvertime('08:20', '16:00', 1000, false, {
    dailyHours: 8,
    shiftStartTime: '08:00',
    shiftEndTime: '16:00',
    gracePeriodMinutes: 15,
    employmentType: 'full_time'
  });

  assert.equal(result.delayMinutes, 5);
  assert.equal(result.actualHours, 7.67);
  assert.equal(result.overtimeHours, 0);
});
