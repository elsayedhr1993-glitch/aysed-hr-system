const fs = require('fs');
let code = fs.readFileSync('src/components/OdooChatter.tsx', 'utf8');

if (!code.includes('activityDetails?')) {
  // Add activityDetails to ChatterMessage
  code = code.replace(
    /type: 'message' \| 'note' \| 'tracking' \| 'activity';\n\s*trackingChanges\?: \{ field: string; oldValue: string; newValue: string \}\[\];/g,
    `type: 'message' | 'note' | 'tracking' | 'activity';\n  trackingChanges?: { field: string; oldValue: string; newValue: string }[];\n  activityDetails?: {\n    type: string;\n    assignee: string;\n    dueDate: string;\n    status: 'green' | 'yellow' | 'red';\n    statusText: string;\n  };`
  );

  // Update activity rendering
  const oldActivityRender = `{msg.type === 'activity' && (
                  <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1 text-blue-700 font-bold">
                      <CalendarIcon size={14} />
                      نشاط مجدول
                    </div>
                    <p className="text-slate-700">{msg.content}</p>
                  </div>
                )}`;
                
  const newActivityRender = `{msg.type === 'activity' && (
                  <div className="text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <CalendarIcon size={16} className="text-[#714B67]" />
                        {msg.activityDetails?.type || 'نشاط مجدول'}
                      </div>
                      {msg.activityDetails && (
                        <div className={\`px-2 py-1 rounded-md text-xs font-bold \${
                          msg.activityDetails.status === 'green' ? 'bg-emerald-100 text-emerald-700' :
                          msg.activityDetails.status === 'yellow' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }\`}>
                          {msg.activityDetails.statusText}
                        </div>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium mb-3">{msg.content}</p>
                    {msg.activityDetails && (
                      <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
                        <div className="flex items-center gap-1.5">
                          <User size={14} />
                          <span>المسؤول: <strong>{msg.activityDetails.assignee}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>تاريخ الاستحقاق: <strong>{msg.activityDetails.dueDate}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )}`;

  code = code.replace(oldActivityRender, newActivityRender);
  fs.writeFileSync('src/components/OdooChatter.tsx', code, 'utf8');
  console.log("Patched OdooChatter.tsx successfully");
} else {
  console.log("Already patched");
}
