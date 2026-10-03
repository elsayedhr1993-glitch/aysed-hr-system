export type ReportColumnDef = {
  key: string;
  ar: string;
  en: string;
  className?: string;
};

export const WPS_RECONCILIATION_COLUMNS: ReportColumnDef[] = [
  { key: 'reports.wps.col.emp_code', ar: 'كود الموظف', en: 'Employee code', className: 'p-3.5' },
  { key: 'reports.wps.col.employee', ar: 'الموظف / الرقم المدني', en: 'Employee / Civil ID', className: 'p-3.5' },
  { key: 'reports.wps.col.dept', ar: 'القسم والمسمى', en: 'Dept & title', className: 'p-3.5' },
  { key: 'reports.wps.col.basic', ar: 'الأساسي (د.ك)', en: 'Basic (KWD)', className: 'p-3.5 text-left' },
  { key: 'reports.wps.col.allowances', ar: 'البدلات (د.ك)', en: 'Allowances (KWD)', className: 'p-3.5 text-left' },
  { key: 'reports.wps.col.extra', ar: 'الإضافي (+)', en: 'Extra (+)', className: 'p-3.5 text-left' },
  { key: 'reports.wps.col.deduction', ar: 'الخصم (-)', en: 'Deduction (-)', className: 'p-3.5 text-left' },
  { key: 'reports.wps.col.net', ar: 'صافي المحول WPS', en: 'Net WPS', className: 'p-3.5 text-left text-emerald-800' },
  { key: 'reports.wps.col.bank', ar: 'البنك والآيبان', en: 'Bank & IBAN', className: 'p-3.5' },
  { key: 'reports.wps.col.status', ar: 'حالة الدفعة', en: 'Payment status', className: 'p-3.5 text-center' },
];

export const GOV_COMPLIANCE_COLUMNS: ReportColumnDef[] = [
  { key: 'reports.gov.col.employee', ar: 'الموظف / الرقم المدني', en: 'Employee / Civil ID', className: 'p-3.5' },
  { key: 'reports.gov.col.nationality', ar: 'الجنسية والكادر', en: 'Nationality & cadre', className: 'p-3.5' },
  { key: 'reports.gov.col.residency', ar: 'انتهاء الإقامة (Residency)', en: 'Residency expiry', className: 'p-3.5' },
  { key: 'reports.gov.col.pam', ar: 'إذن العمل (PAM)', en: 'Work permit (PAM)', className: 'p-3.5' },
  { key: 'reports.gov.col.moh', ar: 'ترخيص مزاولة المهنة (MOH)', en: 'MOH license', className: 'p-3.5' },
  { key: 'reports.gov.col.status', ar: 'حالة الامتثال والإنذار', en: 'Compliance status', className: 'p-3.5 text-center' },
];

export const EOS_ACCRUAL_COLUMNS: ReportColumnDef[] = [
  { key: 'reports.eos.col.employee', ar: 'الموظف / الرقم المدني', en: 'Employee / Civil ID', className: 'p-3.5' },
  { key: 'reports.eos.col.join', ar: 'تاريخ التعيين', en: 'Join date', className: 'p-3.5' },
  { key: 'reports.eos.col.service', ar: 'مدة الخدمة', en: 'Service years', className: 'p-3.5' },
  { key: 'reports.eos.col.total_salary', ar: 'الراتب الشامل (د.ك)', en: 'Total salary (KWD)', className: 'p-3.5 text-left' },
  { key: 'reports.eos.col.daily', ar: 'أجر اليوم (÷26)', en: 'Daily wage (÷26)', className: 'p-3.5 text-left' },
  { key: 'reports.eos.col.rule', ar: 'قاعدة الاحتساب (المادة 51)', en: 'Art. 51 rule', className: 'p-3.5' },
  { key: 'reports.eos.col.accrual', ar: 'المخصص المتراكم (Accrual)', en: 'Accrual', className: 'p-3.5 text-left text-purple-900' },
  { key: 'reports.eos.col.cap', ar: 'الحد الأقصى (18 شهر)', en: 'Cap (18 months)', className: 'p-3.5 text-left text-slate-400' },
];

export const LEAVES_LIABILITY_COLUMNS: ReportColumnDef[] = [
  { key: 'reports.leaves.col.employee', ar: 'الموظف / الرقم المدني', en: 'Employee / Civil ID', className: 'p-3.5' },
  { key: 'reports.leaves.col.dept', ar: 'المسمى والقسم', en: 'Title & dept', className: 'p-3.5' },
  { key: 'reports.leaves.col.entitlement', ar: 'الاستحقاق السنوي (يوم)', en: 'Annual entitlement', className: 'p-3.5 text-center' },
  { key: 'reports.leaves.col.consumed', ar: 'المستهلك فعلياً', en: 'Consumed', className: 'p-3.5 text-center text-slate-500' },
  { key: 'reports.leaves.col.fifo', ar: 'تفصيل FIFO', en: 'FIFO detail', className: 'p-3.5 text-center' },
  { key: 'reports.leaves.col.balance', ar: 'الرصيد المتبقي (يوم)', en: 'Balance (days)', className: 'p-3.5 text-center font-bold text-purple-900' },
  { key: 'reports.leaves.col.daily', ar: 'أجر اليوم (÷26)', en: 'Daily wage', className: 'p-3.5 text-left' },
  { key: 'reports.leaves.col.liability', ar: 'الالتزام النقدي للرصيد (د.ك)', en: 'Cash liability (KWD)', className: 'p-3.5 text-left text-amber-800 font-bold' },
];

export const ATTENDANCE_OT_COLUMNS: ReportColumnDef[] = [
  { key: 'reports.attendance.col.employee', ar: 'الموظف / الرقم المدني', en: 'Employee / Civil ID', className: 'p-3.5' },
  { key: 'reports.attendance.col.dept', ar: 'القسم والكادر', en: 'Dept & cadre', className: 'p-3.5' },
  { key: 'reports.attendance.col.ot_hours', ar: 'ساعات الإضافي (OT)', en: 'OT hours', className: 'p-3.5 text-center' },
  { key: 'reports.attendance.col.ot_pay', ar: 'مستحق الإضافي (د.ك)', en: 'OT pay (KWD)', className: 'p-3.5 text-left text-purple-700 font-bold' },
  { key: 'reports.attendance.col.late_min', ar: 'دقائق التأخير', en: 'Late minutes', className: 'p-3.5 text-center' },
  { key: 'reports.attendance.col.late_ded', ar: 'خصم التأخير (د.ك)', en: 'Late deduction', className: 'p-3.5 text-left text-rose-600' },
  { key: 'reports.attendance.col.absence_days', ar: 'أيام الغياب', en: 'Absence days', className: 'p-3.5 text-center' },
  { key: 'reports.attendance.col.absence_ded', ar: 'خصم الغياب (د.ك)', en: 'Absence deduction', className: 'p-3.5 text-left text-rose-700' },
  { key: 'reports.attendance.col.net', ar: 'صافي الأثر المالي', en: 'Net financial impact', className: 'p-3.5 text-left text-emerald-800 font-bold' },
];

export const REPORT_NAV_ITEMS: { id: string; ar: string; en: string }[] = [
  { id: 'wps_reconciliation', ar: '1. مطابقة مسيرات الرواتب (شهر الفترة)', en: '1. WPS reconciliation' },
  { id: 'gov_compliance', ar: '2. الإقامات وأذونات PAM وتراخيص MOH', en: '2. Gov compliance' },
  { id: 'eos_indemnity_accrual', ar: '3. مخصصات نهاية الخدمة (مادة 51)', en: '3. EOS accrual' },
  { id: 'leaves_financial_liability', ar: '4. أرصدة الإجازات والالتزام النقدي', en: '4. Leave liability' },
  { id: 'attendance_overtime_analytics', ar: '5. تحليل التأخير والغياب والإضافي (شهري)', en: '5. Attendance analytics' },
];
