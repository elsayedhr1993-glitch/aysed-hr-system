/**
 * Quick check: Arabic shaping + bidi for PAM pdf-lib strings.
 * Usage: npx tsx scripts/verify-pam-arabic-text.ts
 */
import { preparePdfText } from '../src/services/pamContractPdfService.ts';

const samples = [
  'ريميا ماناليل ماثيو',
  'مساعد تمريض عام',
  'مادة 18 - قطاع أهلي',
  'باللغتين العربية والإنجليزية',
  '283102704941',
];

for (const s of samples) {
  console.log('IN :', s);
  console.log('OUT:', preparePdfText(s));
  console.log('---');
}
