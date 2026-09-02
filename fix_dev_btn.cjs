const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetBtn = `          <button
            onClick={toggleDevMode}
            className={\`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer border \${isDevMode ? 'bg-purple-600 text-white border-purple-400' : 'bg-purple-900/40 text-purple-200 hover:bg-purple-800 border-transparent'}\`}
            title="وضع المطور (Developer Mode)"
          >
            <Wrench size={14} className={isDevMode ? "text-white" : "text-purple-300"} />
            <span className="hidden lg:inline">المطور</span>
          </button>`;

const newBtn = `          <button
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
                <span className="hidden lg:inline">إيقاف وضع المطور</span>
              </>
            ) : (
              <>
                <Wrench size={14} className="text-slate-300" />
                <span className="hidden lg:inline">تشغيل وضع المطور</span>
              </>
            )}
          </button>`;

if (content.includes(targetBtn)) {
  content = content.replace(targetBtn, newBtn);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx updated successfully.');
} else {
  console.log('Could not find target button block.');
}
