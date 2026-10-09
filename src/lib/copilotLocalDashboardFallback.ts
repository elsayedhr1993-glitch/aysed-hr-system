import { extractComplianceToolContext, wantsComplianceSemantic } from './copilotIntentRouter';
import { tryLocalFaqAnswer, parseEmployeeStatsFromContextSummary } from './copilotLocalFaq';

export type LocalDashboardFallbackInput = {
  promptText: string;
  contextSummary: unknown;
  isArabic: boolean;
  fetchEmployeeStats: () => Promise<{ reply: string } | null>;
  fetchComplianceGaps: (filters: ReturnType<typeof extractComplianceToolContext>) => Promise<{ reply: string } | null>;
};

/**
 * User-facing summary when Gemini is unavailable — never expose raw AI_UNAVAILABLE.
 */
export async function buildLocalDashboardFallbackReply(
  input: LocalDashboardFallbackInput
): Promise<string | null> {
  const { promptText, contextSummary, isArabic, fetchEmployeeStats, fetchComplianceGaps } = input;
  const blocks: string[] = [];

  if (isArabic) {
    blocks.push(
      '**ملخص تشغيلي من بيانات المنظومة**\n_تم توليد الإجابة من أدوات النظام المحلية دون الاعتماد على Gemini._'
    );
  } else {
    blocks.push(
      '**Operational summary from tenant data**\n_Generated via local system tools without Gemini._'
    );
  }

  if (wantsComplianceSemantic(promptText)) {
    const compliance = await fetchComplianceGaps(extractComplianceToolContext(promptText));
    if (compliance?.reply) return compliance.reply;
  }

  const stats = await fetchEmployeeStats();
  if (stats?.reply) blocks.push(stats.reply);

  const complianceAll = await fetchComplianceGaps({});
  if (complianceAll?.reply) {
    const short = complianceAll.reply.split('\n').slice(0, 14).join('\n');
    blocks.push(short);
  }

  const faqStats = parseEmployeeStatsFromContextSummary(String(contextSummary || ''));
  const faq = tryLocalFaqAnswer(promptText, faqStats, isArabic);
  if (faq) blocks.push(faq);

  const ctx = String(contextSummary || '').trim();
  if (ctx && blocks.length < 3) {
    blocks.push(ctx.slice(0, 1400));
  }

  if (blocks.length <= 1) {
    return isArabic
      ? 'المساعد الذكي الخارجي غير متاح حالياً. جرّب أوامر مثل: «كم موظف عندي»، «هل يوجد نواقص في ملفات الموظفين»، أو «افتح تطبيق الإجازات».'
      : 'External AI is unavailable. Try: employee count, compliance gaps scan, or navigation commands.';
  }

  return blocks.join('\n\n');
}
