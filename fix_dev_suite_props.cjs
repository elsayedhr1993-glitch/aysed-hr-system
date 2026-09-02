const fs = require('fs');
let content = fs.readFileSync('src/components/DeveloperSuite.tsx', 'utf8');

// Replace props definition
content = content.replace(
  `interface DeveloperSuiteProps {
  onDisableDevMode: () => void;
}`,
  `interface DeveloperSuiteProps {
  isDevMode: boolean;
  toggleDevMode: () => void;
}`
);

// Replace component signature
content = content.replace(
  `export const DeveloperSuite: React.FC<DeveloperSuiteProps> = ({ onDisableDevMode }) => {`,
  `import { Wrench } from 'lucide-react';\n\nexport const DeveloperSuite: React.FC<DeveloperSuiteProps> = ({ isDevMode, toggleDevMode }) => {`
);

// Replace the button in the banner
const oldBannerBtn = `<button
            onClick={onDisableDevMode}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-orange-900 hover:bg-orange-50 rounded-xl text-xs font-black transition shadow-md cursor-pointer relative z-20 pointer-events-auto"
          >
            <Bug size={16} className="text-orange-600 rotate-45" />
            <span>إيقاف وضع المطور</span>
          </button>`;

const newBannerBtn = `<button
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

content = content.replace(oldBannerBtn, newBannerBtn);

fs.writeFileSync('src/components/DeveloperSuite.tsx', content, 'utf8');
console.log('Updated DeveloperSuite.tsx');
