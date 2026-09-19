/**
 * مصدر الحقيقة لحقول ملف الموظف (دليل الموظفين — EmployeesApp).
 * استخدمه عند إضافة حقول جديدة لتجنب التعديل من أكثر من شاشة.
 */
export const EMPLOYEE_FIELD_SOURCES = {
  basicSalary: 'OdooContractsApp / contracts',
  housingAllowance: 'OdooContractsApp / contracts',
  transportAllowance: 'OdooContractsApp / contracts',
  medicalAllowance: 'OdooContractsApp / contracts',
  otherAllowance: 'OdooContractsApp / contracts',
  hireDate: 'CommencementApp (اعتماد مباشرة)',
  joinDate: 'CommencementApp (اعتماد مباشرة)',
  commencementDate: 'CommencementApp',
  carriedOverBalance: 'leave_allocations + leaveEngine',
  leaveBalance: 'leave_allocations + leaveEngine',
  jobTitle: 'Employee detail / Quick edit',
  department: 'Employee detail / Quick edit',
  bankName: 'Employee detail / Quick edit / Private tab',
  iban: 'Employee detail / Quick edit / Private tab',
  onboardingPlan: 'onboarding_plans (Firestore)',
  holidayWork: 'تطبيق الإجازات (مفضّل) أو HR tab عند عدم ربط التنقل'
} as const;
