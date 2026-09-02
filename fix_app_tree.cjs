const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const additionalNav = `,
    timesheets: {
      parentTitle: 'الحضور والبصمة',
      children: [
        { id: 'attendance_log', label: 'سجلات الحضور', icon: Clock }
      ]
    },
    planning: {
      parentTitle: 'تخطيط الشفتات',
      children: [
        { id: 'shifts_planning', label: 'جدولة الشفتات', icon: Calendar }
      ]
    },
    custody: {
      parentTitle: 'العهد والسلف',
      children: [
        { id: 'operations_all', label: 'إدارة العهد والسلف', icon: Briefcase }
      ]
    }`;

if (!content.includes('timesheets: {')) {
  content = content.replace(
    /docs: \{\s*parentTitle: 'مستندات المؤسسة',\s*children: \[\s*\{\s*id: 'company_archive', label: 'أرشيف التراخيص والعقود الرسمية', icon: FolderKanban\s*\}\s*\]\s*\}/g,
    `docs: {
      parentTitle: 'مستندات المؤسسة',
      children: [
        { id: 'company_archive', label: 'أرشيف التراخيص والعقود الرسمية', icon: FolderKanban }
      ]
    }${additionalNav}`
  );
}

// Ensure types are updated if activeTopApp is strictly typed
// const [activeTopApp, setActiveTopApp] = useState<'hr' | 'attendance' | 'payroll' | 'reports' | 'docs' | 'templates'>('hr');
content = content.replace(
  `useState<'hr' | 'attendance' | 'payroll' | 'reports' | 'docs' | 'templates'>`,
  `useState<string>`
);

// Add missing icon imports
if (!content.includes('LayoutGrid')) {
  content = content.replace(
    `import {\n  Users,`,
    `import {\n  Users,\n  LayoutGrid,\n  Calendar,\n  Briefcase,\n  Clock,`
  );
}

// Add state for app switcher
if (!content.includes('showAppSwitcher')) {
  content = content.replace(
    `const [isDevMode, setIsDevMode] = useState<boolean>(false);`,
    `const [isDevMode, setIsDevMode] = useState<boolean>(false);\n  const [showAppSwitcher, setShowAppSwitcher] = useState<boolean>(false);`
  );
}

// Replace header nav
const oldHeaderRegex = /<div className="flex items-center gap-5 overflow-x-auto no-scrollbar">[\s\S]*?<\/nav>\n\s*<\/div>/;
const newHeader = `<div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 font-black text-sm tracking-wide shrink-0">
            <button onClick={() => setShowAppSwitcher(!showAppSwitcher)} className="p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer text-white">
              <LayoutGrid size={18} />
            </button>
            <span className="p-1 bg-white/10 rounded-lg">⚙️</span>
            <span>Aysed S HR</span>
          </div>

          {!showAppSwitcher && (
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-4">
              <div className="font-bold text-sm ml-4 border-l border-white/20 pl-4">{navigationTree[activeTopApp]?.parentTitle}</div>
              {navigationTree[activeTopApp]?.children.map((child) => {
                const Icon = child.icon;
                const isSelected = activeChildView === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => handleSelectView(child.id)}
                    className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer \${
                      isSelected ? 'bg-white/20 text-white shadow-xs' : 'text-purple-100 hover:bg-white/10'
                    }\`}
                  >
                    <Icon size={13} />
                    <span>{child.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>`;

content = content.replace(oldHeaderRegex, newHeader);

// Hide sidebar
const oldSidebar = `<aside className="w-64 bg-white border-l border-slate-200 p-4 shrink-0 flex flex-col justify-between hidden md:flex print:hidden">`;
const newSidebar = `<aside className="w-64 bg-white border-l border-slate-200 p-4 shrink-0 flex flex-col justify-between hidden print:hidden"> {/* Hidden sidebar for Odoo Top Nav UX */}`;
content = content.replace(oldSidebar, newSidebar);

// Integrate AppSwitcher
const oldReturn = `<div className="min-h-screen bg-slate-100 flex flex-col font-sans dir-rtl text-right text-slate-800" dir="rtl">`;
const newReturn = `<div className="min-h-screen bg-slate-100 flex flex-col font-sans dir-rtl text-right text-slate-800" dir="rtl">\n      {showAppSwitcher && <OdooAppSwitcher onSelectApp={(id) => { handleTopAppSwitch(id); setShowAppSwitcher(false); }} />}`;
content = content.replace(oldReturn, newReturn);


// Add OdooAppSwitcher import
if (!content.includes('OdooAppSwitcher')) {
  content = content.replace(
    `import { OdooDevMenu } from './components/OdooDevMenu';`,
    `import { OdooDevMenu } from './components/OdooDevMenu';\nimport { OdooAppSwitcher } from './components/OdooAppSwitcher';`
  );
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Done refactoring');
