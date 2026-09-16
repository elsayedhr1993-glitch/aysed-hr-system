const fs = require('fs');
let content = fs.readFileSync('src/components/OdooEmployeesDirectoryApp.tsx', 'utf8');

// Container
content = content.replace(
  /<div className="border-b border-slate-200 bg-slate-50\/60 flex gap-2 px-6 overflow-x-auto">/g, 
  '<div className="flex overflow-x-auto hide-scrollbar gap-1 bg-slate-50 p-1.5 mx-6 mt-4 rounded-xl border border-slate-200/60">'
);

// Buttons
content = content.replace(
  /className={`py-3\.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap \${[\s\S]*?}`}/g,
  'className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap duration-200 flex-shrink-0 ${ activeFormTab === tab.id ? \'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50\' : \'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50\' }`}'
);

fs.writeFileSync('src/components/OdooEmployeesDirectoryApp.tsx', content, 'utf8');
console.log('Fixed');
