import fs from 'fs';
let content = fs.readFileSync('src/components/OdooTimeOffApp.tsx', 'utf8');

const regex = /const empAny = emp as any;\n\s*const contractStartStr = empAny\?\.joinDate.*?;[\s\S]*?const endYear = contractEndStr \? contractEndStr\.slice\(0, 4\) : '2027';/m;

const replacement = `const empAny = emp as any;
    const contractStartStr = empAny?.joinDate || empAny?.contractStartDate || empAny?.date_start || empAny?.startDate || '2026-01-01';
    const contractEndStr = empAny?.contractEndDate || empAny?.date_end || '2027-12-31';

    // Use unified FIFO engine for exact accuracy (matching LeavesApp & Kuwait Law)
    const mappedAllocations = allocations.map(a => ({
      ...a,
      numberOfDays: a.days,
      allocationType: 'regular',
      state: 'validate',
      name: a.notes,
      dateFrom: a.allocationDate
    }));

    let carried = 0;
    let earned = 0;
    let consumed = 0;
    let available = 0;

    if (emp) {
      const empAllocs = buildEmployeeBaselineAllocations(emp, mappedAllocations as any);
      const fifo = computeFifoLeaveAllocations(emp, empAllocs, requests as any);
      
      const totalOpening = fifo.allocations.filter(a => a.allocationType === 'regular').reduce((s, a) => s + (a.numberOfDays || 0), 0);
      const totalAccrued = fifo.allocations.filter(a => a.allocationType === 'accrual' && !a.name?.includes('تعويضي') && !a.name?.includes('بديل') && !a.name?.includes('عطلة')).reduce((s, a) => s + (a.numberOfDays || 0), 0);
      const totalCompensatory = getGlobalCompensatoryDays(emp);
      
      carried = totalOpening;
      earned = totalAccrued + totalCompensatory;
      consumed = fifo.totalConsumed;
      available = Math.max(0, (carried + earned) - consumed);
    }

    const startYear = contractStartStr ? contractStartStr.slice(0, 4) : '2025';
    const endYear = contractEndStr ? contractEndStr.slice(0, 4) : '2027';`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/OdooTimeOffApp.tsx', content);
