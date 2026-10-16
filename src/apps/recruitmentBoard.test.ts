import { describe, expect, it } from 'vitest';
import {
  attachmentAuditEvent,
  dropOnRecruitmentStage,
  hireStageDecision,
  recruitmentPageEmpty,
  recruitmentStageLabel,
  recruitmentStageTabs,
  stagesAreArabicOnly,
} from './recruitmentBoard';

describe('recruitment board', () => {
  it('uses five Arabic stage names and no stage tabs', () => {
    expect(stagesAreArabicOnly()).toBe(true);
    expect(recruitmentStageLabel('HIRED')).toBe('تم التعيين');
    expect(recruitmentStageTabs()).toEqual([]);
  });

  it('shows one empty page when there are no candidates', () => {
    expect(recruitmentPageEmpty(0)).toBe(true);
    expect(recruitmentPageEmpty(2)).toBe(false);
  });

  it('asks before تم التعيين and does not create an employee', () => {
    expect(dropOnRecruitmentStage('HIRED')).toBe('confirm-hire');
    expect(dropOnRecruitmentStage('INTERVIEW')).toBe('move');
    expect(hireStageDecision()).toEqual({ stage: 'HIRED', createEmployee: false });
  });

  it('logs view and download of an attachment', () => {
    expect(attachmentAuditEvent('view', 'att-1').action).toBe('view_sensitive');
    expect(attachmentAuditEvent('download', 'att-1').details).toBe('تنزيل مرفق متقدم');
  });
});
