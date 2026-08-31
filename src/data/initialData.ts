import { Company, Employee, Candidate, Contract, LeaveRequest, AttendanceRecord, Payslip, DocumentItem, AutomationRule, Department, JobTitle, CustodyItem, LoanAdvance, DisciplinaryWarning, EmployeeNote, CompanySubscription } from '../types';

export const initialCompanies: Company[] = [
  {
    id: 'comp-1',
    nameAr: 'شركة النخبة الطبية',
    nameEn: 'Elite Medical Co',
    email: 'elite@aysed.com',
    phone: '666968182',
    status: 'active',
    industry: 'طبي',
    currency: 'KWD'
  },
  {
    id: 'comp-fanar',
    nameAr: 'مجموعة الفنار الطبية',
    nameEn: 'Fanar Medical Group',
    email: 'alfanar@aysed.com',
    phone: '66968180',
    status: 'active',
    industry: 'طبي',
    currency: 'KWD'
  },
  {
    id: 'comp-almanar',
    nameAr: 'شركة المنار لخدمات الدعم الطبي',
    nameEn: 'Al Manar Medical Support',
    email: 'almanar@aysed.com',
    phone: '99112233',
    status: 'active',
    industry: 'طبي',
    currency: 'KWD'
  }
];

export const initialSubscriptions: CompanySubscription[] = [];

export const initialDepartments: Department[] = [
  { id: 'dept-hr-admin', name: 'الموارد البشرية والإدارة', code: 'HR', description: 'شؤون الموظفين والتوظيف والرواتب' },
  { id: 'dept-finance', name: 'الإدارة المالية والحسابات', code: 'FIN', description: 'المحاسبة العامة والميزانيات والتدقيق' },
  { id: 'dept-medical', name: 'الجلدية والليزر والتجميل', code: 'MED', description: 'الكادر الطبي والتمريضي والفني' },
  { id: 'dept-gov-rel', name: 'الشؤون القانونية والعلاقات الحكومية', code: 'LEGAL', description: 'الجوازات وشؤون العمل وتجديد التراخيص' },
  { id: 'dept-marketing', name: 'التسويق وخدمة العملاء', code: 'MKT', description: 'خدمة العملاء والاستقبال والتسويق' },
  { id: 'dept-it-support', name: 'تقنية المعلومات والدعم الفني', code: 'IT', description: 'الأنظمة والشبكات والدعم الفني' },
  { id: 'dept-operations', name: 'الخدمات المساندة والتشغيل', code: 'OPS', description: 'الخدمات اللوجستية والحركة والخدمات المساندة' },
];


import { ALL_KUWAIT_JOB_POSITIONS } from '../utils/pam-dictionary';

export const initialJobTitles: JobTitle[] = ALL_KUWAIT_JOB_POSITIONS.map((item, index) => ({
  id: `jt-${index + 1}`,
  titleName: item.ar,
  titleNameEn: item.en,
  departmentName: item.category,
  description: `${item.category} Cadre`
}));


export const initialEmployees: Employee[] = [];

export const initialContracts: Contract[] = [];

export const initialLeaves: LeaveRequest[] = [];
export const initialAttendance: AttendanceRecord[] = [];
export const initialPayslips: Payslip[] = [];
export const initialDocuments: DocumentItem[] = [];
export const initialCandidates: Candidate[] = [];
export const initialCustodies: CustodyItem[] = [];
export const initialLoans: LoanAdvance[] = [];
export const initialWarnings: DisciplinaryWarning[] = [];
export const initialEmployeeNotes: EmployeeNote[] = [];
export const initialAutomationRules: AutomationRule[] = [];
export const demoSampleEmployees: Employee[] = [];
export const demoSampleContracts: Contract[] = [];
