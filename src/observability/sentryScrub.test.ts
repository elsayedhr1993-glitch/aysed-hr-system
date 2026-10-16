import { describe, expect, it } from 'vitest';
import { resolveSentryDsn, scrubSentryEvent, scrubSensitiveText } from './sentryScrub';

describe('sentry scrub', () => {
  it('treats a blank DSN as disabled', () => {
    expect(resolveSentryDsn(undefined)).toBe('');
    expect(resolveSentryDsn(null)).toBe('');
    expect(resolveSentryDsn('   ')).toBe('');
    expect(resolveSentryDsn(' https://example.ingest.sentry.io/1 ')).toBe(
      'https://example.ingest.sentry.io/1'
    );
  });

  it('hides civil id, passport, salary, and email before send', () => {
    const scrubbed = scrubSentryEvent({
      message: 'a@b.co civil 286010112345 passport AB123456 salary 450.500',
      user: { id: 'uid-1', email: 'person@example.com' },
      extra: {
        companyId: 'comp-1788442584841',
        civilId: '286010112345',
        passportNumber: 'A1234567',
        basicSalary: 520,
        note: 'جواز السفر K987654 بريد other@example.com',
      },
    });

    expect(scrubbed.message).toBe('[redacted] civil [redacted] passport [redacted] salary [redacted]');
    expect(scrubbed.user).toEqual({ id: 'uid-1', email: '[redacted]' });
    expect(scrubbed.extra).toEqual({
      companyId: 'comp-1788442584841',
      civilId: '[redacted]',
      passportNumber: '[redacted]',
      basicSalary: '[redacted]',
      note: 'جواز السفر [redacted] بريد [redacted]',
    });
  });

  it('keeps facility ids and ordinary text', () => {
    expect(scrubSensitiveText('facility comp-1788442584841 is open')).toBe(
      'facility comp-1788442584841 is open'
    );
  });
});
