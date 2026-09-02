const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for OdooDevMenu and remove DeveloperSuite
content = content.replace(
  "import DeveloperSuite from './components/DeveloperSuite';",
  "import { OdooDevMenu } from './components/OdooDevMenu';"
);

// 2. Change toggleDevMode to just toggle the state, without changing route
const oldToggle = `  const toggleDevMode = () => {
    if (!isDevMode) {
      setIsDevMode(true);
      setActiveTopApp('dev_tools');
      setActiveChildView('dev_console');
    } else {
      setIsDevMode(false);
      setActiveTopApp('hr');
      setActiveChildView('emp_list');
    }
  };`;

const newToggle = `  const toggleDevMode = () => {
    setIsDevMode(prev => !prev);
    // Setting dev mode to true adds the odoo-dev-mode class below which enables tooltips
  };`;

content = content.replace(oldToggle, newToggle);

// 3. Remove disableDevMode as it's no longer used
const oldDisable = `  const disableDevMode = () => {
    setIsDevMode(false);
    localStorage.removeItem('aysed_dev_mode');
    setActiveTopApp('hr');
    setActiveChildView('emp_list');
  };`;
content = content.replace(oldDisable, '');

// 4. Update the header button to OdooDevMenu
const oldHeaderBtns = `<button
            onClick={toggleDevMode}
            className={\`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer border \${
              isDevMode 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500' 
                : 'bg-slate-700 hover:bg-slate-800 text-slate-200 border-transparent'
            }\`}
            title="وضع المطور (Developer Mode)"
          >
            {isDevMode ? (
              <>
                <Bug size={14} className="text-white" />
                <span>إيقاف وضع المطور</span>
              </>
            ) : (
              <>
                <Wrench size={14} className="text-slate-300" />
                <span>تشغيل وضع المطور</span>
              </>
            )}
          </button>`;

content = content.replace(oldHeaderBtns, `<OdooDevMenu isDevMode={isDevMode} onToggleDevMode={toggleDevMode} />`);

// Remove DeveloperSuite from main
const oldDevConsoleRender = `{activeChildView === 'dev_console' && isDevMode && (
            <DeveloperSuite onDisableDevMode={() => {
              setIsDevMode(false);
              setActiveTopApp('hr');
              setActiveChildView('emp_list');
            }} />
          )}`;
content = content.replace(oldDevConsoleRender, '');
// If it was already using the older render we remove it too
content = content.replace("{activeChildView === 'dev_console' && isDevMode && <DeveloperSuite isDevMode={isDevMode} toggleDevMode={toggleDevMode} />}", '');
content = content.replace("{activeChildView === 'dev_console' && isDevMode && <DeveloperSuite onDisableDevMode={disableDevMode} />}", '');


// 5. Update main className to include dev mode class
const oldMain = `<main className="flex-1 p-6 overflow-y-auto print:p-0">`;
const newMain = `<main className={\`flex-1 p-6 overflow-y-auto print:p-0 \${isDevMode ? 'odoo-dev-mode-active' : ''}\`}>`;
content = content.replace(oldMain, newMain);

// 6. Fix handleTopAppSwitch which still manually disabled dev mode
const oldHandleSwitch = `  const handleTopAppSwitch = (appKey: any) => {
    setActiveTopApp(appKey);
    const firstChild = navigationTree[appKey].children[0].id;
    handleSelectView(firstChild);
    
    if (appKey === 'dev_tools') {
      setIsDevMode(true);
      localStorage.setItem('aysed_dev_mode', 'true');
    } else {
      setIsDevMode(false);
      localStorage.setItem('aysed_dev_mode', 'false');
    }
  };`;

const newHandleSwitch = `  const handleTopAppSwitch = (appKey: any) => {
    setActiveTopApp(appKey);
    const firstChild = navigationTree[appKey].children[0].id;
    handleSelectView(firstChild);
  };`;

content = content.replace(oldHandleSwitch, newHandleSwitch);

// Remove the dev_tools button from sidebar if any
const oldDevSidebarBtn = `<button
              onClick={() => handleTopAppSwitch('dev_tools')}
              className="w-full p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>⚙️ أدوات المطورين والتهيئة</span>
            </button>`;
content = content.replace(oldDevSidebarBtn, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx updated to Odoo standard dev mode');
