/** Redacted admin bundle for employee summarize mode (sent to /api/ai-chat). */

function maskCivil(id?: string): string {
  const digits = String(id || '').replace(/\D/g, '');
  if (digits.length < 4) return '—';
  return `***${digits.slice(-4)}`;
}

function clip(text: unknown, max = 280): string {
  const s = String(text ?? '').trim();
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function buildEmployeeAdminSummaryBundle(input: {
  employee: Record<string, unknown>;
  leaveRequests?: Array<Record<string, unknown>>;
  leaveAllocations?: Array<Record<string, unknown>>;
  commencementRecord?: Record<string, unknown> | null;
}): string {
  const emp = input.employee;
  const name = String(emp.nameAr || emp.fullNameAr || emp.name || 'موظف');
  const lines: string[] = [
    `الموظف: ${name}`,
    `المعرف: ${String(emp.id || '')}`,
    `المسمى: ${clip(emp.jobTitle, 120) || '—'}`,
    `القسم: ${clip(emp.department || emp.dept, 80) || '—'}`,
    `الحالة: ${clip(emp.status, 60) || '—'}`,
    `تاريخ التعيين: ${clip(emp.joinDate || emp.hireDate, 20) || '—'}`,
    `الرقم المدني (مقنّع): ${maskCivil(String(emp.civilId || ''))}`,
  ];

  const notes = clip(emp.notes, 500);
  if (notes) lines.push(`ملاحظات إدارية: ${notes}`);

  const chatter = Array.isArray(emp.chatter) ? emp.chatter : [];
  if (chatter.length > 0) {
    lines.push('سجل المراسلات (آخر 8):');
    chatter.slice(-8).forEach((c: any, i: number) => {
      lines.push(
        `  ${i + 1}. [${clip(c.date || c.createdAt, 24)}] ${clip(c.user, 40)}: ${clip(c.text || c.message, 200)}`
      );
    });
  }

  const leaves = input.leaveRequests || [];
  if (leaves.length > 0) {
    lines.push(`طلبات الإجازة (${leaves.length} — آخر 10):`);
    leaves.slice(0, 10).forEach((r, i) => {
      lines.push(
        `  ${i + 1}. ${clip(r.startDate, 12)}→${clip(r.endDate, 12)} | ${clip(r.leaveType, 20)} | ${clip(r.status, 20)} | ${clip(r.reason, 100)}`
      );
    });
  }

  const alloc = input.leaveAllocations || [];
  if (alloc.length > 0) {
    lines.push(`تخصيصات الإجازة (${alloc.length}):`);
    alloc.slice(0, 6).forEach((a, i) => {
      lines.push(
        `  ${i + 1}. ${clip(a.allocationType || a.type, 20)} أيام=${a.numberOfDays ?? a.days ?? '—'} متبقي=${a.remainingDays ?? '—'}`
      );
    });
  }

  const comm = input.commencementRecord;
  if (comm) {
    lines.push(
      `مباشرة العمل: ${clip(comm.commencementDate || comm.startDate, 20)} — ${clip(comm.status, 30)}`
    );
  }

  return lines.join('\n');
}
