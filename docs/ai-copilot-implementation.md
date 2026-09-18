# AI Copilot — خطة تنفيذ P0 + P1

## الهدف
مساعد واحد (`AysedAICopilot`) مع سياق شركة مجمّع وآمن، نماذج موحّدة، إجراءات JSON حقيقية، وإزالة الردود/النتائج الوهمية.

## المراحل

| خطوة | الملفات | النتيجة |
|------|---------|---------|
| 1 | `src/config/aiConfig.ts`, `src/lib/aiCopilotTypes.ts`, `src/lib/aiCopilotContext.ts`, `src/lib/aiCopilotActions.ts`, `src/lib/pamContractAudit.ts` | عقد مشترك بين العميل والخادم |
| 2 | `server/aiChat.ts` | `/api/ai-chat` مع Gemini JSON + تحقق شركة + بدون simulated success |
| 3 | `server.ts` | استيراد النماذج من `aiConfig` لـ OCR و test-key |
| 4 | `src/components/AysedAICopilot.tsx`, `src/App.tsx` | سياق، مصدر الرد، `companyId`، إجراءات كاملة |
| 5 | `src/components/LegalDocumentBotModal.tsx` | تدقيق PAM حقيقي مقابل سجلات Firestore المحلية |
| 6 | حذف `src/apps/AICopilotApp.tsx` | إزالة مساعد مكرر |
| 7 | `DataPayrollAnalystBotModal`, `ComplianceSmartSentinelModal` | تسمية صادقة (بدون تسويق AI وهمي) |

## إجراءات المساعد المدعومة
`NAVIGATE`, `OPEN_MODAL`, `TRIGGER_FUNCTION`, `CREATE_EMPLOYEE`, `OPEN_CALCULATOR`

## أمان السياق
- لا تُرسل قائمة أسماء/رواتب كاملة افتراضياً — ملخص إحصائي فقط.
- `companyId` في الطلب يُقارَن مع JWT/Firestore `users` (غير السوبر أدمن).
