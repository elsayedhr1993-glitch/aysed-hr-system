const REDACTED = '[redacted]';

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const CIVIL_ID = /\b\d{12}\b/g;
const PASSPORT_INLINE =
  /((?:passport(?:\s*(?:no|number|num))?|جواز(?:\s*السفر)?))\s*[:#=\-]?\s*[A-Za-z0-9]{5,15}/gi;
const SALARY_INLINE =
  /((?:basic\s*salary|gross\s*salary|net\s*salary|daily\s*wage|hourly\s*wage|salary|راتب(?:\s*أساسي)?|الأجر|الاجر))\s*[:#=\-]?\s*-?\d[\d,]*(?:\.\d+)?/gi;

const SENSITIVE_KEY =
  /email|civilid|nationalid|passport|salary|wage|allowance|deduction|payroll|gratuity|eosamount|grosseos|neteos|leavepayout|totalsettlement|payslip|iban/;

/** Blank DSN disables Sentry. Whitespace is treated as blank. */
export function resolveSentryDsn(value: string | undefined | null): string {
  return String(value ?? '').trim();
}

export function isSensitiveFieldName(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[\s_-]/g, '');
  return SENSITIVE_KEY.test(normalized);
}

export function scrubSensitiveText(value: string): string {
  return value
    .replace(EMAIL, REDACTED)
    .replace(PASSPORT_INLINE, `$1 ${REDACTED}`)
    .replace(SALARY_INLINE, `$1 ${REDACTED}`)
    .replace(CIVIL_ID, REDACTED);
}

export function scrubSentryEvent<T>(event: T): T {
  return scrubValue(event, undefined, new WeakSet()) as T;
}

function scrubValue(value: unknown, key: string | undefined, seen: WeakSet<object>): unknown {
  if (key && isSensitiveFieldName(key)) return REDACTED;
  if (typeof value === 'string') return scrubSensitiveText(value);
  if (typeof value !== 'object' || value === null) return value;
  if (value instanceof Date) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, undefined, seen));
  const out: Record<string, unknown> = {};
  for (const [childKey, child] of Object.entries(value)) {
    out[childKey] = scrubValue(child, childKey, seen);
  }
  return out;
}
