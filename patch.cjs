const fs = require('fs');
let code = fs.readFileSync('src/components/OdooTopBar.tsx', 'utf8');

if (!code.includes('isUserCheckedIn')) {
  const searchPattern = `const [showNotifications, setShowNotifications] = useState(false);`;
  const replacePattern = `const [showNotifications, setShowNotifications] = useState(false);\n  const [isUserCheckedIn, setIsUserCheckedIn] = useState(false);\n  const [checkInTime, setCheckInTime] = useState<number | null>(null);\n  const [workDuration, setWorkDuration] = useState('00:00');\n\n  React.useEffect(() => {\n    let interval: any;\n    if (isUserCheckedIn && checkInTime) {\n      interval = setInterval(() => {\n        const diff = Math.floor((Date.now() - checkInTime) / 1000);\n        const hrs = Math.floor(diff / 3600).toString().padStart(2, '0');\n        const mins = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');\n        setWorkDuration(\`\${hrs}:\${mins}\`);\n      }, 1000);\n    } else {\n      setWorkDuration('00:00');\n    }\n    return () => clearInterval(interval);\n  }, [isUserCheckedIn, checkInTime]);\n\n  const handleCheckInOut = () => {\n    if (isUserCheckedIn) {\n      toast.success('تم تسجيل الانصراف بنجاح');\n      setIsUserCheckedIn(false);\n      setCheckInTime(null);\n    } else {\n      toast.success('تم تسجيل الدخول بنجاح');\n      setIsUserCheckedIn(true);\n      setCheckInTime(Date.now());\n    }\n  };\n`;
  code = code.replace(searchPattern, replacePattern);
  
  const buttonSearch = `{/* Debug Menu / Developer Options */}`;
  const buttonReplace = `        {/* Check-In/Out Toggle */}\n        <button\n          onClick={handleCheckInOut}\n          className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm border \${isUserCheckedIn ? 'bg-rose-500 hover:bg-rose-600 border-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white'}\`}\n        >\n          {isUserCheckedIn ? <LogOut size={14} /> : <LogIn size={14} />}\n          <span>{isUserCheckedIn ? \`تسجيل خروج (\${workDuration})\` : 'تسجيل دخول'}</span>\n        </button>\n\n        {/* Debug Menu / Developer Options */}`;
  code = code.replace(buttonSearch, buttonReplace);
  
  fs.writeFileSync('src/components/OdooTopBar.tsx', code, 'utf8');
  console.log("Patched OdooTopBar");
}
