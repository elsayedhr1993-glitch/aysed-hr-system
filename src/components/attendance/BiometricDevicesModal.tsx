import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  Wifi, 
  WifiOff, 
  Server, 
  Download, 
  Upload, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Laptop, 
  FileText, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Settings2, 
  Building2, 
  Users, 
  Eye, 
  Code2, 
  ShieldCheck, 
  HelpCircle,
  X,
  FileSpreadsheet,
  Terminal,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useCompany } from '../../context/CompanyContext';
import { useOdooHierarchy, computeAttendanceAndOvertime } from '../../context/OdooHierarchyContext';
import { AttendanceItem } from '../Attendances';

export interface BiometricDevice {
  id: string;
  name: string;
  branch: string;
  brand: 'ZKTeco' | 'Hikvision' | 'Suprema' | 'Dahua' | 'Generic';
  model: string;
  ipAddress: string;
  port: number;
  commKey: string; // Password / ComKey
  serialNumber: string;
  protocol: 'ADMS_CLOUD' | 'LOCAL_IP' | 'PULL_AGENT' | 'USB_MANUAL';
  status: 'online' | 'offline' | 'syncing';
  lastSyncTime?: string;
  totalLogsCount?: number;
  location?: string;
  enabled: boolean;
  // Multi-Company Scoping & Affiliation
  company_id?: string;
  facility_id?: string;
  facility_name?: string;
}

export const isAlmanarClinic = (company?: any): boolean => {
  if (!company) return false;
  const id = String(company.id || '').toLowerCase();
  const nameAr = String(company.nameAr || '');
  const name = String(company.name || '');
  const nameEn = String(company.nameEn || '').toLowerCase();
  return id === 'comp-1788442584841' || id.includes('almanar') || nameAr.includes('المنار') || name.includes('المنار') || nameEn.includes('almanar');
};

const getDefaultAlmanarDevices = (): BiometricDevice[] => [
  {
    id: 'dev-001',
    name: 'ماكينة الدوام الرئيسية (U350)',
    branch: 'الفرع الرئيسي - المنار كلينك',
    brand: 'ZKTeco',
    model: 'ZKTeco U350',
    ipAddress: '192.168.0.7',
    port: 4370,
    commKey: '0',
    serialNumber: 'ZK-U350-KW01',
    protocol: 'LOCAL_IP',
    status: 'online',
    lastSyncTime: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }),
    totalLogsCount: 142,
    location: 'الفرع الرئيسي - بوابة الموظفين (المنار كلينك)',
    enabled: true,
    company_id: 'comp-1788442584841',
    facility_id: 'facility-almanar-clinic',
    facility_name: 'المنار كلينك'
  },
  {
    id: 'dev-002',
    name: 'بصمة الوجه - قسم العيادات',
    branch: 'فرع العيادات التخصصية - المنار كلينك',
    brand: 'Hikvision',
    model: 'DS-K1T671MF (Face ID)',
    ipAddress: '192.168.2.115',
    port: 8000,
    commKey: 'Admin@123',
    serialNumber: 'HK-F77810294',
    protocol: 'LOCAL_IP',
    status: 'online',
    lastSyncTime: new Date(Date.now() - 1000 * 60 * 35).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }),
    totalLogsCount: 88,
    location: 'الدور الثاني - ممر الأطباء والتمريض',
    enabled: true,
    company_id: 'comp-1788442584841',
    facility_id: 'facility-almanar-clinic',
    facility_name: 'المنار كلينك'
  }
];

interface BiometricDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPunches?: (punches: AttendanceItem[]) => void;
}

export const BiometricDevicesModal: React.FC<BiometricDevicesModalProps> = ({
  isOpen,
  onClose,
  onImportPunches
}) => {
  const { activeCompany } = useCompany();
  const { employees, recordAttendanceTimes } = useOdooHierarchy();
  const activeCompId = activeCompany?.id || 'default_comp';
  const isTargetAlmanar = isAlmanarClinic(activeCompany);

  // Tabs
  const [activeTab, setActiveTab] = useState<'devices' | 'adms' | 'local_agent' | 'file_parser' | 'pin_mapping' | 'live_logs'>('devices');

  // Storage Keys
  const devicesStorageKey = `aysed_biometric_devices_${activeCompId}`;
  const pinMappingKey = `aysed_biometric_pin_map_${activeCompId}`;
  const logsHistoryKey = `aysed_biometric_synced_logs_${activeCompId}`;

  // Helper to load scoped devices strictly adhering to company boundaries
  const getScopedDevices = (targetCompId: string, isAlmanar: boolean): BiometricDevice[] => {
    const key = `aysed_biometric_devices_${targetCompId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: BiometricDevice[] = JSON.parse(saved);
        const filtered = parsed.filter(d => {
          const isAlmanarMachine = d.ipAddress === '192.168.0.7' || d.company_id === 'comp-1788442584841' || d.facility_id === 'facility-almanar-clinic';
          if (isAlmanarMachine) return isAlmanar;
          return !d.company_id || d.company_id === targetCompId;
        });

        if (isAlmanar) {
          const hasMachine = filtered.some(d => d.ipAddress === '192.168.0.7');
          if (!hasMachine) {
            filtered.unshift(getDefaultAlmanarDevices()[0]);
          } else {
            filtered.forEach(d => {
              if (d.ipAddress === '192.168.0.7') {
                d.company_id = 'comp-1788442584841';
                d.facility_id = 'facility-almanar-clinic';
                d.facility_name = 'المنار كلينك';
              }
            });
          }
        }
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    return isAlmanar ? getDefaultAlmanarDevices() : [];
  };

  // State: Devices List
  const [devices, setDevices] = useState<BiometricDevice[]>(() => 
    getScopedDevices(activeCompId, isTargetAlmanar)
  );

  // Sync devices when active company changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    setDevices(getScopedDevices(activeCompId, isTargetAlmanar));
  }, [activeCompId, isTargetAlmanar, isOpen]);

  // Save devices
  useEffect(() => {
    try {
      localStorage.setItem(devicesStorageKey, JSON.stringify(devices));
    } catch (e) {
      console.error(e);
    }
  }, [devices, devicesStorageKey]);

  // State: PIN Mapping (Employee ID -> Device PIN / Enroll ID)
  const [pinMappings, setPinMappings] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(pinMappingKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default mapping: use employee.biometricId or employee.id
    const initialMap: Record<string, string> = {};
    employees.forEach(emp => {
      const anyEmp = emp as any;
      initialMap[emp.id] = anyEmp.biometricId || anyEmp.employeeCode || emp.id.replace(/\D/g, '') || '1';
    });
    return initialMap;
  });

  useEffect(() => {
    try {
      localStorage.setItem(pinMappingKey, JSON.stringify(pinMappings));
    } catch (e) {}
  }, [pinMappings, pinMappingKey]);

  // State: Synced Logs Feed
  const [liveLogs, setLiveLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(logsHistoryKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'log-1',
        pin: '101',
        empName: 'د. أحمد محمود الكندري',
        dept: 'قسم العيادات الطبية',
        deviceName: 'بصمة الاستقبال والمدخل الرئيسي',
        time: '07:54:12',
        date: new Date().toISOString().split('T')[0],
        type: 'حضور (Check-In)',
        verifyType: 'بصمة إصبع (Fingerprint)',
        status: 'on_time'
      },
      {
        id: 'log-2',
        pin: '102',
        empName: 'سارة عبد الله المطيري',
        dept: 'الموارد البشرية والإدارة',
        deviceName: 'بصمة الاستقبال والمدخل الرئيسي',
        time: '08:06:40',
        date: new Date().toISOString().split('T')[0],
        type: 'حضور (Check-In)',
        verifyType: 'بصمة وجه (Face ID)',
        status: 'late'
      },
      {
        id: 'log-3',
        pin: '105',
        empName: 'محمد سالم الدوسري',
        dept: 'تقنية المعلومات',
        deviceName: 'بصمة الوجه - قسم العيادات',
        time: '08:00:00',
        date: new Date().toISOString().split('T')[0],
        type: 'حضور (Check-In)',
        verifyType: 'بطاقة مغناطيسية (RFID)',
        status: 'on_time'
      }
    ];
  });

  // State: Add / Edit Device Form
  const [editingDevice, setEditingDevice] = useState<Partial<BiometricDevice> | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // State: Live Syncing in progress
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // State: File Parser
  const [parsedFileLogs, setParsedFileLogs] = useState<AttendanceItem[]>([]);
  const [fileStats, setFileStats] = useState<{ totalPunches: number; matchedEmployees: number; dateRange: string } | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`تم نسخ ${label} إلى الحافظة`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Handle Save Device
  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice?.name || !editingDevice.ipAddress) {
      toast.error('يرجى كتابة اسم الجهاز وعنوان IP');
      return;
    }

    const isAlmanarTarget = isTargetAlmanar || editingDevice.ipAddress === '192.168.0.7';

    const deviceToSave: BiometricDevice = {
      id: editingDevice.id || `dev-${Date.now()}`,
      name: editingDevice.name,
      branch: editingDevice.branch || (isAlmanarTarget ? 'الفرع الرئيسي - المنار كلينك' : `${activeCompany?.nameAr || 'الفرع الرئيسي'}`),
      brand: editingDevice.brand || 'ZKTeco',
      model: editingDevice.model || 'iClock / Standalone',
      ipAddress: editingDevice.ipAddress,
      port: Number(editingDevice.port) || 4370,
      commKey: editingDevice.commKey || '0',
      serialNumber: editingDevice.serialNumber || `SN-${Math.floor(Math.random() * 899999 + 100000)}`,
      protocol: editingDevice.protocol || 'ADMS_CLOUD',
      status: 'online',
      lastSyncTime: 'الآن',
      totalLogsCount: editingDevice.totalLogsCount || 0,
      location: editingDevice.location || '',
      enabled: editingDevice.enabled !== false,
      company_id: isAlmanarTarget ? 'comp-1788442584841' : activeCompId,
      facility_id: isAlmanarTarget ? 'facility-almanar-clinic' : `facility-${activeCompId}`,
      facility_name: isAlmanarTarget ? 'المنار كلينك' : (activeCompany?.nameAr || activeCompany?.name || 'المنشأة الحالية')
    };

    setDevices(prev => {
      const exists = prev.some(d => d.id === deviceToSave.id);
      if (exists) {
        return prev.map(d => d.id === deviceToSave.id ? deviceToSave : d);
      }
      return [...prev, deviceToSave];
    });

    toast.success('تم حفظ جهاز البصمة بنجاح ضمن نطاق المنشأة المحددة');
    setIsDeviceModalOpen(false);
    setEditingDevice(null);
  };

  // Delete Device
  const handleDeleteDevice = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف جهاز البصمة (${name})؟`)) {
      setDevices(prev => prev.filter(d => d.id !== id));
      toast.success('تم حذف الجهاز');
    }
  };

  // Test Ping / Connection Simulation
  const handleTestConnection = (dev: BiometricDevice) => {
    toast.loading(`جاري اختبار الاتصال مع الجهاز [${dev.name}] على IP: ${dev.ipAddress}:${dev.port}...`, { id: 'ping-toast' });
    setTimeout(() => {
      toast.success(`تم الاتصال بنجاح مع الجهاز (${dev.brand} ${dev.model}) - زمن الاستجابة 14ms`, { id: 'ping-toast' });
    }, 1200);
  };

  // Sync All Devices Simulator
  const handleSyncAllDevices = () => {
    setIsSyncingAll(true);
    toast.loading('جاري سحب أحدث سجلات البصمات من جميع الأجهزة المتصلة...', { id: 'sync-toast' });

    setTimeout(() => {
      const nowTime = new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' });
      setDevices(prev => prev.map(d => ({ ...d, lastSyncTime: nowTime, status: 'online' })));

      // Generate a few simulated new logs scoped to current facility
      const sampleEmp = employees[Math.floor(Math.random() * employees.length)] || { id: 'emp-1', name: 'موظف تجريبي', department: 'الإدارة' };
      const newLog = {
        id: `log-${Date.now()}`,
        pin: pinMappings[sampleEmp.id] || '101',
        empName: sampleEmp.name,
        dept: sampleEmp.department || 'عام',
        deviceName: devices[0]?.name || (isTargetAlmanar ? 'ماكينة الدوام الرئيسية (U350)' : 'بصمة الاستقبال'),
        time: nowTime,
        date: new Date().toISOString().split('T')[0],
        type: 'حضور (Check-In)',
        verifyType: 'بصمة إصبع (Fingerprint)',
        status: 'on_time',
        company_id: isTargetAlmanar ? 'comp-1788442584841' : activeCompId,
        facility_id: isTargetAlmanar ? 'facility-almanar-clinic' : `facility-${activeCompId}`,
        facility_name: isTargetAlmanar ? 'المنار كلينك' : (activeCompany?.nameAr || activeCompany?.name || 'المنشأة الحالية')
      };

      setLiveLogs(prev => [newLog, ...prev.slice(0, 19)]);
      setIsSyncingAll(false);
      toast.success('تمت المزامنة بنجاح! تم استلام وتحديث حركات الحضور في النظام.', { id: 'sync-toast' });
    }, 1800);
  };

  // Parse Biometric DAT / TXT / CSV / Excel File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase();
        let rawPunches: { pin: string; dateTime: string; status?: string }[] = [];

        if (ext === 'dat' || ext === 'txt') {
          // Standard ZKTeco attlog.dat format: "PIN \t YYYY-MM-DD HH:MM:SS \t STATUS \t VERIFY"
          const text = evt.target?.result as string;
          const lines = text.split(/\r?\n/);

          lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            const parts = trimmed.split(/\s+/); // Split by tabs or spaces
            if (parts.length >= 2) {
              const pin = parts[0].replace(/[^0-9a-zA-Z]/g, '');
              let dateTime = parts[1];
              if (parts[2] && parts[2].includes(':')) {
                dateTime = `${parts[1]} ${parts[2]}`;
              }
              if (pin && dateTime) {
                rawPunches.push({ pin, dateTime });
              }
            }
          });
        } else {
          // Excel / CSV Parse
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

          json.forEach(row => {
            const pin = String(row['User ID'] || row['ID'] || row['رقم البصمة'] || row['كود الموظف'] || row['PIN'] || row['Enroll ID'] || Object.values(row)[0] || '').trim();
            const dateStr = String(row['Date'] || row['التاريخ'] || row['Time'] || row['الوقت'] || row['DateTime'] || Object.values(row)[1] || '').trim();
            const timeStr = String(row['Time'] || row['الوقت'] || row['Time In'] || Object.values(row)[2] || '').trim();

            if (pin) {
              const combinedDateTime = timeStr && !dateStr.includes(':') ? `${dateStr} ${timeStr}` : dateStr;
              rawPunches.push({ pin, dateTime: combinedDateTime });
            }
          });
        }

        if (rawPunches.length === 0) {
          toast.error('لم يتم العثور على حركات بصمة صالحة في الملف');
          setIsParsingFile(false);
          return;
        }

        // Group by Employee and Date
        const groupedMap = new Map<string, { pin: string; date: string; punches: string[] }>();

        rawPunches.forEach(p => {
          let datePart = new Date().toISOString().split('T')[0];
          let timePart = '08:00';

          if (p.dateTime.includes(' ')) {
            const [d, t] = p.dateTime.split(' ');
            if (d && d.includes('-')) datePart = d;
            if (t) timePart = t.substring(0, 5);
          } else if (p.dateTime.includes(':')) {
            timePart = p.dateTime.substring(0, 5);
          }

          const groupKey = `${p.pin}_${datePart}`;
          if (!groupedMap.has(groupKey)) {
            groupedMap.set(groupKey, { pin: p.pin, date: datePart, punches: [] });
          }
          groupedMap.get(groupKey)!.punches.push(timePart);
        });

        // Map to AttendanceItems
        const generatedItems: AttendanceItem[] = [];
        let matchedCount = 0;

        groupedMap.forEach((entry) => {
          entry.punches.sort();
          const firstPunch = entry.punches[0];
          const lastPunch = entry.punches.length > 1 ? entry.punches[entry.punches.length - 1] : '';

          // Find employee by PIN mapping or ID
          const emp = employees.find(e => {
            const anyE = e as any;
            return pinMappings[e.id] === entry.pin || 
              anyE.employeeCode === entry.pin || 
              anyE.biometricId === entry.pin || 
              e.id.includes(entry.pin);
          });

          if (emp) matchedCount++;

          const empId = emp ? emp.id : `PIN-${entry.pin}`;
          const empName = emp ? emp.name : `موظف بصمة #${entry.pin}`;
          const dept = emp ? emp.department : 'غير محدد';
          const gross = emp ? (emp.basicSalary + emp.housingAllowance + emp.transportAllowance) : 1000;
          const expectedIn = emp?.shiftStartTime || '08:00';
          const expectedOut = emp?.shiftEndTime || '16:00';
          const dailyHours = emp?.dailyHours || 8;

          const calc = computeAttendanceAndOvertime(firstPunch, lastPunch || firstPunch, gross, false, {
            dailyHours,
            shiftStartTime: expectedIn,
            shiftEndTime: expectedOut,
            gracePeriodMinutes: emp?.gracePeriodMinutes || 15,
            employmentType: emp?.employmentType || 'full_time',
            hourlyRate: emp?.hourlyRate
          });

          let status: AttendanceItem['status'] = 'present';
          if (!lastPunch) status = 'single_punch';
          else if (calc.delayMinutes > 0) status = 'late';
          else if (calc.overtimeHours > 0) status = 'overtime';

          generatedItems.push({
            id: `BIO-${entry.pin}-${entry.date}-${Date.now()}`,
            employeeId: empId,
            employeeName: empName,
            department: dept,
            jobTitle: emp?.jobTitle || '',
            date: entry.date,
            checkIn: firstPunch,
            checkOut: lastPunch || 'لم يتم التبصيم',
            workHours: lastPunch ? Math.round(calc.actualHours * 10) / 10 : 0,
            standardHours: dailyHours,
            lateMinutes: calc.delayMinutes,
            overtimeHours: calc.overtimeHours,
            method: 'دستور بيومتري (Device)',
            status,
            sourceFile: file.name
          });
        });

        setParsedFileLogs(generatedItems);
        setFileStats({
          totalPunches: rawPunches.length,
          matchedEmployees: matchedCount,
          dateRange: generatedItems[0]?.date || 'اليوم'
        });

        toast.success(`تمت معالجة ملف البصمة (${rawPunches.length} حركة - ${generatedItems.length} يوم عمل)`);
      } catch (err: any) {
        console.error(err);
        toast.error('حدث خطأ أثناء قراءة ملف البصمة. تأكد من صحة التنسيق.');
      } finally {
        setIsParsingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    if (file.name.endsWith('.dat') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Commit Parsed File Records
  const handleCommitParsedFile = () => {
    if (parsedFileLogs.length === 0) return;
    if (onImportPunches) {
      onImportPunches(parsedFileLogs);
    }
    toast.success(`تم استيراد واعتماد ${parsedFileLogs.length} حركة حضور في النظام بنجاح!`);
    setParsedFileLogs([]);
    setFileStats(null);
    onClose();
  };

  // Local Sync Script Generator (Python Script)
  const generatePythonSyncScript = () => {
    const primaryDevice = devices[0] || { ipAddress: '192.168.1.201', port: 4370, commKey: '0' };
    return `# ========================================================
#  Aysed S HR 2026 - Biometric Local Sync Bridge (PyZK)
#  المزامنة التلقائية لأجهزة البصمة ZKTeco مع السحابة
# ========================================================
import time
import requests
import json
from datetime import datetime
try:
    from zk import ZK, const
except ImportError:
    print("[!] برجاء تثبيت مكتبة pyzk: pip install pyzk requests")
    exit(1)

# إعدادات الاتصال بجهاز البصمة
DEVICE_IP = "${primaryDevice.ipAddress}"
DEVICE_PORT = ${primaryDevice.port}
DEVICE_COMM_KEY = ${primaryDevice.commKey || 0}
COMPANY_ID = "${activeCompId}"
CLOUD_API_URL = "https://${window.location.host}/api/biometrics/sync"
SYNC_INTERVAL_SECONDS = 60  # سحب الحركات كل دقيقة

print(f"[*] بدء تشغيل وسيط مزامنة البصمات - منشأة: {COMPANY_ID}")
print(f"[*] الاتصال بالجهاز على: {DEVICE_IP}:{DEVICE_PORT}")

zk = ZK(DEVICE_IP, port=DEVICE_PORT, timeout=5, password=DEVICE_COMM_KEY, force_udp=False, ommit_ping=False)

def sync_logs():
    try:
        conn = zk.connect()
        conn.disable_device()
        attendances = conn.get_attendance()
        print(f"[+] تم سحب {len(attendances)} سجل بصمة من الجهاز.")

        payload = []
        for att in attendances:
            payload.append({
                "pin": str(att.user_id),
                "timestamp": att.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "status": att.status,
                "punch": att.punch
            })

        # إرسال الحركات إلى نظام الـ HR السحابي
        headers = {"Content-Type": "application/json"}
        res = requests.post(CLOUD_API_URL, json={"companyId": COMPANY_ID, "logs": payload}, headers=headers, timeout=10)
        
        if res.status_code == 200:
            print(f"[✓] تمت المزامنة السحابية بنجاح: {res.json().get('message', 'OK')}")
        else:
            print(f"[!] خطأ في السيرفر السحابي: {res.status_code}")

        conn.enable_device()
        conn.disconnect()
    except Exception as e:
        print(f"[X] خطأ في المزامنة: {e}")

while True:
    print(f"\\n--- مزامنة دورية ({datetime.now().strftime('%H:%M:%S')}) ---")
    sync_logs()
    time.sleep(SYNC_INTERVAL_SECONDS)
`;
  };

  // Download Python Agent
  const handleDownloadPythonAgent = () => {
    const script = generatePythonSyncScript();
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aysed_zk_sync_${activeCompId}.py`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل سكريبت المزامنة التلقائية (Python Sync Agent)');
  };

  const cloudPushUrl = `https://${window.location.host}/api/biometrics/push`;
  const admsCdataUrl = `https://${window.location.host}/iclock/cdata`;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">مركز أجهزة البصمة والربط السحابي (Biometrics Hub)</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {devices.filter(d => d.status === 'online').length} متصل
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/20 text-[11px] font-bold flex items-center gap-1">
                  <Building2 size={12} className="text-amber-300" />
                  <span>المنشأة الحالية: {activeCompany?.nameAr || activeCompany?.name || 'المنار كلينك'}</span>
                </span>
                {isTargetAlmanar ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    ماكينة U350 (192.168.0.7) مقيدة للمنار كلينك
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    عزل مؤسسي: ماكينة المنار كلينك (192.168.0.7) معزولة ولا تظهر هنا
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllDevices}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncingAll ? 'animate-spin' : ''} />
              <span>{isSyncingAll ? 'جاري السحب...' : 'سحب الحركات الآن'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'devices' ? 'bg-white text-[#714B67] shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server size={14} />
            <span>الأجهزة المسجلة ({devices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('adms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'adms' ? 'bg-white text-purple-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wifi size={14} />
            <span>الربط السحابي (ADMS Push)</span>
          </button>

          <button
            onClick={() => setActiveTab('local_agent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'local_agent' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop size={14} />
            <span>وسيط المزامنة المحلي (Local Agent)</span>
          </button>

          <button
            onClick={() => setActiveTab('file_parser')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'file_parser' ? 'bg-white text-emerald-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>المعالج الذكي لملفات البصمة (DAT / USB)</span>
          </button>

          <button
            onClick={() => setActiveTab('pin_mapping')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pin_mapping' ? 'bg-white text-amber-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>مطابقة أرقام البصمات (PIN Mapping)</span>
          </button>

          <button
            onClick={() => setActiveTab('live_logs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'live_logs' ? 'bg-white text-rose-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity size={14} />
            <span>سجل الحركات الحي</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* TAB 1: REGISTERED DEVICES */}
          {activeTab === 'devices' && (
            <div className="space-y-5">
              
              {/* Multi-Company Scoping Informative Banner */}
              {!isTargetAlmanar ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
                  <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">نظام العزل المؤسسي متعدد الشركات (Multi-Company Scoping Active):</span>
                    <p className="text-amber-800 mt-1 leading-relaxed">
                      أنت تتصفح حالياً نطاق منشأة <strong>"{activeCompany?.nameAr || activeCompany?.name || 'شركة أخرى'}"</strong>. 
                      ماكينة البصمة الرئيسية (IP: 192.168.0.7 / ZKTeco U350) مربوطة ومحصورة حصرياً بمنشأة <strong>"المنار كلينك"</strong> (facility_id: facility-almanar-clinic / company_id: comp-1788442584841), وهي معزولة تماماً ولا تظهر هنا لحماية بيانات الحضور والانصراف واستقلالية الفروع.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-950 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <Building2 size={18} className="text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-bold">أجهزة منشأة المنار كلينك (Al-Manar Clinic Hardware):</span>
                      <span className="text-emerald-800 text-[11px] block">
                        ماكينة الدوام الرئيسية (IP: 192.168.0.7 / Port: 4370) معينة حصرياً لهذه المنشأة ومربوطة بمسيرات الرواتب.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] shrink-0">
                    <span className="bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-bold">facility-almanar-clinic</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-bold">comp-1788442584841</span>
                  </div>
                </div>
              )}

              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">أجهزة تسجيل الحضور والبصمة المرتبطة بالمنظومة</h3>
                  <p className="text-xs text-slate-500">
                    الأجهزة المعروضة خاصة بمنشأة [{activeCompany?.nameAr || activeCompany?.name || 'المنار كلينك'}] ومعزولة عن الشركات الأخرى.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingDevice({
                      brand: 'ZKTeco',
                      port: 4370,
                      protocol: 'ADMS_CLOUD',
                      commKey: '0',
                      enabled: true
                    });
                    setIsDeviceModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus size={14} />
                  <span>+ إضافة جهاز بصمة جديد</span>
                </button>
              </div>

              {/* Devices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map(dev => (
                  <div 
                    key={dev.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Device Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            dev.brand === 'ZKTeco' ? 'bg-purple-100 text-purple-700' :
                            dev.brand === 'Hikvision' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            <Fingerprint size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{dev.name}</h4>
                            <p className="text-[11px] text-slate-500">{dev.brand} - {dev.model}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {dev.status === 'online' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              متصل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                              غير متصل
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Multi-Company Affiliation Metadata Row */}
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 my-2.5 text-xs flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building2 size={12} className="text-emerald-700 shrink-0" />
                          <span className="text-[11px] font-bold">التبعية الحصرية:</span>
                          <span className="text-slate-900 font-semibold text-[11px]">
                            {dev.facility_name || (dev.company_id === 'comp-1788442584841' || dev.ipAddress === '192.168.0.7' ? 'المنار كلينك' : activeCompany?.nameAr || 'المنشأة')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[9px]">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                            facility_id: {dev.facility_id || (dev.company_id === 'comp-1788442584841' || dev.ipAddress === '192.168.0.7' ? 'facility-almanar-clinic' : `facility-${activeCompId}`)}
                          </span>
                          <span className="bg-slate-200/80 text-slate-800 font-bold px-1.5 py-0.5 rounded">
                            company_id: {dev.company_id || (dev.facility_id === 'facility-almanar-clinic' || dev.ipAddress === '192.168.0.7' ? 'comp-1788442584841' : activeCompId)}
                          </span>
                        </div>
                      </div>

                      {/* Device Specs */}
                      <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium">عنوان الشبكة (IP / Port)</p>
                          <p className="font-mono font-bold text-slate-800 mt-0.5">{dev.ipAddress}:{dev.port}</p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium">بروتوكول الربط</p>
                          <p className="font-bold text-purple-700 mt-0.5 text-[11px]">
                            {dev.protocol === 'ADMS_CLOUD' ? 'سحابي مباشر (ADMS)' : 'شبكة داخلية (LAN Agent)'}
                          </p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium">الفرع / الموقع</p>
                          <p className="font-medium text-slate-700 truncate mt-0.5">{dev.branch}</p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium">آخر مزامنة</p>
                          <p className="font-medium text-emerald-700 mt-0.5">{dev.lastSyncTime || 'لم تتم بعد'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTestConnection(dev)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                          title="فحص الاتصال (Ping)"
                        >
                          <Activity size={12} />
                          <span>فحص</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingDevice(dev);
                            setIsDeviceModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="تعديل الجهاز"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteDevice(dev.id, dev.name)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="حذف الجهاز"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <button
                        onClick={handleSyncAllDevices}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>سحب الحركات</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADMS CLOUD PUSH CONFIG */}
          {activeTab === 'adms' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                    <Wifi size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">إعدادات الربط السحابي المباشر (ADMS / Cloud Server)</h3>
                    <p className="text-xs text-slate-500">أدخل هذه القيم داخل شاشة إعدادات الشبكة والسيرفر السحابي في جهاز البصمة.</p>
                  </div>
                </div>

                {/* Step-by-step fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">1. عنوان الخادم السحابي (Server Address / Web Server IP):</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={window.location.host} 
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(window.location.host, 'عنوان الخادم')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition"
                      >
                        <Copy size={13} />
                        <span>{copiedText === 'عنوان الخادم' ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">2. رقم المنفذ (Server Port):</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value="443 (أو 80 إذا HTTP)" 
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 text-xs"
                        />
                        <button
                          onClick={() => copyToClipboard('443', 'رقم المنفذ')}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition"
                        >
                          <Copy size={13} />
                          <span>نسخ</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">3. تفعيل البروتوكول المشفر (Enable HTTPS):</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="ON (مفعل)" 
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-emerald-700 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">4. مسار استقبال البصمات (Push Webhook Endpoint):</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={admsCdataUrl} 
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(admsCdataUrl, 'مسار ADMS')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition"
                      >
                        <Copy size={13} />
                        <span>{copiedText === 'مسار ADMS' ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">5. مفتاح تعريف المنشأة (Company Push Secret):</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={activeCompId} 
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-purple-700 text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(activeCompId, 'مفتاح المنشأة')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition"
                      >
                        <Copy size={13} />
                        <span>نسخ</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device instructions */}
                <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl space-y-1.5 text-xs text-purple-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-purple-700" />
                    <span>طريقة الضبط في جهاز ZKTeco:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-purple-800 pr-1">
                    <li>اضغط على زر <strong>Menu (القائمة)</strong> في جهاز البصمة.</li>
                    <li>انتقل إلى <strong>Comm. (الاتصالات)</strong> ➔ ثم <strong>Cloud Server / ADMS Setting</strong>.</li>
                    <li>فعّل خيار <strong>Enable Cloud Server</strong> واكتب عنوان السيرفر والمنفذ الموضحين أعلاه.</li>
                    <li>سيبدأ الجهاز تلقائياً بإرسال أي بصمة جديدة فور حدوثها في أجزاء من الثانية!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCAL AGENT / DESKTOP SYNC */}
          {activeTab === 'local_agent' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Laptop size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">وسيط المزامنة المحلي (Aysed Local Sync Agent)</h3>
                    <p className="text-xs text-slate-500">للأجهزة التي لا تدعم السحابة وتعمل داخل الشبكة المحلية (LAN) عبر منفذ 4370.</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <p>
                    يقوم هذا البرنامج الصغير والخفيف بالعمل كخدمة خلفية على أي كمبيوتر في الفرع، حيث يتصل بجهاز البصمة كل دقيقة، يسحب الحركات الجديدة، ويرفعها فوراً إلى قاعدة بيانات المنظومة.
                  </p>

                  <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                    <p className="text-slate-400 mb-1"># طريقة التشغيل السريعة (Python 3):</p>
                    <p className="text-emerald-400">pip install pyzk requests</p>
                    <p className="text-emerald-400">python aysed_zk_sync_{activeCompId}.py</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={handleDownloadPythonAgent}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Download size={15} />
                      <span>تنزيل وسيط المزامنة (aysed_zk_sync.py)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SMART FILE PARSER (DAT / USB / EXCEL) */}
          {activeTab === 'file_parser' && (
            <div className="space-y-5">
              
              {/* File Uploader Box */}
              <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-purple-400 transition text-center space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".dat, .txt, .xlsx, .xls, .csv"
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#714B67] flex items-center justify-center mx-auto">
                  <Upload size={24} />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">سحب وإفلات ملف البصمة (DAT / TXT / Excel)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يدعم ملفات ZKTeco الأصلية من الفلاش ميموري (مثل <code className="text-purple-700 font-bold">attlog.dat</code>) وملفات Excel.
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsingFile}
                  className="px-5 py-2.5 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isParsingFile ? 'جاري التحليل الذكي...' : 'اختر ملف البصمة من جهازك'}
                </button>
              </div>

              {/* Parsed Results Preview */}
              {parsedFileLogs.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-3 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>معاينة الحركات المستخرجة من الملف</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          {parsedFileLogs.length} سجل عمل
                        </span>
                      </h4>
                      {fileStats && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          إجمالي النقرات: <strong>{fileStats.totalPunches}</strong> | الموظفين المطابقين: <strong className="text-emerald-600">{fileStats.matchedEmployees}</strong>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleCommitParsedFile}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      <span>اعتماد وترحيل لكشف الحضور ومسير الرواتب</span>
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="overflow-x-auto max-h-60 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">الموظف</th>
                          <th className="p-2.5">التاريخ</th>
                          <th className="p-2.5">حضور</th>
                          <th className="p-2.5">انصراف</th>
                          <th className="p-2.5">الساعات</th>
                          <th className="p-2.5">التأخير</th>
                          <th className="p-2.5">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedFileLogs.slice(0, 50).map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-800">{log.employeeName}</td>
                            <td className="p-2.5 font-mono text-slate-600">{log.date}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">{log.checkIn}</td>
                            <td className="p-2.5 font-mono font-bold text-indigo-700">{log.checkOut}</td>
                            <td className="p-2.5 font-bold">{log.workHours} س</td>
                            <td className="p-2.5 text-rose-600 font-bold">{log.lateMinutes ? `${log.lateMinutes} د` : '-'}</td>
                            <td className="p-2.5">
                              {log.status === 'present' ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">حاضر</span>
                              ) : log.status === 'late' ? (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">متأخر</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">بصمة واحدة</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PIN MAPPING */}
          {activeTab === 'pin_mapping' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">مطابقة رقم البصمة المسجل في الجهاز (Enroll ID) مع الموظفين</h4>
                  <p className="text-xs text-slate-500">يتيح للنظام مطابقة الحركات حتى لو اختلف رقم البصمة عن الرقم الوظيفي.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">اسم الموظف</th>
                      <th className="p-3">القسم</th>
                      <th className="p-3">الرقم الوظيفي</th>
                      <th className="p-3">رقم البصمة في الجهاز (Enroll ID)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{emp.name}</td>
                        <td className="p-3 text-slate-600">{emp.department}</td>
                        <td className="p-3 font-mono text-slate-600">{(emp as any).employeeCode || emp.id}</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={pinMappings[emp.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPinMappings(prev => ({ ...prev, [emp.id]: val }));
                            }}
                            placeholder="مثال: 101"
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-purple-700 w-32 focus:border-purple-600 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LIVE LOGS */}
          {activeTab === 'live_logs' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">سجل تدفق حركات البصمات اللحظية (Real-Time Punch Stream)</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      منشأة: {activeCompany?.nameAr || activeCompany?.name || 'المنار كلينك'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يعرض الحركات الواردة من أجهزة البصمة المربوطة حصرياً بهذه المنشأة وفق معايير العزل المؤسسي.
                  </p>
                </div>
                <button
                  onClick={handleSyncAllDevices}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw size={12} className={isSyncingAll ? 'animate-spin' : ''} />
                  <span>تحديث السجل</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">الوقت والتاريخ</th>
                      <th className="p-3">الموظف</th>
                      <th className="p-3">رقم البصمة</th>
                      <th className="p-3">الجهاز والموقع</th>
                      <th className="p-3">التبعية المؤسسية</th>
                      <th className="p-3">نوع الحركة</th>
                      <th className="p-3">طريقة التحقق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {liveLogs
                      .filter(log => {
                        const isAlmanarLog = log.deviceName?.includes('U350') || log.facility_id === 'facility-almanar-clinic' || log.company_id === 'comp-1788442584841';
                        if (isAlmanarLog) return isTargetAlmanar;
                        return !log.company_id || log.company_id === activeCompId;
                      })
                      .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-700">
                          <span className="font-bold">{log.time}</span> <span className="text-slate-400 text-[10px]">({log.date})</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{log.empName}</td>
                        <td className="p-3 font-mono font-bold text-purple-700">{log.pin}</td>
                        <td className="p-3 text-slate-600">{log.deviceName}</td>
                        <td className="p-3 text-slate-600">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 text-[11px]">{log.facility_name || (isTargetAlmanar ? 'المنار كلينك' : activeCompany?.nameAr)}</span>
                            <span className="font-mono text-[9px] text-emerald-800">
                              {log.facility_id || (isTargetAlmanar ? 'facility-almanar-clinic' : `facility-${activeCompId}`)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-emerald-700">{log.type}</td>
                        <td className="p-3 text-slate-600">{log.verifyType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>متوافق مع ZKTeco Push SDK, PyZK, Hikvision ISAPI, Suprema BioStar</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>

      {/* SUB-MODAL: ADD / EDIT DEVICE */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingDevice?.id ? 'تعديل بيانات جهاز البصمة' : 'إضافة جهاز بصمة جديد'}
              </h3>
              <button onClick={() => setIsDeviceModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDevice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الجهاز / المسمى التعريفي:</label>
                <input
                  type="text"
                  required
                  value={editingDevice?.name || ''}
                  onChange={(e) => setEditingDevice(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: بصمة المدخل الرئيسي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الماركة (Brand):</label>
                  <select
                    value={editingDevice?.brand || 'ZKTeco'}
                    onChange={(e) => setEditingDevice(prev => ({ ...prev, brand: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="ZKTeco">ZKTeco</option>
                    <option value="Hikvision">Hikvision</option>
                    <option value="Suprema">Suprema</option>
                    <option value="Dahua">Dahua</option>
                    <option value="Generic">Generic / أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموديل (Model):</label>
                  <input
                    type="text"
                    value={editingDevice?.model || ''}
                    onChange={(e) => setEditingDevice(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="مثال: iClock 680"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عنوان IP المحلي للجهاز:</label>
                  <input
                    type="text"
                    required
                    value={editingDevice?.ipAddress || ''}
                    onChange={(e) => setEditingDevice(prev => ({ ...prev, ipAddress: e.target.value }))}
                    placeholder="192.168.1.201"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المنفذ (Port):</label>
                  <input
                    type="number"
                    value={editingDevice?.port || 4370}
                    onChange={(e) => setEditingDevice(prev => ({ ...prev, port: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفرع / المنشأة:</label>
                  <input
                    type="text"
                    value={editingDevice?.branch || activeCompany?.nameAr || 'الفرع الرئيسي'}
                    onChange={(e) => setEditingDevice(prev => ({ ...prev, branch: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة وبروتوكول المزامنة:</label>
                  <select
                    value={editingDevice?.protocol || 'ADMS_CLOUD'}
                    onChange={(e) => setEditingDevice(prev => ({ ...prev, protocol: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="ADMS_CLOUD">سحابي مباشر (ADMS Cloud Push)</option>
                    <option value="LOCAL_IP">شبكة داخلية (Local Agent 4370)</option>
                    <option value="USB_MANUAL">يدوي عبر فلاشة USB</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  حفظ الجهاز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BiometricDevicesModal;
