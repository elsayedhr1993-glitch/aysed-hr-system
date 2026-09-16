const fs = require('fs');
let c = fs.readFileSync('src/components/LeavesView.tsx', 'utf8');
c = c.replace(
  /import \{ Calendar, User, CheckCircle2, Clock, Plus, ShieldCheck \} from 'lucide-react';/,
  "import { Calendar, User, CheckCircle2, Clock, Plus, ShieldCheck } from 'lucide-react';\nimport { LeaveSettlementModal } from './LeaveSettlementModal';"
);
c = c.replace(
  /const \[isSubmitting, setIsSubmitting\] = useState<boolean>\(false\);/,
  "const [isSubmitting, setIsSubmitting] = useState<boolean>(false);\n  const [showSettlementModal, setShowSettlementModal] = useState(false);"
);
c = c.replace(
  /<\/button>\r?\n        <\/div>\r?\n      <\/div>\r?\n    <\/div>\);/,
  "</button>\n          <button onClick={() => setShowSettlementModal(true)} type=\"button\" className=\"w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all\">\n            حاسبة تسوية الإجازات\n          </button>\n        </div>\n      </div>\n      {showSettlementModal && (\n        <LeaveSettlementModal\n          employee={currentEmp}\n          onClose={() => setShowSettlementModal(false)}\n        />\n      )}\n    </div>);"
);
fs.writeFileSync('src/components/LeavesView.tsx', c);
