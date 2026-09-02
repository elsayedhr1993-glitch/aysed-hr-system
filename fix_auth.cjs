const fs = require('fs');

let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Stop auto-injection
content = content.replace(`
  useEffect(() => {
    // Inject default session into localStorage if not present
    if (!localStorage.getItem('aysed_user')) {
      localStorage.setItem('aysed_user', JSON.stringify(defaultAdmin));
    }
    if (!localStorage.getItem('aysed_token')) {
      localStorage.setItem('aysed_token', defaultToken);
    }
  }, []);`, '');

content = content.replace("return defaultAdmin;", "return null;");
content = content.replace("return localStorage.getItem('aysed_token') || defaultToken;", "return localStorage.getItem('aysed_token') || null;");

fs.writeFileSync('src/context/AuthContext.tsx', content, 'utf8');
