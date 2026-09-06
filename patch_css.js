import fs from 'fs';

// 1. Patch Scanner Modal
let empFile = 'src/components/OdooEmployeesDirectoryApp.tsx';
let empContent = fs.readFileSync(empFile, 'utf8');

empContent = empContent.replace(
  /<div className="w-16 h-16 rounded-3xl bg-purple-50 text-\[\#714B67\] border-2 border-purple-200 flex items-center justify-center mx-auto animate-spin">/,
  '<div className="w-16 h-16 rounded-3xl bg-purple-50 text-[#714B67] border-2 border-purple-200 flex items-center justify-center mx-auto animate-spin relative overflow-hidden">\n                    <div className="laser-scanner-line" />'
);

fs.writeFileSync(empFile, empContent);

// 2. Patch Leave Balance Card
let leaveFile = 'src/components/OdooTimeOffApp.tsx';
let leaveContent = fs.readFileSync(leaveFile, 'utf8');

leaveContent = leaveContent.replace(
  /<div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50\/70 border border-emerald-200\/80 rounded-xl mt-2.5 shadow-2xs space-y-2">/,
  '<div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/80 rounded-xl mt-2.5 shadow-2xs space-y-2 fade-slide-up">'
);

fs.writeFileSync(leaveFile, leaveContent);
