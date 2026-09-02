const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. We will add the custom handleLogout function inside AppContent
const oldLogoutBlock = `  const { user, login, logout } = useAuth();
  const { employees } = useOdooHierarchy();`;

const newLogoutBlock = `  const { user, login, logout } = useAuth();
  const { employees } = useOdooHierarchy();

  // دالة تسجيل الخروج الفعلي بنمط أودو
  const handleLogout = () => {
    if (!window.confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    
    // مسح بيانات جلسة المستخدم
    localStorage.removeItem('aysed_hr_auth');
    localStorage.removeItem('current_user');
    sessionStorage.clear();
    
    // استدعاء دالة الخروج من AuthContext
    logout();
  };`;

content = content.replace(oldLogoutBlock, newLogoutBlock);

// 2. We will replace the existing logout button with the user's requested button
const oldButton = `<button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                  logout();
                  
                }
              }}
              className="bg-rose-900/60 hover:bg-rose-700 text-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              title="تسجيل خروج"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>`;

const newButton = `<button
              onClick={handleLogout}
              className="mt-1 w-full bg-rose-700/80 hover:bg-rose-800 text-white text-[11px] font-bold py-1 px-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-rose-600/50"
              title="تسجيل الخروج من النظام"
            >
              <LogOut size={13} />
              <span>خروج</span>
            </button>`;

content = content.replace(oldButton, newButton);

// Also make the container flex-col so the button appears below the CompanySwitcher properly
content = content.replace(
  `<div className="shrink-0 text-slate-950">
            
            <CompanySwitcher />`,
  `<div className="shrink-0 text-slate-950 flex flex-col items-center">
            
            <CompanySwitcher />`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
