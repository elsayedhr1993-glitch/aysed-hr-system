import fs from 'fs';

let commFile = 'src/apps/CommencementApp.tsx';
let commContent = fs.readFileSync(commFile, 'utf8');

commContent = commContent.replace(
  /setActualJoiningDate\(new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);/g,
  "setActualJoiningDate(defaultEmp?.joinDate || new Date().toISOString().split('T')[0]);"
);
commContent = commContent.replace(
  /const \[actualJoiningDate, setActualJoiningDate\] = useState<string>\(new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);/g,
  "const [actualJoiningDate, setActualJoiningDate] = useState<string>('');"
);

fs.writeFileSync(commFile, commContent);
