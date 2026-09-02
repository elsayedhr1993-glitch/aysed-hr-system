const fs = require('fs');

const fixFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace("isHoliday ? 1.5 : 1.25", "isHoliday ? 2.0 : 1.25");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

fixFile('src/utils/kuwaitLaw.ts');
fixFile('src/utils/KuwaitLawEngine.ts');
fixFile('src/components/LeaveSettlementCalculator.tsx');
fixFile('src/services/leaveSettlementService.ts');
fixFile('src/types.ts');
