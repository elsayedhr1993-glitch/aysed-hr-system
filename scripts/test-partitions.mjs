/** Explicit split: node:test files run under tsx --test, vitest files under vitest. */

export const nodeTestFiles = [
  'server/security/phase1.security.test.ts',
  'server/security/phase2.audit.test.ts',
  'server/security/phase3.chat.test.ts',
  'server/security/phase4.studio.test.ts',
  'server/security/saasRoutes.auth.test.ts',
  'server/security/platformOwnerWrites.auth.test.ts',
  'scripts/companyIdAliasScan.test.ts',
  'src/context/OdooHierarchyContext.test.ts',
  'src/context/companyId.test.ts',
  'src/data/kuwaitPublicHolidays2026.test.ts',
  'src/services/companyLicenseSync.test.ts',
  'src/services/employeeDocumentArchiveSync.test.ts',
  'src/utils/companyIdAliases.test.ts',
  'src/utils/companyPrintProfile.test.ts',
  'src/utils/contractStatus.test.ts',
  'src/utils/contractTenantRules.test.ts',
  'src/utils/kuwaitPayrollEngine.test.ts',
  'src/utils/leaveEngine.carriedOver.test.ts',
  'src/utils/payrollLeaveEos.golden.test.ts',
  'src/utils/leaveModel.test.ts',
  'src/utils/ocrValidation.test.ts',
  'src/utils/tenantCompanyId.test.ts',
];

/** Top-level assert scripts. They are not node:test and not vitest. */
export const plainScriptTests = [
  'tests/aiContract.test.ts',
  'tests/aiCopilotNavigate.test.ts',
  'tests/copilotIntentRouter.test.ts',
  'tests/copilotLocalFaq.test.ts',
  'tests/onboardingStateMachine.test.ts',
];
