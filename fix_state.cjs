const fs = require('fs');
let devSuite = fs.readFileSync('src/components/DeveloperSuite.tsx', 'utf8');

// Update DeveloperSuite props
devSuite = devSuite.replace(
  `interface DeveloperSuiteProps {
  isDevMode: boolean;
  toggleDevMode: () => void;
}`,
  `interface DeveloperSuiteProps {
  onDisableDevMode: () => void;
}`
);

devSuite = devSuite.replace(
  `export const DeveloperSuite: React.FC<DeveloperSuiteProps> = ({ isDevMode, toggleDevMode }) => {`,
  `export const DeveloperSuite: React.FC<DeveloperSuiteProps> = ({ onDisableDevMode }) => {`
);

const oldBannerBtn = `<button
            onClick={toggleDevMode}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition shadow-md cursor-pointer relative z-20 pointer-events-auto \${
              isDevMode 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500' 
                : 'bg-slate-700 hover:bg-slate-800 text-slate-200 border-transparent'
            }\`}
          >
            {isDevMode ? (
              <>
                <Bug size={16} className="text-white rotate-45" />
                <span>إيقاف وضع المطور</span>
              </>
            ) : (
              <>
                <Wrench size={16} className="text-slate-300" />
                <span>تشغيل وضع المطور</span>
              </>
            )}
          </button>`;

const newBannerBtn = `<button
            onClick={onDisableDevMode}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white border-rose-500 rounded-xl text-xs font-black transition shadow-md cursor-pointer relative z-20 pointer-events-auto"
          >
            <Bug size={16} className="text-white rotate-45" />
            <span>إيقاف وضع المطور</span>
          </button>`;

devSuite = devSuite.replace(oldBannerBtn, newBannerBtn);
fs.writeFileSync('src/components/DeveloperSuite.tsx', devSuite, 'utf8');


// Update App.tsx
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const oldToggle = `  const toggleDevMode = () => {
    const next = !isDevMode;
    if (next) {
      handleTopAppSwitch('dev_tools');
    } else {
      handleTopAppSwitch('hr');
    }
  };`;

const newToggle = `  const toggleDevMode = () => {
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

appTsx = appTsx.replace(oldToggle, newToggle);

const oldRender = `{activeChildView === 'dev_console' && isDevMode && <DeveloperSuite isDevMode={isDevMode} toggleDevMode={toggleDevMode} />}`;
const newRender = `{activeChildView === 'dev_console' && isDevMode && (
            <DeveloperSuite onDisableDevMode={() => {
              setIsDevMode(false);
              setActiveTopApp('hr');
              setActiveChildView('emp_list');
            }} />
          )}`;

appTsx = appTsx.replace(oldRender, newRender);

fs.writeFileSync('src/App.tsx', appTsx, 'utf8');
console.log('Fixed State logic');
