const fs = require('fs');
let content = fs.readFileSync('./src/components/employees/tabs/EmployeeDocumentsTab.tsx', 'utf8');

const imports = "import { Camera, FileText, CheckCircle2, Shield, Upload, X, ZoomIn, Search, FileSignature, Folder, FolderOpen, RefreshCw, ZoomOut, FolderArchive, Plus, CheckSquare, Square, FileCheck, Eye, Download, Trash2 } from 'lucide-react';";

content = content.replace(/import \{ Camera,.*?\} from 'lucide-react';/, imports);

const logic = `
  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
    employee.jobTitle?.includes('طبيب') || employee.jobTitle?.includes('ممرض');
    
  const requiredChecklist: Record<string, boolean> = {
    civilIdScan: true,
    passportScan: true,
    pamWorkPermit: true,
    mohLicense: isMedicalStaff || (employee.dept || employee.department) === 'الأطباء',
    medicalFitness: true,
    signedContract: true,
    ...(employee.legalChecklist || {}),
    ...(employee.requiredDocuments ? Object.fromEntries(employee.requiredDocuments.map((k: string) => [k, true])) : {})
  };
`;

if (!content.includes('const requiredChecklist')) {
    content = content.replace("  const [showAddCustomModal", logic + "\n  const [showAddCustomModal");
}

fs.writeFileSync('./src/components/employees/tabs/EmployeeDocumentsTab.tsx', content);
console.log("Fixed Docs Tab");
