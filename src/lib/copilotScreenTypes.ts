/** Screen context sent to /api/ai-chat (no full PII by default). */
export interface CopilotScreenDescriptor {
  model: string;
  view: string;
  tab?: string;
  entityType?: string;
  entityId?: string;
  filters?: Record<string, string | number | boolean | null | undefined>;
}

export function formatCopilotScreenForPrompt(
  activeApp?: string,
  screen?: CopilotScreenDescriptor | null,
  screenSummary?: string
): string {
  const lines: string[] = [];
  if (activeApp) lines.push(`التطبيق النشط (activeApp): ${activeApp}`);
  if (screen) {
    lines.push(`الشاشة (screen): model=${screen.model}, view=${screen.view}`);
    if (screen.tab) lines.push(`  tab: ${screen.tab}`);
    if (screen.entityType && screen.entityId) {
      lines.push(`  كيان: ${screen.entityType} / ${screen.entityId}`);
    }
    if (screen.filters && Object.keys(screen.filters).length > 0) {
      lines.push(`  فلاتر: ${JSON.stringify(screen.filters)}`);
    }
  }
  if (screenSummary?.trim()) lines.push(`ملخص الشاشة: ${screenSummary.trim()}`);
  return lines.length ? lines.join('\n') : 'لا يوجد سياق شاشة محدد.';
}
