const fs = require('fs');
let code = fs.readFileSync('src/apps/EmployeesApp.tsx', 'utf8');

code = code.replace(
  `  // 1. قراءة البيانات المحفوظة مقيدة بالشركة النشطة
  const [employees, setEmployees] = useState(() => {
    if (!currentCompanyId) return [];
    const saved = localStorage.getItem(\`odoo_employees_v1_\${currentCompanyId}\`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((e: any) => currentCompanyId === 'comp-super-admin' || e.companyId === currentCompanyId);
        }
      } catch (e) {}
    }
    return [];
  });`,
  `  // 1. قراءة البيانات المحفوظة مقيدة بالشركة النشطة
  const [employees, setEmployees] = useState<any[]>([]);`
);

code = code.replace(
  `  // 2. تحديث التخزين المحلي للشركة النشطة فقط
  useEffect(() => {
    if (currentCompanyId) {
      localStorage.setItem(\`odoo_employees_v1_\${currentCompanyId}\`, JSON.stringify(employees));
    }
  }, [employees, currentCompanyId]);`,
  `  // 2. تحديث التخزين المحلي للشركة النشطة فقط
  useEffect(() => {
    if (currentCompanyId) {
      const allBelong = employees.every(e => e.companyId === currentCompanyId || currentCompanyId === 'comp-super-admin');
      if (allBelong) {
        localStorage.setItem(\`odoo_employees_v1_\${currentCompanyId}\`, JSON.stringify(employees));
      }
    }
  }, [employees, currentCompanyId]);`
);

code = code.replace(
  `  // 3. مزامنة قاعدة البيانات Firestore الحية للمؤسسة أو الشركة النشطة
  useEffect(() => {
    let isMounted = true;
    async function syncTenantEmployees() {
      if (!currentCompanyId) return;`,
  `  // 3. مزامنة قاعدة البيانات Firestore الحية للمؤسسة أو الشركة النشطة
  useEffect(() => {
    let isMounted = true;

    // Clear state immediately on company change, then load from local storage
    if (currentCompanyId) {
      const saved = localStorage.getItem(\`odoo_employees_v1_\${currentCompanyId}\`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setEmployees(parsed.filter((e: any) => currentCompanyId === 'comp-super-admin' || e.companyId === currentCompanyId));
          }
        } catch (e) {
          setEmployees([]);
        }
      } else {
        setEmployees([]);
      }
    } else {
      setEmployees([]);
    }

    async function syncTenantEmployees() {
      if (!currentCompanyId) return;`
);

code = code.replace(
  `            setEmployees(mapped);
          }
        }
      } catch (e) {`,
  `            setEmployees(mapped);
          } else {
            setEmployees([]);
          }
        }
      } catch (e) {`
);

fs.writeFileSync('src/apps/EmployeesApp.tsx', code);
console.log('Patched EmployeesApp.tsx');
