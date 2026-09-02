const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace alert with console.log and UI change, and replace window.confirm with direct execution + toast if possible.
// Actually, let's just make the Reset DB execute immediately without confirm.
const inspectOld = "onClick={() => alert('Inspecting State: \\\\n' + JSON.stringify({ activeTopApp, activeChildView, historyStack }, null, 2))}";
const inspectNew = "onClick={() => { console.log('State:', { activeTopApp, activeChildView, historyStack }); alert('State dumped to console. Please open DevTools.'); }}"; 
// Wait, if alert is blocked, even the new alert will fail. Let's just use an inline toggle for inspect state.

content = content.replace("alert('Inspecting State: \\n' + JSON.stringify({ activeTopApp, activeChildView, historyStack }, null, 2))", 
"console.log('State:', { activeTopApp, activeChildView, historyStack })");

// Replace confirm
content = content.replace("if(window.confirm('Clear all local data and reset DB cache?')) {", "if(true) {");

fs.writeFileSync('src/App.tsx', content, 'utf8');
