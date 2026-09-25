import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KUWAIT_PUBLIC_HOLIDAYS_2026_DEFAULT,
  expandPublicHolidaysToDailyDates,
  getCompensatedHolidays2026,
  getKuwaitHolidayDailyDates2026,
  KUWAIT_HOLIDAYS_2026,
  isKuwaitPublicHolidayDate,
} from './kuwaitPublicHolidays2026.ts';
import { getCompensatedHolidays2026 as fromKuwaitLaw, KUWAIT_HOLIDAYS_2026 as lawBase } from '../utils/kuwaitLaw.ts';

test('SSOT expands record ranges to expected day count', () => {
  const daily = expandPublicHolidaysToDailyDates(KUWAIT_PUBLIC_HOLIDAYS_2026_DEFAULT);
  assert.equal(daily.length, 13);
  assert.ok(daily.some((d) => d.date === '2026-01-16' && d.name.includes('الإسراء')));
  assert.ok(daily.some((d) => d.date === '2026-02-25'));
  assert.ok(daily.some((d) => d.date === '2026-02-26'));
});

test('kuwaitLaw re-exports the same base and compensated holiday dates as SSOT', () => {
  const ssotBase = getKuwaitHolidayDailyDates2026().map((h) => h.date).sort();
  const lawDates = lawBase.map((h) => h.date).sort();
  assert.deepEqual(lawDates, ssotBase);

  const ssotComp = getCompensatedHolidays2026().map((h) => h.date).sort();
  const lawComp = fromKuwaitLaw().map((h) => h.date).sort();
  assert.deepEqual(lawComp, ssotComp);
});

test('no duplicate dates in compensated list', () => {
  const comp = getCompensatedHolidays2026();
  const dates = comp.map((h) => h.date);
  assert.equal(new Set(dates).size, dates.length);
});

test('Israa & Miraj is a single authoritative date across exports', () => {
  assert.equal(isKuwaitPublicHolidayDate('2026-01-16'), true);
  assert.equal(isKuwaitPublicHolidayDate('2026-02-14'), false);
  const israaInExport = KUWAIT_HOLIDAYS_2026.find((h) => h.name.includes('الإسراء'));
  assert.equal(israaInExport?.date, '2026-01-16');
});
