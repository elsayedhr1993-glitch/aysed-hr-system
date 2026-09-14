import assert from 'node:assert/strict';
import {
  createDraftEmployee,
  advanceOnboardingState,
  validateDraftEmployee,
  ONBOARDING_STEPS,
  type DraftEmployee,
} from '../src/lib/onboardingStateMachine.ts';
import { validateEmployeeOnboardingInput, EmployeeOnboardingValidationError } from '../src/services/employeeOnboardingService.ts';
import { addDirectEmployeeViaAi } from '../src/services/tenantDataService.ts';
import { parseEmployeeCreationPrompt, shouldGenerateEmployeeAction } from '../src/lib/aiEmployeeActionParser.ts';

const draft = createDraftEmployee('comp-1788442584841');
assert.equal(draft.companyId, 'comp-1788442584841');
assert.equal(draft.onboardingStep, 'IDLE');
assert.ok(ONBOARDING_STEPS.includes('IDLE'));

const withCivilId: DraftEmployee = {
  ...draft,
  civilId: '288010101234',
  nameAr: 'أحمد محمد',
  birthDate: '1990-05-12',
  nationality: 'كويتي',
  civilIdExpiry: '2035-12-31',
  jobTitle: 'محاسب',
  department: 'المحاسبة',
  joinDate: '2026-09-10',
  basicSalary: 950,
  housingAllowance: 200,
  transportAllowance: 50,
  otherAllowance: 25,
  onboardingStep: 'CIVIL_ID_VERIFIED',
};

const next = advanceOnboardingState(withCivilId, 'ASK_JOB');
assert.equal(next.onboardingStep, 'ASK_JOB');
assert.deepEqual(validateDraftEmployee(next), { valid: true, errors: [] });

const invalid = {
  ...next,
  civilId: '1234',
  basicSalary: -1,
};
const result = validateDraftEmployee(invalid);
assert.equal(result.valid, false);
assert.ok(result.errors.some((e) => e.includes('الرقم المدني')));
assert.ok(result.errors.some((e) => e.includes('الراتب')));

assert.throws(() => {
  validateEmployeeOnboardingInput({
    companyId: 'comp-1788442584841',
    employee: {
      id: 'EMP-INVALID-1',
      fullNameAr: 'أحمد محمد',
      civilId: '1234',
      email: 'ahmed@example.com',
      bankName: 'بنك الكويت الوطني',
      iban: 'KW81CBKU0000000000000000000001',
      basicSalary: 500,
      joinDate: '2026-09-10',
    },
  });
}, EmployeeOnboardingValidationError);

assert.throws(() => {
  validateEmployeeOnboardingInput({
    companyId: 'comp-1788442584841',
    employee: {
      id: 'EMP-DUPLICATE-2',
      fullNameAr: 'سعد علي',
      civilId: '288010101234',
      email: 'saad@example.com',
      bankName: 'بنك الكويت الوطني',
      iban: 'KW81CBKU0000000000000000000002',
      basicSalary: 800,
      joinDate: '2026-09-10',
    },
    existingEmployees: [{
      id: 'EMP-DUPLICATE-1',
      companyId: 'comp-1788442584841',
      civilId: '288010101234',
      email: 'old@example.com',
      iban: 'KW81CBKU0000000000000000000003',
    }],
  });
}, EmployeeOnboardingValidationError);

await assert.rejects(() => addDirectEmployeeViaAi('comp-1788442584841', {
  nameAr: 'حسين علي',
  civilId: '288010101234',
  email: 'saad2@example.com',
  bankName: 'بنك الكويت الوطني',
  iban: 'KW81CBKU0000000000000000000004',
  basicSalary: 820,
  department: 'المالية',
  jobTitle: 'محاسب',
}, [{
  id: 'EMP-DUPLICATE-1',
  companyId: 'comp-1788442584841',
  civilId: '288010101234',
  email: 'old@example.com',
  iban: 'KW81CBKU0000000000000000000003',
}]), EmployeeOnboardingValidationError);

const parsed = parseEmployeeCreationPrompt('ضيف موظف اسمه أحمد الكندري رقم مدني 290010112345 ووظيفته محامي وراتبه 850');
assert.ok(parsed);
assert.equal(parsed?.nameAr?.includes('أحمد') || parsed?.nameEn?.includes('Ahmed') || false, true);
assert.equal(parsed?.civilId, '290010112345');
assert.equal(parsed?.basicSalary, '850');
assert.equal(shouldGenerateEmployeeAction('أضف موظف جديد'), true);

console.log('Onboarding state machine test passed');
