import fs from 'fs';

let leaveFile = 'src/components/OdooTimeOffApp.tsx';
let leaveContent = fs.readFileSync(leaveFile, 'utf8');

leaveContent = leaveContent.replace(
  /<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">/g,
  '<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs fade-slide-up">'
);
leaveContent = leaveContent.replace(
  /className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs cursor-pointer hover:border-purple-400 hover:shadow-md transition group relative overflow-hidden"/g,
  'className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs cursor-pointer hover:border-purple-400 hover:shadow-md transition group relative overflow-hidden fade-slide-up"'
);

fs.writeFileSync(leaveFile, leaveContent);
