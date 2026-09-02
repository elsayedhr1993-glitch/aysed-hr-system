const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Swap imports
content = content.replace(
  "import { OdooLogin } from './components/OdooLogin';", 
  "import { OdooLoginPage } from './components/OdooLoginPage';"
);

// 2. Change the beginning of AppContent
const oldAppContentStart = `export const AppContent: React.FC = () => {
  const { activeCompany } = useCompany();
  const { user, login, logout } = useAuth();
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
  };

  const [activeTopApp, setActiveTopApp] = useState<'hr' | 'attendance' | 'payroll' | 'reports' | 'docs' | 'templates' | 'dev_tools'>('hr');
  const [activeChildView, setActiveChildView] = useState<string>('emp_list');
  const [historyStack, setHistoryStack] = useState<string[]>(['emp_list']);
  const [kuwaitTime, setKuwaitTime] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!user) {
    return (
      <OdooLogin onLogin={(email, companyId, role) => {
        login('token_active_' + Date.now(), { id: 1, name: email.split('@')[0], email, role: role || 'admin' });
      }} />
    );
  }`;

const newAppContentStart = `export const AppContent: React.FC = () => {
  const { activeCompany } = useCompany();
  const { user, login, logout } = useAuth();
  const { employees } = useOdooHierarchy();

  // حالة تسجيل الدخول
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aysed_hr_auth') === 'true';
  });

  // دالة تسجيل الخروج الفعلي بنمط أودو
  const handleLogout = () => {
    if (!window.confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    
    // مسح بيانات جلسة المستخدم
    localStorage.removeItem('aysed_hr_auth');
    localStorage.removeItem('current_user');
    sessionStorage.clear();
    
    // تحديث الحالة للعودة لشاشة الدخول
    setIsAuthenticated(false);
    
    // استدعاء دالة الخروج من AuthContext
    logout();
  };

  const [activeTopApp, setActiveTopApp] = useState<'hr' | 'attendance' | 'payroll' | 'reports' | 'docs' | 'templates' | 'dev_tools'>('hr');
  const [activeChildView, setActiveChildView] = useState<string>('emp_list');
  const [historyStack, setHistoryStack] = useState<string[]>(['emp_list']);
  const [kuwaitTime, setKuwaitTime] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <OdooLoginPage onLoginSuccess={() => {
      setIsAuthenticated(true);
      login('token_active_' + Date.now(), { id: 1, name: 'Admin', email: 'admin@almanar-clinic.com', role: 'admin' });
    }} />;
  }`;

content = content.replace(oldAppContentStart, newAppContentStart);

fs.writeFileSync('src/App.tsx', content, 'utf8');
