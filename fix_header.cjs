const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add KeyRound to lucide-react imports if not there
if (!content.includes('KeyRound')) {
  content = content.replace("LogOut", "LogOut,\n  KeyRound");
}

// 2. Add AdminSecurityModal import
if (!content.includes('AdminSecurityModal')) {
  content = content.replace("import { OdooLoginPage } from './components/OdooLoginPage';", "import { OdooLoginPage } from './components/OdooLoginPage';\nimport { AdminSecurityModal } from './components/AdminSecurityModal';");
}

// 3. Add modal state
if (!content.includes('showSecurityModal')) {
  content = content.replace("const [saveStatus, setSaveStatus] = useState<string | null>(null);", "const [saveStatus, setSaveStatus] = useState<string | null>(null);\n  const [showSecurityModal, setShowSecurityModal] = useState(false);");
}

// 4. Inject Button
const logoutBtnStr = `<button
              onClick={handleLogout}
              className="mt-1 w-full bg-rose-700/80 hover:bg-rose-800 text-white text-[11px] font-bold py-1 px-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-rose-600/50"
              title="تسجيل الخروج من النظام"
            >
              <LogOut size={13} />
              <span>خروج</span>
            </button>`;

const newButtons = `<div className="flex items-center gap-1 mt-1 w-full">
              <button
                onClick={() => setShowSecurityModal(true)}
                className="w-1/2 bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold py-1 px-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-slate-600"
                title="إعدادات الأمان (Security)"
              >
                <KeyRound size={13} />
                <span>أمان</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-1/2 bg-rose-700/80 hover:bg-rose-800 text-white text-[11px] font-bold py-1 px-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-rose-600/50"
                title="تسجيل الخروج من النظام"
              >
                <LogOut size={13} />
                <span>خروج</span>
              </button>
            </div>`;

if (content.includes(logoutBtnStr)) {
  content = content.replace(logoutBtnStr, newButtons);
}

// 5. Inject Modal Component
const modalStr = `<SystemIntegrityGuard />`;
const modalComponent = `<SystemIntegrityGuard />\n      <AdminSecurityModal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)} onLogout={handleLogout} />`;

if (content.includes(modalStr) && !content.includes('AdminSecurityModal isOpen')) {
  content = content.replace(modalStr, modalComponent);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
