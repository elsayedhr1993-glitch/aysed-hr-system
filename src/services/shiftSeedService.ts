import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';

export interface ShiftSeedRulesConfig {
  enabled: boolean;
  seedDays: number;
  adminWeekendOffDay: number;
  medicalKeywords: string;
  securityKeywords: string;
}

export type ShiftSeedRunMode = 'preserve_existing' | 'overwrite_window';

export const DEFAULT_SHIFT_SEED_RULES: ShiftSeedRulesConfig = {
  enabled: true,
  seedDays: 7,
  adminWeekendOffDay: 5,
  medicalKeywords: 'طبي,ممرض,تمريض,عيادة,طوارئ,doctor,nurse,medical,clinic,emergency,moh',
  securityKeywords: 'حارس,أمن,امن,security,guard',
};

export function shiftSeedConfigDocId(companyId: string): string {
  return `attendance_shift_seed_rules_${companyId}`;
}

export async function loadShiftSeedRules(companyId: string): Promise<ShiftSeedRulesConfig> {
  if (!companyId) return DEFAULT_SHIFT_SEED_RULES;
  try {
    const snapshot = await getDoc(doc(db, 'system_config', shiftSeedConfigDocId(companyId)));
    const data = snapshot.data() as Partial<ShiftSeedRulesConfig> | undefined;
    return { ...DEFAULT_SHIFT_SEED_RULES, ...(data || {}) };
  } catch (error) {
    console.error('Failed to load shift seed rules', error);
    return DEFAULT_SHIFT_SEED_RULES;
  }
}

export async function saveShiftSeedRules(companyId: string, rules: ShiftSeedRulesConfig): Promise<void> {
  if (!companyId) return;
  await setDoc(
    doc(db, 'system_config', shiftSeedConfigDocId(companyId)),
    cleanFirestoreData({
      companyId,
      ...rules,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
}

export async function runShiftSeedForCompany(
  companyId: string,
  shiftSeedRules: ShiftSeedRulesConfig,
  shiftSeedRunMode: ShiftSeedRunMode
): Promise<{ generatedCount: number; skippedCount: number; totalWrites: number }> {
  const profilesSnapshot = await getDocs(query(collection(db, 'shift_profiles'), where('companyId', '==', companyId)));
  let profiles = profilesSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Record<string, unknown>) }));

  if (profiles.length === 0) {
    const defaults = [
      {
        id: `${companyId}_shift_morning`,
        companyId,
        name: 'الوردية الصباحية الرئيسية',
        startTime: '08:00',
        endTime: '16:00',
        type: 'MORNING',
        color: '#d97706',
      },
      {
        id: `${companyId}_shift_evening`,
        companyId,
        name: 'الوردية المسائية',
        startTime: '16:00',
        endTime: '00:00',
        type: 'EVENING',
        color: '#4f46e5',
      },
      {
        id: `${companyId}_shift_night`,
        companyId,
        name: 'الوردية الليلية',
        startTime: '00:00',
        endTime: '08:00',
        type: 'CONTINUOUS',
        color: '#0f766e',
      },
    ];
    await Promise.all(
      defaults.map((profile) =>
        setDoc(doc(db, 'shift_profiles', profile.id), cleanFirestoreData(profile), { merge: false })
      )
    );
    profiles = defaults;
  }

  const profileIds = profiles.map((profile) => profile.id);
  const morningProfileId = `${companyId}_shift_morning`;
  const eveningProfileId = `${companyId}_shift_evening`;
  const nightProfileId = `${companyId}_shift_night`;
  const fallbackProfileId = profileIds[0] || '';
  const defaultShiftId = profileIds.includes(morningProfileId) ? morningProfileId : fallbackProfileId;
  if (!defaultShiftId) {
    throw new Error('تعذر تحديد شفت افتراضي للتوليد.');
  }

  const employeesSnapshot = await getDocs(query(collection(db, 'employees'), where('companyId', '==', companyId)));
  const companyEmployees = employeesSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Record<string, unknown>) }));
  if (companyEmployees.length === 0) {
    throw new Error('لا يوجد موظفون مرتبطون بالمنشأة لتنفيذ التهيئة.');
  }

  const medicalKeywords = shiftSeedRules.medicalKeywords
    .split(',')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);
  const securityKeywords = shiftSeedRules.securityKeywords
    .split(',')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

  const hasMorning = profileIds.includes(morningProfileId);
  const hasEvening = profileIds.includes(eveningProfileId);
  const hasNight = profileIds.includes(nightProfileId);

  const resolveShiftIdForEmployeeDay = (emp: Record<string, unknown>, dayOffset: number, dayDate: Date) => {
    const department = String(emp.department || emp.dept || '').toLowerCase();
    const jobTitle = String(emp.jobTitle || '').toLowerCase();
    const workHints = `${department} ${jobTitle}`;

    const isMedical = medicalKeywords.some((keyword) => workHints.includes(keyword));
    const isSecurity = securityKeywords.some((keyword) => workHints.includes(keyword));
    const isAdminOffDay = dayDate.getDay() === shiftSeedRules.adminWeekendOffDay;

    if (!isMedical && !isSecurity && isAdminOffDay) return 'off';

    if (isMedical) {
      if (hasNight && dayOffset % 3 === 2) return nightProfileId;
      if (hasEvening && dayOffset % 2 === 1) return eveningProfileId;
      if (hasMorning) return morningProfileId;
      return defaultShiftId;
    }

    if (isSecurity) {
      if (hasNight && dayOffset % 2 === 1) return nightProfileId;
      if (hasEvening && dayOffset % 2 === 0) return eveningProfileId;
      if (hasMorning) return morningProfileId;
      return defaultShiftId;
    }

    if (hasMorning) return morningProfileId;
    return defaultShiftId;
  };

  const today = new Date();
  const writes: Promise<unknown>[] = [];
  const daysToSeed = Math.max(1, Math.min(31, shiftSeedRules.seedDays || 7));
  let skippedCount = 0;

  if (shiftSeedRunMode === 'overwrite_window') {
    const totalAssignments = companyEmployees.length * daysToSeed;
    const confirmOverwrite = window.confirm(
      `سيتم استبدال تعيينات الشفتات للفترة المحددة بالكامل.\n\nعدد الموظفين: ${companyEmployees.length}\nعدد الأيام: ${daysToSeed}\nإجمالي التعيينات المتوقع تعديلها: ${totalAssignments}\n\nهل تريد المتابعة؟`
    );
    if (!confirmOverwrite) {
      return { generatedCount: 0, skippedCount: 0, totalWrites: 0 };
    }
  }

  companyEmployees.forEach((emp) => {
    for (let offset = 0; offset < daysToSeed; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const dateStr = date.toISOString().slice(0, 10);
      const assignmentId = `${companyId}_${emp.id}_${dateStr}`;
      const shiftId = resolveShiftIdForEmployeeDay(emp, offset, date);

      if (shiftSeedRunMode === 'preserve_existing') {
        writes.push(
          (async () => {
            const existing = await getDoc(doc(db, 'employee_shifts', assignmentId));
            if (existing.exists()) {
              skippedCount += 1;
              return;
            }
            await setDoc(
              doc(db, 'employee_shifts', assignmentId),
              cleanFirestoreData({
                id: assignmentId,
                companyId,
                employeeId: emp.id,
                shiftId,
                date: dateStr,
                updatedAt: new Date().toISOString(),
              }),
              { merge: false }
            );
          })()
        );
      } else {
        writes.push(
          setDoc(
            doc(db, 'employee_shifts', assignmentId),
            cleanFirestoreData({
              id: assignmentId,
              companyId,
              employeeId: emp.id,
              shiftId,
              date: dateStr,
              updatedAt: new Date().toISOString(),
            }),
            { merge: true }
          )
        );
      }
    }
  });

  await Promise.all(writes);
  const generatedCount = writes.length - skippedCount;
  return { generatedCount, skippedCount, totalWrites: writes.length };
}
