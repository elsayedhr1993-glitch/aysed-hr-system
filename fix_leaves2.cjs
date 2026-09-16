const fs = require('fs');
let c = fs.readFileSync('src/components/LeavesView.tsx', 'utf8');

c = c.replace(
  /<div>\s*<label className="block text-sm font-semibold text-gray-700 mb-1">濙"潨隨濙\. 濙"\.濟"隵濝澑:<\/label>\s*<input\s*type="number"\s*min="1"\s*max=\{currentEmp\?\.remaining_leaves \|\| 100\}\s*value=\{requestedDays\}\s*onChange=\{\(e\) => setRequestedDays\(Number\(e\.target\.value\)\)\}\s*className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"\s*\/>\s*<\/div>/,
  `<div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">تاريخ النهاية:</label>
    <input
      type="date"
      min={startDate}
      max="2027-12-31"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
    />
  </div>
  <div className="col-span-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center">
    <span className="text-sm font-semibold text-indigo-800">أيام العمل الفعلية (بدون الجُمَع):</span>
    <span className="font-bold text-lg text-indigo-700">{requestedDays} أيام</span>
  </div>`
);

fs.writeFileSync('src/components/LeavesView.tsx', c);
