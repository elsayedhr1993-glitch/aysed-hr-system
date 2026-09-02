const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Wrench, Bug, SearchCode, RefreshCw to lucide imports
if (!content.includes('Wrench')) {
  content = content.replace("KeyRound", "KeyRound,\n  Wrench,\n  Bug,\n  SearchCode,\n  RefreshCw");
}

// 2. Destructure companies and switchCompany
content = content.replace("const { activeCompany } = useCompany();", "const { activeCompany, companies, switchCompany } = useCompany();");

// 3. Add dev mode state and toggle
const devStateCode = `  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    return localStorage.getItem('aysed_dev_mode') === 'true';
  });

  const toggleDevMode = () => {
    setIsDevMode((prev) => {
      const next = !prev;
      localStorage.setItem('aysed_dev_mode', String(next));
      return next;
    });
  };`;

if (!content.includes('const [isDevMode')) {
  content = content.replace("const [showSecurityModal, setShowSecurityModal] = useState(false);", "const [showSecurityModal, setShowSecurityModal] = useState(false);\n" + devStateCode);
}

// 4. Inject Dev Mode Button in Header
const aiScannerBtnStr = `<button
            onClick={() => setShowScanner(true)}
            className="bg-purple-900/60 hover:bg-purple-900 text-amber-200 border border-purple-400/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Scan size={14} className="text-amber-300" />
            <span>الماسح الضوئي AI</span>
          </button>`;

const aiAndDevBtns = `<button
            onClick={toggleDevMode}
            className={\`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer border \${isDevMode ? 'bg-purple-600 text-white border-purple-400' : 'bg-purple-900/40 text-purple-200 hover:bg-purple-800 border-transparent'}\`}
            title="وضع المطور (Developer Mode)"
          >
            <Wrench size={14} className={isDevMode ? "text-white" : "text-purple-300"} />
            <span className="hidden lg:inline">المطور</span>
          </button>
          
          <button
            onClick={() => setShowScanner(true)}
            className="bg-purple-900/60 hover:bg-purple-900 text-amber-200 border border-purple-400/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Scan size={14} className="text-amber-300" />
            <span>الماسح الضوئي AI</span>
          </button>`;

if (content.includes(aiScannerBtnStr)) {
  content = content.replace(aiScannerBtnStr, aiAndDevBtns);
}

// 5. Inject Dev Toolbar below header
const devToolbarStr = `{isDevMode && (
        <div className="bg-purple-950 text-white px-4 py-2 flex items-center justify-between text-[11px] font-mono border-b border-purple-800 shadow-inner z-30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-purple-200 bg-purple-900 px-2 py-1 rounded">
              <Bug size={14} className="text-amber-400" />
              Developer Mode Active
            </span>
            <div className="h-4 w-px bg-purple-700"></div>
            <button 
              onClick={() => alert('Inspecting State: \\n' + JSON.stringify({ activeTopApp, activeChildView, historyStack }, null, 2))}
              className="flex items-center gap-1.5 hover:text-amber-300 transition cursor-pointer bg-purple-800 hover:bg-purple-700 px-2 py-1 rounded"
            >
              <SearchCode size={13} />
              Inspect State
            </button>
            <button 
              onClick={() => {
                if(window.confirm('Clear all local data and reset DB cache?')) {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }
              }}
              className="flex items-center gap-1.5 hover:text-rose-300 transition cursor-pointer bg-purple-800 hover:bg-purple-700 px-2 py-1 rounded"
            >
              <RefreshCw size={13} />
              Reset DB/Cache
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-300">Quick Switch:</span>
            <select 
              className="bg-purple-800 border border-purple-700 text-white rounded px-2 py-0.5 outline-none focus:border-amber-400 cursor-pointer"
              value={activeCompany.id}
              onChange={(e) => switchCompany(e.target.value)}
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.nameEn || c.nameAr}</option>
              ))}
            </select>
          </div>
        </div>
      )}`;

if (!content.includes('Developer Mode Active')) {
  content = content.replace("</header>", "</header>\n\n      {/* DEV TOOLBAR */}\n      " + devToolbarStr);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
