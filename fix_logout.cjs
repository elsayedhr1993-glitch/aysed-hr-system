const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add LogOut to lucide-react imports
content = content.replace("Terminal\n} from 'lucide-react';", "Terminal,\n  LogOut\n} from 'lucide-react';");
if (!content.includes('LogOut')) {
    // If it didn't match the specific pattern
    content = content.replace("Terminal } from 'lucide-react';", "Terminal, LogOut } from 'lucide-react';");
}

// 2. Add useAuth to AuthContext import
content = content.replace("import { AuthProvider } from './context/AuthContext';", "import { AuthProvider, useAuth } from './context/AuthContext';");

// 3. Add useAuth() hook inside AppContent
content = content.replace("const { activeCompany } = useCompany();", "const { activeCompany } = useCompany();\n  const { logout } = useAuth();");

// 4. Add Logout Button next to CompanySwitcher
const companySwitcherStr = '<CompanySwitcher />';
const logoutBtn = `
            <CompanySwitcher />
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                  logout();
                  window.location.reload();
                }
              }}
              className="bg-rose-900/60 hover:bg-rose-700 text-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              title="تسجيل خروج"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>
`;

content = content.replace(
  '<CompanySwitcher />',
  logoutBtn
);

// Check if we also have an issue where it says class instead of className? (It should be className).
fs.writeFileSync('src/App.tsx', content, 'utf8');
