/**
 * محرك دورة حياة الموظف الموحد (Unified Employee Lifecycle Engine)
 * متوافق مع نظام أودو 18 وقانون العمل الكويتي (القطاع الأهلي - رقم 6 لسنة 2010)
 */

export type EmployeeLifecycleStatus =
  | 'ONBOARDING'     // جديد قيد التعاقد والتهيئة (Draft/New Hire)
  | 'PROBATION'      // تحت فترة التجربة (المادة 32 - بحد أقصى 100 يوم عمل)
  | 'ACTIVE'         // على رأس العمل (مباشر ومثبت رسمياً)
  | 'ON_LEAVE'       // في إجازة رسمية (سنوية، مرضية، بدون راتب، حج، وضع...)
  | 'NOTICE_PERIOD'  // في فترة الإنذار التعاقدي
  | 'SUSPENDED'      // موقوف مؤقتاً عن العمل
  | 'TERMINATED'     // إنهاء خدمة من قبل صاحب العمل / انتهاء العقد
  | 'RESIGNED';      // استقالة الموظف (المادة 53)

export interface StatusMeta {
  code: EmployeeLifecycleStatus;
  labelAr: string;
  labelEn: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  icon: string;
  description: string;
}

export const LIFECYCLE_STAGES: Record<EmployeeLifecycleStatus, StatusMeta> = {
  ONBOARDING: {
    code: 'ONBOARDING',
    labelAr: 'قيد التهيئة والتعاقد',
    labelEn: 'Onboarding',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    icon: '📝',
    description: 'تم قبوله/تعيينه وجاري استكمال الأوراق وتوقيع العقد وتجهيز المباشرة'
  },
  PROBATION: {
    code: 'PROBATION',
    labelAr: 'تحت فترة التجربة',
    labelEn: 'Probation (100d)',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    icon: '⏱️',
    description: 'باشر العمل ويخضع لفترة التجربة (المادة 32: 100 يوم عمل كحد أقصى)'
  },
  ACTIVE: {
    code: 'ACTIVE',
    labelAr: 'على رأس العمل',
    labelEn: 'Active',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: '✓',
    description: 'موظف مثبت على رأس عمله وبصمته وعقده ساريين بالكامل'
  },
  ON_LEAVE: {
    code: 'ON_LEAVE',
    labelAr: 'في إجازة معتمدة',
    labelEn: 'On Leave',
    badgeBg: 'bg-indigo-50',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    icon: '🌴',
    description: 'يقضي إجازة رسمية معتمدة ولم يقم بمباشرة العمل بعدها'
  },
  NOTICE_PERIOD: {
    code: 'NOTICE_PERIOD',
    labelAr: 'في فترة الإنذار',
    labelEn: 'Notice Period',
    badgeBg: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
    icon: '⚠️',
    description: 'قدم استقالة أو تلقى إشعار إنهاء ويقضي فترة الإنذار القانونية'
  },
  SUSPENDED: {
    code: 'SUSPENDED',
    labelAr: 'موقوف مؤقتاً',
    labelEn: 'Suspended',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
    dotColor: 'bg-slate-500',
    icon: '⏸️',
    description: 'موقوف عن العمل أو قيد التحقيق الإداري'
  },
  RESIGNED: {
    code: 'RESIGNED',
    labelAr: 'مستقيل (إنهاء خدمة)',
    labelEn: 'Resigned',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500',
    icon: '🚪',
    description: 'تم قبول استقالته وتصفية مستحقاته وإبراء ذمته'
  },
  TERMINATED: {
    code: 'TERMINATED',
    labelAr: 'منتهية خدمته',
    labelEn: 'Terminated',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-900',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-600',
    icon: '🛑',
    description: 'تم إنهاء خدمته من قبل الشركة أو انتهاء مدة عقده وتصفيته'
  }
};

/**
 * توحيد ومعايرة حالة الموظف من أي قيمة نصية قديمة أو عربية
 */
export function normalizeEmployeeStatus(rawStatus?: string | null): EmployeeLifecycleStatus {
  if (!rawStatus) return 'ACTIVE';
  const s = String(rawStatus).trim().toLowerCase();

  // Onboarding / Draft
  if (['onboarding', 'draft', 'مسودة', 'جديد', 'قيد التعاقد', 'قيد التهيئة', 'new'].includes(s)) {
    return 'ONBOARDING';
  }

  // Probation
  if (['probation', 'تجربة', 'تحت التجربة', 'فترة تجربة'].includes(s)) {
    return 'PROBATION';
  }

  // On Leave
  if (['on_leave', 'onleave', 'leave', 'في إجازة', 'إجازة', 'مجاز'].includes(s)) {
    return 'ON_LEAVE';
  }

  // Notice Period
  if (['notice_period', 'notice', 'إنذار', 'فترة إنذار', 'فترة الإنذار'].includes(s)) {
    return 'NOTICE_PERIOD';
  }

  // Suspended
  if (['suspended', 'موقوف', 'موقوف مؤقتا', 'إيقاف'].includes(s)) {
    return 'SUSPENDED';
  }

  // Resigned
  if (['resigned', 'resignation', 'استقالة', 'مستقيل'].includes(s)) {
    return 'RESIGNED';
  }

  // Terminated
  if (['terminated', 'termination', 'منتهي', 'منتهية خدمته', 'إنهاء خدمة', 'مفصول', 'مغادر'].includes(s)) {
    return 'TERMINATED';
  }

  // Default active
  return 'ACTIVE';
}

/**
 * الحصول على البيانات المرئية وشارة الحالة
 */
export function getEmployeeStatusMeta(rawStatus?: string | null): StatusMeta {
  const code = normalizeEmployeeStatus(rawStatus);
  return LIFECYCLE_STAGES[code] || LIFECYCLE_STAGES.ACTIVE;
}

/**
 * حساب تفاصيل فترة التجربة وفق المادة 32 من قانون العمل الكويتي (100 يوم)
 */
export function getProbationDetails(joinDateOrCommencement?: string | null): {
  inProbation: boolean;
  daysPassed: number;
  daysLeft: number;
  totalDays: number;
  probationEndDate: string;
} {
  const totalDays = 100; // المادة 32 - قانون العمل الكويتي
  if (!joinDateOrCommencement) {
    return {
      inProbation: false,
      daysPassed: 0,
      daysLeft: 0,
      totalDays,
      probationEndDate: ''
    };
  }

  const start = new Date(joinDateOrCommencement);
  if (isNaN(start.getTime())) {
    return {
      inProbation: false,
      daysPassed: 0,
      daysLeft: 0,
      totalDays,
      probationEndDate: ''
    };
  }

  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const daysPassed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, totalDays - daysPassed);
  const inProbation = daysPassed < totalDays && daysPassed >= 0;

  const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
  const probationEndDate = end.toISOString().split('T')[0];

  return {
    inProbation,
    daysPassed,
    daysLeft,
    totalDays,
    probationEndDate
  };
}

/**
 * معايرة وتوحيد كائن الموظف لمنع التضارب بين المسميات في مختلف الشاشات
 */
export function normalizeEmployeeRecord(emp: any): any {
  if (!emp) return emp;
  const nameAr = emp.fullNameAr || emp.nameAr || emp.name || 'موظف';
  const nameEn = emp.fullNameEn || emp.nameEn || '';
  const department = emp.department || emp.dept || 'العموم';
  const basicSalary = Number(emp.basicSalary || emp.contractSalary || emp.wage || emp.salary || 0);
  const normalizedStatus = normalizeEmployeeStatus(emp.status);

  return {
    ...emp,
    id: emp.id,
    fullNameAr: nameAr,
    nameAr: nameAr,
    name: nameAr,
    fullNameEn: nameEn,
    nameEn: nameEn,
    department: department,
    dept: department,
    basicSalary: basicSalary,
    contractSalary: basicSalary,
    status: normalizedStatus,
    companyId: emp.companyId || emp.company_id || 'comp-super-admin'
  };
}
