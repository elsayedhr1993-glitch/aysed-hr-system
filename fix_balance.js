import fs from 'fs';
let content = fs.readFileSync('src/components/OdooTimeOffApp.tsx', 'utf8');

const regex = /const currentAccrual = leaveAccruals\?\.\[empId\];[\s\S]*?const startYear = contractStartStr \? contractStartStr\.slice\(0, 4\) : '2025';\n\s*const endYear = contractEndStr \? contractEndStr\.slice\(0, 4\) : '2027';/m;

const replacement = `const empAny = emp as any;
    const contractStartStr = empAny?.joinDate || empAny?.contractStartDate || empAny?.date_start || empAny?.startDate || '2026-01-01';
    const contractEndStr = empAny?.contractEndDate || empAny?.date_end || '2027-12-31';

    // Use unified engine for exact accuracy (matching Leave Settlement & Kuwait Law)
    const summary = emp ? getEmployeeUnifiedSummary(emp, allocations as any, requests as any) : null;
    const carried = summary ? (summary.carriedOverDays || 0) : 0;
    const earned = summary ? (summary.accruedAnnualDays || 0) : 0;
    const consumed = summary ? (summary.usedLeaveDays || 0) : 0;
    const available = summary ? (summary.totalAvailableDays || 0) : 0;

    const startYear = contractStartStr ? contractStartStr.slice(0, 4) : '2025';
    const endYear = contractEndStr ? contractEndStr.slice(0, 4) : '2027';`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/OdooTimeOffApp.tsx', content);
