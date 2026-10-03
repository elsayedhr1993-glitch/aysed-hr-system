import fs from 'fs';
import path from 'path';

const files = [
  'src/components/employees/tabs/EmployeeWorkTab.tsx',
  'src/components/employees/tabs/EmployeePrivateTab.tsx',
  'src/components/employees/tabs/EmployeeHRTab.tsx',
  'src/components/employees/tabs/EmployeeDocumentsTab.tsx',
];

const root = path.resolve('.');

function patchFile(rel) {
  const filePath = path.join(root, rel);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = 0;

  content = content.replace(
    /<EditableField(\s+)/g,
    (match, ws, offset, whole) => {
      const slice = whole.slice(offset, offset + 1200);
      if (slice.includes('studioFieldKey=')) return match;
      const m = slice.match(/handleFieldChange\(\s*['"]([^'"]+)['"]/);
      if (!m) return match;
      changed++;
      return `<EditableField\n            studioFieldKey="${m[1]}"${ws}`;
    }
  );

  content = content.replace(
    /<EditableSelect(\s+)/g,
    (match, ws, offset, whole) => {
      const slice = whole.slice(offset, offset + 800);
      if (slice.includes('studioFieldKey=')) return match;
      const m = slice.match(/handleFieldChange\(\s*['"]([^'"]+)['"]/);
      if (!m) return match;
      changed++;
      return `<EditableSelect\n            studioFieldKey="${m[1]}"${ws}`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(rel, 'patched fields:', changed);
}

for (const f of files) patchFile(f);
