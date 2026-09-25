/**
 * Single source of truth (SSOT) for Kuwait public holidays — calendar year 2026.
 * Consumed by: Public Holidays app, leave/working-day logic (kuwaitLaw), payroll-related calendars.
 */

export type KuwaitHolidayType = 'national' | 'religious' | 'official' | 'cabinet_decision';

export interface KuwaitPublicHolidayRecord {
  id: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  type: KuwaitHolidayType;
  status: 'approved' | 'active';
  isPaid: boolean;
  decreeNumber?: string;
  notes?: string;
}

/** Flat day row for leave engine and payroll calendars */
export interface KuwaitHolidayDay {
  date: string;
  name: string;
  holidayId: string;
  isCompensationDay?: boolean;
}

export const KUWAIT_PUBLIC_HOLIDAYS_SCHEMA_VERSION = 1;

/** Default national list (cabinet / religious calendars — 2026). */
export const KUWAIT_PUBLIC_HOLIDAYS_2026_DEFAULT: KuwaitPublicHolidayRecord[] = [
  {
    id: 'HOL-KW-01',
    nameAr: 'رأس السنة الميلادية 2026',
    nameEn: 'New Year Day',
    startDate: '2026-01-01',
    endDate: '2026-01-01',
    daysCount: 1,
    type: 'official',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'قرار مجلس الوزراء رقم 1 لسنة 2026',
    notes: 'عطلة رسمية لكافة الوزارات والجهات والمؤسسات الحكومية والقطاع الأهلي',
  },
  {
    id: 'HOL-KW-02',
    nameAr: 'ذكرى الإسراء والمعراج',
    nameEn: 'Israa & Miraj',
    startDate: '2026-01-16',
    endDate: '2026-01-16',
    daysCount: 1,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم العطلات الدينية الرسمية',
    notes: 'عطلة دينية مدفوعة الأجر بالكامل',
  },
  {
    id: 'HOL-KW-03',
    nameAr: 'العيد الوطني ويوم التحرير (25 - 26 فبراير)',
    nameEn: 'National & Liberation Days',
    startDate: '2026-02-25',
    endDate: '2026-02-26',
    daysCount: 2,
    type: 'national',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم الأعياد الوطنية الرسمية',
    notes: 'ذكرى الاستقلال ويوم التحرير المجيد لدولة الكويت',
  },
  {
    id: 'HOL-KW-04',
    nameAr: 'عطلة عيد الفطر المبارك 1447هـ',
    nameEn: 'Eid Al-Fitr Holiday',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    daysCount: 3,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'قرار مجلس الوزراء - إجازة العيد',
    notes: '3 أيام رسمية متتالية وفق تقويم هيئة الرؤية الشرعية',
  },
  {
    id: 'HOL-KW-05',
    nameAr: 'وقفة عرفات وعطلة عيد الأضحى المبارك',
    nameEn: 'Waqfat Arafat & Eid Al-Adha',
    startDate: '2026-05-26',
    endDate: '2026-05-29',
    daysCount: 4,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'قرار مجلس الوزراء - عيد الأضحى',
    notes: '4 أيام تشمل يوم الوقفة وثلاثة أيام التشريق',
  },
  {
    id: 'HOL-KW-06',
    nameAr: 'رأس السنة الهجرية 1448هـ',
    nameEn: 'Islamic Hijri New Year',
    startDate: '2026-06-16',
    endDate: '2026-06-16',
    daysCount: 1,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم العطلات الدينية',
    notes: 'غرة شهر محرم الحرام للسنة الهجرية الجديدة',
  },
  {
    id: 'HOL-KW-07',
    nameAr: 'المولد النبوي الشريف',
    nameEn: 'Prophet Muhammad Birthday',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    daysCount: 1,
    type: 'religious',
    status: 'approved',
    isPaid: true,
    decreeNumber: 'مرسوم العطلات الدينية',
    notes: '12 ربيع الأول - ذكرى المولد النبوي الشريف',
  },
];

function addDaysYmd(dateStr: string, delta: number): string {
  const d = parseYmdLocal(dateStr);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD in local timezone (avoids UTC Friday drift). */
export function parseYmdLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

export function formatYmdLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Expand holiday records to one row per calendar day (inclusive start–end).
 */
export function expandPublicHolidaysToDailyDates(
  records: KuwaitPublicHolidayRecord[]
): KuwaitHolidayDay[] {
  const byDate = new Map<string, KuwaitHolidayDay>();

  for (const record of records) {
    let cursor = record.startDate;
    const end = record.endDate || record.startDate;
    while (cursor <= end) {
      if (!byDate.has(cursor)) {
        byDate.set(cursor, {
          date: cursor,
          name: record.nameAr,
          holidayId: record.id,
        });
      }
      if (cursor === end) break;
      cursor = addDaysYmd(cursor, 1);
    }
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Base daily holidays (no Friday compensation days).
 */
export function getKuwaitHolidayDailyDates2026(
  records: KuwaitPublicHolidayRecord[] = KUWAIT_PUBLIC_HOLIDAYS_2026_DEFAULT
): KuwaitHolidayDay[] {
  return expandPublicHolidaysToDailyDates(records);
}

/**
 * If a public holiday falls on Friday, add official compensation (Thursday, else Sunday).
 */
export function getCompensatedHolidays2026(
  records: KuwaitPublicHolidayRecord[] = KUWAIT_PUBLIC_HOLIDAYS_2026_DEFAULT
): KuwaitHolidayDay[] {
  const base = expandPublicHolidaysToDailyDates(records);
  const holidayDates = new Set(base.map((h) => h.date));
  const finalHolidays: KuwaitHolidayDay[] = [...base];

  for (const holiday of base) {
    const date = parseYmdLocal(holiday.date);
    if (date.getDay() !== 5) continue;

    const thursdayStr = addDaysYmd(holiday.date, -1);
    const sundayStr = addDaysYmd(holiday.date, 2);

    if (!holidayDates.has(thursdayStr)) {
      finalHolidays.push({
        date: thursdayStr,
        name: `${holiday.name} (يوم تعويضي)`,
        holidayId: holiday.holidayId,
        isCompensationDay: true,
      });
      holidayDates.add(thursdayStr);
    } else if (!holidayDates.has(sundayStr)) {
      finalHolidays.push({
        date: sundayStr,
        name: `${holiday.name} (يوم تعويضي)`,
        holidayId: holiday.holidayId,
        isCompensationDay: true,
      });
      holidayDates.add(sundayStr);
    }
  }

  return finalHolidays.sort((a, b) => a.date.localeCompare(b.date));
}

/** Back-compat alias: flat { date, name } for kuwaitLaw */
export const KUWAIT_HOLIDAYS_2026 = getKuwaitHolidayDailyDates2026().map(({ date, name }) => ({
  date,
  name,
}));

export function isKuwaitPublicHolidayDate(
  dateStr: string,
  includeCompensation = true,
  records: KuwaitPublicHolidayRecord[] = KUWAIT_PUBLIC_HOLIDAYS_2026_DEFAULT
): boolean {
  const list = includeCompensation ? getCompensatedHolidays2026(records) : getKuwaitHolidayDailyDates2026(records);
  return list.some((h) => h.date === dateStr);
}
