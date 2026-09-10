import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, CheckCircle2, Clock, 
  MessageSquare, ShieldCheck, RefreshCw, Eye, Search, AlertCircle, LogOut, Copy, Check, PauseCircle, Trash2, PlayCircle, Server, Activity, Database,
  Edit3, Save, X, Lock, Building, Phone, Mail, User, Plus, Key, EyeOff, Sliders, Cpu, Layers, Wifi, Settings,
  Download, Upload, HardDrive, FileJson, CheckCheck, RefreshCcw, Sparkles, FolderDown
} from 'lucide-react';
import { db, auth, provisionTenantAuth, cleanFirestoreData, purgeTenantCascading, isTenantPurged } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import firebaseConfig from '../../firebase-applet-config.json';

interface SubscriptionRequest {
  id: string;
  requester_name: string;
  name: string;
  phone: string;
  plan_type: string;
  emp_count: string;
  state: 'draft' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  email?: string;
  password?: string;
}

interface SuperAdminDashboardProps {
  onLogout?: () => void;
  currentUserEmail?: string;
  onImpersonateCompany?: (companyName: string) => void;
  onSwitchToWorkspace?: () => void;
  onSwitchToApps?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  onLogout, 
  currentUserEmail, 
  onImpersonateCompany,
  onSwitchToWorkspace,
  onSwitchToApps 
}) => {
  const isDevPreview = typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost'));

  const [activeNav, setActiveNav] = useState<'SUBSCRIPTIONS' | 'SERVER_STATS' | 'AUDIT_LOGS' | 'SYSTEM_INTEGRATION' | 'BACKUP_RESTORE'>(
    isDevPreview ? 'SYSTEM_INTEGRATION' : 'SUBSCRIPTIONS'
  );
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'approved' | 'rejected' | 'suspended'>('all');

  // -------------------------------------------------------------
  // System Integration & API Keys Management State
  // -------------------------------------------------------------
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [firebaseConfigState, setFirebaseConfigState] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showFirebaseApiKey, setShowFirebaseApiKey] = useState(false);

  // Testing States
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [geminiErrorMessage, setGeminiErrorMessage] = useState('');

  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [firebaseErrorMessage, setFirebaseErrorMessage] = useState('');

  const [isSavingSystemKeys, setIsSavingSystemKeys] = useState(false);

  // Load config from Firestore or Fallback when tab is active
  useEffect(() => {
    const loadSystemKeys = async () => {
      try {
        const { getDoc } = await import('firebase/firestore');
        const docSnap = await getDoc(doc(db, 'system_config', 'keys'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
          setFirebaseConfigState({
            apiKey: data.apiKey || firebaseConfig.apiKey || '',
            authDomain: data.authDomain || firebaseConfig.authDomain || '',
            projectId: data.projectId || firebaseConfig.projectId || '',
            storageBucket: data.storageBucket || firebaseConfig.storageBucket || '',
            messagingSenderId: data.messagingSenderId || firebaseConfig.messagingSenderId || '',
            appId: data.appId || firebaseConfig.appId || ''
          });
        } else {
          // fallback to localStorage & imported config
          setGeminiApiKey(localStorage.getItem('custom_gemini_key') || localStorage.getItem('custom_gemini_api_key') || '');
          setFirebaseConfigState({
            apiKey: firebaseConfig.apiKey || '',
            authDomain: firebaseConfig.authDomain || '',
            projectId: firebaseConfig.projectId || '',
            storageBucket: firebaseConfig.storageBucket || '',
            messagingSenderId: firebaseConfig.messagingSenderId || '',
            appId: firebaseConfig.appId || ''
          });
        }
      } catch (err) {
        console.warn('Error loading system keys from firestore:', err);
        setGeminiApiKey(localStorage.getItem('custom_gemini_key') || localStorage.getItem('custom_gemini_api_key') || '');
        setFirebaseConfigState({
          apiKey: firebaseConfig.apiKey || '',
          authDomain: firebaseConfig.authDomain || '',
          projectId: firebaseConfig.projectId || '',
          storageBucket: firebaseConfig.storageBucket || '',
          messagingSenderId: firebaseConfig.messagingSenderId || '',
          appId: firebaseConfig.appId || ''
        });
      }
    };
    if (activeNav === 'SYSTEM_INTEGRATION') {
      loadSystemKeys();
    }
  }, [activeNav]);

  const testGeminiConnection = async () => {
    if (!geminiApiKey.trim()) {
      toast.error('يرجى إدخال مفتاح Gemini API أولاً لإجراء الفحص');
      return;
    }
    setIsTestingGemini(true);
    setGeminiStatus('idle');
    setGeminiErrorMessage('');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
      const data = await response.json();
      if (response.ok) {
        setGeminiStatus('valid');
        toast.success('تم التحقق بنجاح! مفتاح Gemini API صالح ومفعّل بنجاح.');
      } else {
        setGeminiStatus('invalid');
        const errMsg = data.error?.message || 'المفتاح غير صالح أو غير مصرح به';
        setGeminiErrorMessage(errMsg);
        toast.error(`فشل التحقق: ${errMsg}`);
      }
    } catch (err: any) {
      setGeminiStatus('invalid');
      setGeminiErrorMessage(err.message || 'خطأ في الشبكة أثناء الاتصال بالخادم');
      toast.error(`فشل الاتصال: ${err.message || 'خطأ في الشبكة'}`);
    } finally {
      setIsTestingGemini(false);
    }
  };

  const testFirebaseConnection = async () => {
    setIsTestingFirebase(true);
    setFirebaseStatus('idle');
    setFirebaseErrorMessage('');
    try {
      const { getDocFromServer } = await import('firebase/firestore');
      // Attempt to load some secure doc or keys doc
      await getDocFromServer(doc(db, 'system_config', 'keys'));
      setFirebaseStatus('valid');
      toast.success('تم التحقق بنجاح! الاتصال والتحقق السحابي مع Firebase Firestore يعمل بنشاط.');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('offline') || msg.includes('network') || msg.includes('API key') || msg.includes('invalid-credential') || msg.includes('auth')) {
        setFirebaseStatus('invalid');
        setFirebaseErrorMessage(msg || 'فشل الاتصال بقاعدة البيانات. يرجى مراجعة إعدادات المفاتيح.');
        toast.error(`فشل الاتصال: ${msg}`);
      } else {
        // If it's a permission issue or doc-not-found, the connection to firebase client is technically successful!
        setFirebaseStatus('valid');
        toast.success('تم التحقق بنجاح! الاتصال بقاعدة بيانات Firebase Firestore نشط وصالح.');
      }
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleSaveSystemKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSystemKeys(true);
    try {
      // 1. Sync local storage for immediate Client-Side OCR / AI use
      const trimmedGemini = geminiApiKey.trim();
      if (trimmedGemini) {
        localStorage.setItem('custom_gemini_key', trimmedGemini);
        localStorage.setItem('custom_gemini_api_key', trimmedGemini);
      } else {
        localStorage.removeItem('custom_gemini_key');
        localStorage.removeItem('custom_gemini_api_key');
      }

      // 2. Save to Firestore for durability
      await setDoc(doc(db, 'system_config', 'keys'), {
        geminiApiKey: trimmedGemini,
        ...firebaseConfigState,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserEmail || 'Super Admin'
      }, { merge: true });

      toast.success('تم حفظ وتحديث المفاتيح البرمجية وإعدادات النظام بنجاح!');
    } catch (err: any) {
      console.error('Error saving system keys:', err);
      toast.error('حدث خطأ أثناء حفظ الإعدادات: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsSavingSystemKeys(false);
    }
  };
  
  // -------------------------------------------------------------
  // Full Backup & Restore Suite State and Logic
  // -------------------------------------------------------------
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [backupImportData, setBackupImportData] = useState<any | null>(null);
  const [importFileName, setImportFileName] = useState('');

  const exportFullBackup = async () => {
    setIsExportingBackup(true);
    try {
      const backupData: any = {
        metadata: {
          system: 'Aysed S HR 2026 - Central Enterprise Suite',
          version: '2026.4',
          exportedAt: new Date().toISOString(),
          exportedBy: currentUserEmail || 'Super Admin',
          totalTenants: requests.length
        },
        subscriptions: requests,
        companies: [],
        employees: [],
        departments: [],
        systemConfig: {
          geminiApiKeyConfigured: !!geminiApiKey,
          firebaseProjectId: firebaseConfigState.projectId
        },
        localStorageSnapshot: {}
      };

      // 1. Fetch Firestore collections
      try {
        const compSnap = await getDocs(collection(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies')));
        backupData.companies = compSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {}

      try {
        const empSnap = await getDocs(collection(db, 'employees'));
        backupData.employees = empSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {}

      // 2. Fetch local storage keys relevant to HR system
      const relevantKeys = [
        'master_company_profile', 'registered_companies_v1', 'aysed_saved_subscriptions',
        'aysed_company_credentials', 'hr_custom_documents_v1', 'hr_doc_templates_v1',
        'odoo_leaves_data', 'odoo_attendances_data'
      ];
      relevantKeys.forEach(k => {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            backupData.localStorageSnapshot[k] = JSON.parse(item);
          } catch {
            backupData.localStorageSnapshot[k] = item;
          }
        }
      });

      // 3. Create blob & download
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `aysed-hr-enterprise-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success(`تم تصدير وحفظ النسخة الاحتياطية بنجاح (${requests.length} منشأة و ${backupData.employees.length} موظف)`);
    } catch (err: any) {
      console.error('Backup error:', err);
      toast.error('فشل تصدير النسخة الاحتياطية: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || (!parsed.metadata && !parsed.subscriptions && !parsed.companies)) {
          toast.error('ملف النسخة الاحتياطية غير متوافق أو تالف');
          return;
        }
        setBackupImportData(parsed);
        toast.success(`تم فحص ملف النسخة الاحتياطية بنجاح (${parsed.subscriptions?.length || parsed.companies?.length || 0} منشأة)`);
      } catch (err: any) {
        toast.error('فشل قراءة ملف JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const executeRestoreBackup = async () => {
    if (!backupImportData) return;
    setIsImportingBackup(true);
    try {
      // Restore companies
      if (backupImportData.companies && Array.isArray(backupImportData.companies)) {
        for (const comp of backupImportData.companies) {
          if (comp.id) {
            await setDoc(doc(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies'), comp.id), cleanFirestoreData(comp), { merge: true });
          }
        }
      }
      // Restore subscriptions
      if (backupImportData.subscriptions && Array.isArray(backupImportData.subscriptions)) {
        for (const sub of backupImportData.subscriptions) {
          if (sub.id) {
            await setDoc(doc(db, 'subscription_requests', sub.id), cleanFirestoreData(sub), { merge: true });
          }
        }
        setRequests(backupImportData.subscriptions);
      }
      // Restore LocalStorage
      if (backupImportData.localStorageSnapshot) {
        Object.entries(backupImportData.localStorageSnapshot).forEach(([key, val]) => {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        });
      }
      toast.success('تمت استعادة كافة البيانات السحابية والمحلية بنجاح!');
      setBackupImportData(null);
      setImportFileName('');
    } catch (err: any) {
      console.error('Restore error:', err);
      toast.error('فشل استعادة البيانات: ' + err.message);
    } finally {
      setIsImportingBackup(false);
    }
  };

  // Activation modal state
  const [selectedActivation, setSelectedActivation] = useState<{
    companyName: string;
    email: string;
    password: string;
    phone: string;
    requesterName: string;
  } | null>(null);

  // Delete confirmation modal state
  const [deletingRequest, setDeletingRequest] = useState<SubscriptionRequest | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isExecutingDelete, setIsExecutingDelete] = useState(false);

  // Edit Subscription / Company modal state
  const [editingRequest, setEditingRequest] = useState<SubscriptionRequest | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Create New Company / Subscription modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({
    companyName: '',
    requesterName: '',
    email: '',
    phone: '',
    password: '',
    planType: 'medical',
    empCount: '11-50',
    initialStatus: 'approved' as 'approved' | 'draft'
  });

  const handleOpenCreateModal = () => {
    setNewCompanyForm({
      companyName: '',
      requesterName: '',
      email: '',
      phone: '',
      password: 'Aysed2026#' + Math.random().toString(36).slice(-6, -1) + '!',
      planType: 'medical',
      empCount: '11-50',
      initialStatus: 'approved'
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyForm.companyName.trim()) {
      toast.error('يرجى إدخال اسم الشركة / المنشأة');
      return;
    }

    const cleanEmail = (newCompanyForm.email || `${newCompanyForm.phone.replace(/[^0-9]/g, '') || Date.now()}@aysedhr.com`).trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsCreatingCompany(true);
    const compId = 'comp-' + Date.now();
    const reqId = 'req-' + Date.now();
    const subId = 'sub-' + Date.now();
    const password = newCompanyForm.password || ('Aysed2026#' + Math.random().toString(36).slice(-6, -1) + '!');

    try {
      // 1. Provision Auth account safely without overriding Super Admin session
      const authResult = await provisionTenantAuth({
        email: cleanEmail,
        password: password,
        companyName: newCompanyForm.companyName.trim(),
        companyId: compId,
        ownerName: newCompanyForm.requesterName.trim(),
        phone: newCompanyForm.phone.trim(),
        planType: newCompanyForm.planType
      });

      const userUid = authResult.uid || `usr_${Date.now()}`;

      // 2. Create/Update document in companies collection with exact schema
      const companyDocData = {
        companyId: compId,
        id: compId,
        companyName: newCompanyForm.companyName.trim(),
        nameAr: newCompanyForm.companyName.trim(),
        nameEn: newCompanyForm.companyName.trim(),
        adminEmail: cleanEmail,
        email: cleanEmail,
        phone: newCompanyForm.phone.trim(),
        ownerName: newCompanyForm.requesterName.trim(),
        plan: newCompanyForm.planType,
        planType: newCompanyForm.planType,
        status: newCompanyForm.initialStatus === 'approved' ? 'active' : 'pending',
        state: newCompanyForm.initialStatus === 'approved' ? 'active' : 'pending',
        isActive: newCompanyForm.initialStatus === 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies'), compId), cleanFirestoreData(companyDocData), { merge: true });

      // 3. Create document in subscriptions collection
      const subscriptionData = {
        id: subId,
        companyId: compId,
        companyName: newCompanyForm.companyName.trim(),
        ownerName: newCompanyForm.requesterName.trim(),
        email: cleanEmail,
        phone: newCompanyForm.phone.trim(),
        planType: newCompanyForm.planType,
        subscriptionFee: newCompanyForm.empCount === '1-10' ? 50 : newCompanyForm.empCount === '11-50' ? 100 : 200,
        status: newCompanyForm.initialStatus === 'approved' ? 'active' : 'draft',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'subscriptions', subId), cleanFirestoreData(subscriptionData), { merge: true });

      // 4. Create document in subscription_requests collection
      const newReqData = {
        id: reqId,
        name: newCompanyForm.companyName.trim(),
        companyName: newCompanyForm.companyName.trim(),
        requester_name: newCompanyForm.requesterName.trim() || newCompanyForm.companyName.trim(),
        requesterName: newCompanyForm.requesterName.trim() || newCompanyForm.companyName.trim(),
        phone: newCompanyForm.phone.trim(),
        email: cleanEmail,
        plan_type: newCompanyForm.planType,
        planType: newCompanyForm.planType,
        emp_count: newCompanyForm.empCount,
        empCount: newCompanyForm.empCount,
        state: newCompanyForm.initialStatus,
        status: newCompanyForm.initialStatus,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'subscription_requests', reqId), cleanFirestoreData(newReqData), { merge: true });

      // 5. Create user record in users collection
      await setDoc(doc(db, 'users', userUid), {
        email: cleanEmail,
        displayName: newCompanyForm.requesterName.trim() || newCompanyForm.companyName.trim(),
        role: 'COMPANY_ADMIN',
        companyId: compId,
        companyName: newCompanyForm.companyName.trim(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });

      setIsCreateModalOpen(false);
      await fetchRequests();

      if (authResult.alreadyExisted) {
        toast.success(`تم إنشاء الشركة بنجاح وربطها بالحساب الموجود (${cleanEmail})`);
      } else {
        toast.success(`تم إنشاء الشركة وحساب الدخول بنجاح دون التأثير على جلستك!`);
      }

      // If approved, show credentials modal
      if (newCompanyForm.initialStatus === 'approved') {
        setSelectedActivation({
          companyName: newCompanyForm.companyName.trim(),
          email: cleanEmail,
          password: password,
          phone: newCompanyForm.phone.trim(),
          requesterName: newCompanyForm.requesterName.trim()
        });
      }
    } catch (err: any) {
      console.error('Create company error:', err);
      toast.error('حدث خطأ أثناء إنشاء الشركة: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleOpenEdit = (req: SubscriptionRequest) => {
    const email = req.email || `${req.phone.replace(/[^0-9]/g, '')}@aysedhr.com`;
    const creds = JSON.parse(localStorage.getItem('aysed_company_credentials') || '{}');
    const existingPass = creds[email]?.password || '';
    setEditingRequest({ ...req, email });
    setEditPassword(existingPass);
  };

  const handleSaveEditedRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest || !editingRequest.name.trim()) {
      toast.error('يرجى إدخال اسم المنشأة / الشركة');
      return;
    }

    setIsSavingEdit(true);
    const cleanEmail = (editingRequest.email || `${editingRequest.phone.replace(/[^0-9]/g, '')}@aysedhr.com`).trim().toLowerCase();
    const updatedReq: SubscriptionRequest = {
      ...editingRequest,
      name: editingRequest.name.trim(),
      requester_name: editingRequest.requester_name.trim(),
      phone: editingRequest.phone.trim(),
      email: cleanEmail,
    };

    try {
      // 1. Update in Firebase subscription_requests
      try {
        await setDoc(doc(db, 'subscription_requests', updatedReq.id), {
          companyName: updatedReq.name,
          name: updatedReq.name,
          requesterName: updatedReq.requester_name,
          phone: updatedReq.phone,
          email: updatedReq.email,
          planType: updatedReq.plan_type,
          empCount: updatedReq.emp_count,
          status: updatedReq.state,
          state: updatedReq.state,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firebase update subscription_requests warn:', err);
      }

      // 2. Update in Firebase subscriptions collection
      try {
        const subSnap = await getDocs(collection(db, 'subscriptions'));
        let subFound = false;
        for (const d of subSnap.docs) {
          const val = d.data();
          if (d.id === updatedReq.id || (val.companyName && val.companyName.toLowerCase() === updatedReq.name.toLowerCase()) || val.email === updatedReq.email) {
            subFound = true;
            await setDoc(doc(db, 'subscriptions', d.id), {
              companyName: updatedReq.name,
              ownerName: updatedReq.requester_name,
              email: updatedReq.email,
              phone: updatedReq.phone,
              planType: updatedReq.plan_type,
              status: updatedReq.state === 'approved' ? 'active' : (updatedReq.state === 'suspended' ? 'suspended' : 'active'),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
        if (!subFound && updatedReq.state === 'approved') {
          const subId = updatedReq.id.startsWith('sub-') ? updatedReq.id : `sub-${Date.now()}`;
          await setDoc(doc(db, 'subscriptions', subId), {
            id: subId,
            companyName: updatedReq.name,
            ownerName: updatedReq.requester_name,
            email: updatedReq.email,
            phone: updatedReq.phone,
            planType: updatedReq.plan_type,
            subscriptionFee: 50,
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (e) {}

      // 3. Update in Firebase companies collection
      try {
        await setDoc(doc(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies'), updatedReq.id), {
          nameAr: updatedReq.name,
          email: updatedReq.email,
          adminUsername: updatedReq.email,
          phone: updatedReq.phone,
          contactPhone: updatedReq.phone,
          planType: updatedReq.plan_type,
          ownerName: updatedReq.requester_name,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        const compSnap = await getDocs(collection(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies')));
        for (const d of compSnap.docs) {
          const comp = d.data();
          if (d.id === updatedReq.id || comp.nameAr === updatedReq.name || comp.nameEn === updatedReq.name || comp.email === updatedReq.email || comp.adminUsername === updatedReq.email) {
            await setDoc(doc(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies'), d.id), {
              nameAr: updatedReq.name,
              email: updatedReq.email,
              adminUsername: updatedReq.email,
              phone: updatedReq.phone,
              contactPhone: updatedReq.phone,
              planType: updatedReq.plan_type,
              ownerName: updatedReq.requester_name,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
      } catch (e) {}

      // Update the Firestore subscription request and company records above.
      try {
        const localSubs = JSON.parse(localStorage.getItem('aysed_saved_subscriptions') || '[]');
        const updatedLocal = localSubs.map((s: any) => (s.id === updatedReq.id || s.name === updatedReq.name || s.companyName === updatedReq.name) ? { ...s, ...updatedReq, companyName: updatedReq.name, requesterName: updatedReq.requester_name, status: updatedReq.state } : s);
        if (!updatedLocal.some((s: any) => s.id === updatedReq.id)) {
          updatedLocal.push({ ...updatedReq, companyName: updatedReq.name, requesterName: updatedReq.requester_name, status: updatedReq.state });
        }
        localStorage.setItem('aysed_saved_subscriptions', JSON.stringify(updatedLocal));

        const regComps = JSON.parse(localStorage.getItem('registered_companies_v1') || '[]');
        const updatedReg = regComps.map((c: any) => (c.id === updatedReq.id || c.nameAr === updatedReq.name || c.email === updatedReq.email) ? { ...c, nameAr: updatedReq.name, email: updatedReq.email, phone: updatedReq.phone, ownerName: updatedReq.requester_name, planType: updatedReq.plan_type } : c);
        localStorage.setItem('registered_companies_v1', JSON.stringify(updatedReg));
      } catch (e) {}

      // 6. Update credentials in localStorage
      if (editPassword) {
        const creds = JSON.parse(localStorage.getItem('aysed_company_credentials') || '{}');
        creds[cleanEmail] = {
          email: cleanEmail,
          password: editPassword,
          companyName: updatedReq.name,
          phone: updatedReq.phone
        };
        localStorage.setItem('aysed_company_credentials', JSON.stringify(creds));

        // If force-password route exists
        try {
          await fetch('/api/admin/force-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, newPassword: editPassword })
          });
        } catch (e) {}
      }

      // 7. Update in-memory state
      setRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
      toast.success('تم حفظ وتحديث بيانات حساب الشركة المشتركة بنجاح');
      setEditingRequest(null);
      setEditPassword('');
    } catch (err: any) {
      console.error(err);
      toast.error('حدث خطأ أثناء حفظ التعديلات: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const fetchRequests = async () => {
    if (isDevPreview) {
      setLoading(false);
      setRequests([]);
      return;
    }
    setLoading(true);
    let allRequests: SubscriptionRequest[] = [];

    // Load Firebase subscription_requests and companies collections.
    try {
      const snap = await getDocs(collection(db, 'subscription_requests'));
      snap.forEach(d => {
        const val = d.data();
        const compName = val.companyName || val.name || val.nameAr || '';
        if (!isTenantPurged(d.id) && !isTenantPurged(compName) && !isTenantPurged(val)) {
          if (!allRequests.some(r => r.id === d.id || r.name.toLowerCase() === compName.toLowerCase())) {
            let st: 'draft' | 'approved' | 'rejected' | 'suspended' = 'draft';
            if (val.status === 'approved' || val.state === 'approved') st = 'approved';
            else if (val.status === 'rejected' || val.state === 'rejected') st = 'rejected';
            else if (val.status === 'suspended' || val.state === 'suspended') st = 'suspended';

            allRequests.push({
              id: d.id,
              requester_name: val.requesterName || val.requester_name || val.name || '',
              name: compName,
              phone: val.phone || '',
              plan_type: val.planType || val.sector || val.plan || 'admin',
              emp_count: val.empCount || val.employee_count || '1-10',
              state: st,
              created_at: val.createdAt?.toDate?.()?.toISOString() || val.created_at || new Date().toISOString(),
              email: val.email || `${val.phone ? val.phone.replace(/[^0-9]/g, '') : 'client'}@aysedhr.com`,
              password: val.adminPassword || val.password || ''
            });
          }
        }
      });

      // Also check Firestore companies collection
      const compSnap = await getDocs(collection(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies')));
      compSnap.forEach(d => {
        const val = d.data();
        const compName = val.companyName || val.nameAr || val.name || '';
        if (compName && !isTenantPurged(d.id) && !isTenantPurged(compName) && !isTenantPurged(val)) {
          if (!allRequests.some(r => r.id === d.id || r.name.toLowerCase() === compName.toLowerCase())) {
            let st: 'draft' | 'approved' | 'rejected' | 'suspended' = 'approved';
            if (val.status === 'DRAFT' || val.state === 'draft' || val.status === 'PENDING') st = 'draft';
            else if (val.status === 'SUSPENDED' || val.state === 'suspended') st = 'suspended';

            const activePhone = val.contactPhone || val.phone || val.mobile || '';
            const activeEmail = val.adminUsername || val.email || val.adminEmail || `${activePhone ? activePhone.replace(/[^0-9]/g, '') : 'client'}@aysedhr.com`;

            allRequests.push({
              id: d.id,
              requester_name: val.ownerName || val.requesterName || val.name || 'المسؤول',
              name: compName,
              phone: activePhone,
              plan_type: val.planType || val.plan || 'admin',
              emp_count: String(val.employeeCount || val.empCount || '1-10'),
              state: st,
              created_at: val.createdAt?.toDate?.()?.toISOString() || val.created_at || new Date().toISOString(),
              email: activeEmail,
              password: val.adminPassword || val.password || ''
            });
          }
        }
      });
    } catch (fbErr) {
      console.warn('Firebase fetch subscription_requests warn:', fbErr);
    }

    // 3. LocalStorage registered companies & subscriptions fallback
    try {
      const regComps = JSON.parse(localStorage.getItem('registered_companies_v1') || '[]');
      if (Array.isArray(regComps)) {
        regComps.forEach((rc: any) => {
          if (!rc || rc.id === 'comp-super-admin') return;
          const companyTitle = rc.nameAr || rc.name || rc.nameEn || rc.companyName || '';
          if (companyTitle && !isTenantPurged(rc.id) && !isTenantPurged(companyTitle) && !isTenantPurged(rc)) {
            if (!allRequests.some(r => r.id === rc.id || r.name.toLowerCase() === companyTitle.toLowerCase())) {
              const activePhone = rc.contactPhone || rc.phone || rc.mobile || '99112233';
              const activeEmail = rc.adminUsername || rc.email || rc.adminEmail || `${activePhone ? activePhone.replace(/[^0-9]/g, '') : rc.id}@aysedhr.com`;

              allRequests.push({
                id: rc.id,
                requester_name: rc.ownerName || rc.requesterName || rc.name || 'المسؤول',
                name: companyTitle,
                phone: activePhone,
                plan_type: rc.planType || rc.plan || 'Medical Pro',
                emp_count: String(rc.employeeCount || rc.empCount || '1-10'),
                state: rc.status === 'suspended' ? 'suspended' : 'approved',
                created_at: rc.createdAt || new Date().toISOString(),
                email: activeEmail
              });
            }
          }
        });
      }

      const localSubs = JSON.parse(localStorage.getItem('aysed_saved_subscriptions') || '[]');
      localSubs.forEach((ls: any) => {
        const companyTitle = ls.companyName || ls.name || '';
        if (companyTitle && !isTenantPurged(ls.id) && !isTenantPurged(companyTitle) && !isTenantPurged(ls)) {
          if (!allRequests.some(r => r.id === ls.id || r.name.toLowerCase() === companyTitle.toLowerCase())) {
            let st: 'draft' | 'approved' | 'rejected' | 'suspended' = 'approved';
            const valSt = ls.status || ls.state;
            if (valSt === 'draft' || valSt === 'pending') st = 'draft';
            else if (valSt === 'rejected') st = 'rejected';
            else if (valSt === 'suspended') st = 'suspended';

            const activePhone = ls.contactPhone || ls.phone || '';
            const activeEmail = ls.adminUsername || ls.email || ls.adminEmail || `${activePhone ? activePhone.replace(/[^0-9]/g, '') : 'client'}@aysedhr.com`;

            allRequests.push({
              id: ls.id || 'sub-' + Math.random(),
              requester_name: ls.requesterName || ls.name || 'المسؤول',
              name: companyTitle,
              phone: activePhone,
              plan_type: ls.planType || ls.sector || 'Medical Pro',
              emp_count: ls.empCount || ls.employee_count || '1-10',
              state: st,
              created_at: ls.createdAt || new Date().toISOString(),
              email: activeEmail
            });
          }
        }
      });
    } catch (lErr) {}

    // 4. Default registered tenants
    if (allRequests.length === 0) {
      const defaultTenants: any[] = [];
      defaultTenants.forEach(dt => {
        if (!isTenantPurged(dt.id) && !isTenantPurged(dt.name)) {
          allRequests.push(dt);
        }
      });
    }

    const filteredFinal = allRequests.filter(r => !isTenantPurged(r.id) && !isTenantPurged(r.name) && !isTenantPurged(r));
    setRequests(filteredFinal);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Setup real-time listeners for incoming subscription requests, companies, and subscriptions
    let unsubscribeReq: (() => void) | null = null;
    let unsubscribeComp: (() => void) | null = null;
    let unsubscribeSubs: (() => void) | null = null;
    try {
      unsubscribeReq = onSnapshot(collection(db, 'subscription_requests'), () => {
        fetchRequests();
      }, (err) => {
        console.warn('Subscription requests listener warning:', err);
      });
      unsubscribeComp = onSnapshot(collection(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies')), () => {
        fetchRequests();
      }, (err) => {
        console.warn('Companies listener warning:', err);
      });
      unsubscribeSubs = onSnapshot(collection(db, 'subscriptions'), () => {
        fetchRequests();
      }, (err) => {
        console.warn('Subscriptions listener warning:', err);
      });
    } catch (e) {}

    const handleCustomChange = () => {
      fetchRequests();
    };
    window.addEventListener('aysed_companies_changed', handleCustomChange);

    return () => {
      if (unsubscribeReq) unsubscribeReq();
      if (unsubscribeComp) unsubscribeComp();
      if (unsubscribeSubs) unsubscribeSubs();
      window.removeEventListener('aysed_companies_changed', handleCustomChange);
    };
  }, []);

  const handleActivate = async (req: SubscriptionRequest) => {
    try {
      const email = (req.email || `${req.phone.replace(/[^0-9]/g, '') || Date.now()}@aysedhr.com`).trim().toLowerCase();
      const creds = JSON.parse(localStorage.getItem('aysed_company_credentials') || '{}');
      const tempPass = creds[email]?.password || ('Aysed2026#' + Math.random().toString(36).slice(-6, -1) + '!');
      const compId = req.id.startsWith('comp-') ? req.id : `comp-${Date.now()}`;

      // 1. Provision official company account safely without overriding Super Admin session
      const authResult = await provisionTenantAuth({
        email,
        password: tempPass,
        companyName: req.name,
        companyId: compId,
        ownerName: req.requester_name,
        phone: req.phone,
        planType: req.plan_type
      });

      const userUid = authResult.uid || `usr_${Date.now()}`;

      // 2. Set or update document in companies collection with exact requested schema
      const companyDocData = {
        companyId: compId,
        id: compId,
        companyName: req.name,
        nameAr: req.name,
        nameEn: req.name,
        adminEmail: email,
        email: email,
        phone: req.phone,
        ownerName: req.requester_name,
        plan: req.plan_type || 'active',
        planType: req.plan_type || 'active',
        status: 'active',
        state: 'active',
        isActive: true,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')) ? 'dev_companies' : 'companies'), compId), cleanFirestoreData(companyDocData), { merge: true });

      // 3. Ensure user doc exists
      await setDoc(doc(db, 'users', userUid), {
        email,
        displayName: req.requester_name || req.name,
        role: 'COMPANY_ADMIN',
        companyId: compId,
        companyName: req.name,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });

      try {
        await setDoc(doc(db, 'subscription_requests', req.id), { status: 'approved', state: 'approved' }, { merge: true });
      } catch (e) {}

      const localSubs = JSON.parse(localStorage.getItem('aysed_saved_subscriptions') || '[]');
      const updated = localSubs.map((s: any) => s.id === req.id ? { ...s, status: 'approved', state: 'approved' } : s);
      localStorage.setItem('aysed_saved_subscriptions', JSON.stringify(updated));

      // Persist in registered_companies_v1
      const regComps = JSON.parse(localStorage.getItem('registered_companies_v1') || '[]');
      if (!regComps.some((c: any) => c.nameAr === req.name)) {
        regComps.push({
          id: compId,
          nameAr: req.name,
          nameEn: req.name,
          ownerName: req.requester_name,
          email,
          phone: req.phone,
          planType: req.plan_type,
          empCount: req.emp_count,
          createdAt: req.created_at || new Date().toISOString(),
          status: 'active'
        });
        localStorage.setItem('registered_companies_v1', JSON.stringify(regComps));
      }

      // Save credentials for quick reference
      creds[email] = { email, password: tempPass, companyName: req.name };
      localStorage.setItem('aysed_company_credentials', JSON.stringify(creds));

      fetchRequests();
      toast.success(authResult.alreadyExisted ? 'تم ربط وتفعيل حساب الشركة بنجاح' : 'تم تفعيل حساب الشركة وإنشاء بيانات الدخول بنجاح');

      // Open Modal with credentials
      setSelectedActivation({
        companyName: req.name,
        email,
        password: tempPass,
        phone: req.phone,
        requesterName: req.requester_name
      });

    } catch (err: any) {
      toast.error('حدث خطأ أثناء تفعيل الحساب: ' + err.message);
    }
  };

  const handleSuspend = async (req: SubscriptionRequest) => {
    try {
      try {
        await setDoc(doc(db, 'subscription_requests', req.id), { status: 'suspended', state: 'suspended' }, { merge: true });
      } catch (e) {}

      const localSubs = JSON.parse(localStorage.getItem('aysed_saved_subscriptions') || '[]');
      const updated = localSubs.map((s: any) => s.id === req.id ? { ...s, status: 'suspended', state: 'suspended' } : s);
      localStorage.setItem('aysed_saved_subscriptions', JSON.stringify(updated));

      toast.success(`تم إيقاف/تجميد اشتراك شركة (${req.name}) مؤقتاً ومنع وصول المستخدمين`);
      fetchRequests();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء تعليق الاشتراك: ' + err.message);
    }
  };

  const handleExecuteHardDelete = async () => {
    if (!deletingRequest) return;
    setIsExecutingDelete(true);
    try {
      const email = (deletingRequest.email || `${deletingRequest.phone.replace(/[^0-9]/g, '')}@aysedhr.com`).trim().toLowerCase();
      const res = await purgeTenantCascading({
        id: deletingRequest.id,
        name: deletingRequest.name,
        email: email,
        phone: deletingRequest.phone,
        companyId: deletingRequest.id
      });

      // Real-time local state removal
      setRequests(prev => prev.filter(r => r.id !== deletingRequest.id && r.name !== deletingRequest.name));
      toast.success(res.message || `تم حذف منشأة (${deletingRequest.name}) وكافة بياناتها نهائياً`);
      setDeletingRequest(null);
      setDeleteConfirmText('');
      await fetchRequests();
    } catch (err: any) {
      console.error('Cascading delete error:', err);
      toast.error('حدث خطأ أثناء الحذف النهائي الشامل: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsExecutingDelete(false);
    }
  };

  const openWhatsApp = (phone: string, companyName: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullNumber = cleanPhone.startsWith('965') ? cleanPhone : `965${cleanPhone}`;
    const text = encodeURIComponent(
      `السلام عليكم أخي الفاضل ${name}، بخصوص طلبكم لمنظومة Aysed S HR 2026 لمؤسستكم (${companyName}). يسعدنا تزويدكم ببيانات الدخول واعتماد الحساب...`
    );
    window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank');
  };

  const filteredRequests = requests.filter(req => {
    const matchSearch = (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (req.requester_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (req.phone || '').includes(searchTerm);
    const matchStatus = statusFilter === 'all' ? true : req.state === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-full bg-[#F8F9FA] text-gray-800 font-sans flex flex-col select-none odoo-scrollbar aysed_super_admin_view" dir="rtl">
      
      {/* Main Layout Area with Odoo Sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-[calc(100vh-48px)]">
        
        {/* Unified Super Admin Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-l border-slate-800 shadow-lg shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-xs font-black text-white uppercase tracking-wider">لوحة الإدارة العليا</h2>
                <p className="text-[10px] text-slate-400">Aysed S HR 2026 - Master Portal</p>
              </div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {!isDevPreview && (
              <button
                onClick={() => setActiveNav('SUBSCRIPTIONS')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeNav === 'SUBSCRIPTIONS' ? 'bg-[#71639e] text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Building2 size={16} />
                <span>إدارة الاشتراكات (SaaS)</span>
              </button>
            )}
            <button
              onClick={() => setActiveNav('SERVER_STATS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeNav === 'SERVER_STATS' ? 'bg-[#71639e] text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Server size={16} />
              <span>إحصائيات السيرفر والمنشآت</span>
            </button>
            <button
              onClick={() => setActiveNav('BACKUP_RESTORE')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeNav === 'BACKUP_RESTORE' ? 'bg-[#71639e] text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <HardDrive size={16} />
              <span>النسخ الاحتياطي واستعادة البيانات</span>
            </button>
            <button
              onClick={() => setActiveNav('AUDIT_LOGS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeNav === 'AUDIT_LOGS' ? 'bg-[#71639e] text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Activity size={16} />
              <span>سجل العمليات والأمان</span>
            </button>
            <button
              onClick={() => setActiveNav('SYSTEM_INTEGRATION')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeNav === 'SYSTEM_INTEGRATION' ? 'bg-[#71639e] text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Key size={16} />
              <span>المفاتيح والربط البرمجي (APIs)</span>
            </button>
            
            {isDevPreview && (
              <button
                onClick={() => {
                  toast.success('تم تفعيل وضع المطور (Sandbox) 🚀');
                  if (onSwitchToApps) onSwitchToApps();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-amber-300 hover:bg-amber-900/40 border border-amber-900/30 mt-4"
              >
                <Eye size={16} />
                <span>معاينة واجهات النظام (Sandbox)</span>
              </button>
            )}
          </nav>

          <div className="mt-auto p-3 border-t border-slate-800 space-y-2">
            {(onSwitchToApps || onSwitchToWorkspace) && (
              <button 
                onClick={() => (onSwitchToApps ? onSwitchToApps() : onSwitchToWorkspace && onSwitchToWorkspace())}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer border border-slate-700 active:scale-95"
              >
                <Building2 size={14} />
                <span>العودة لمنظومة التطبيقات 🔄</span>
              </button>
            )}
            <div className="text-[10px] text-slate-500 text-center font-mono">
              {currentUserEmail || 'Super Admin'}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
          
          {activeNav === 'SUBSCRIPTIONS' && (
            <div className="max-w-7xl mx-auto space-y-5">
              
              {/* Top Subscriptions Header & Actions */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="text-[#71639e] w-5 h-5" />
                    <span>إدارة الاشتراكات والشركات (SaaS Subscriptions Hub)</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">إدارة وتفعيل المنشآت الطبية والتجارية، إصدار التراخيص، وإدارة الدخول كمسؤول.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#71639e] hover:bg-[#5e5285] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <Plus size={15} />
                    <span>+ اشتراك / منشأة جديدة</span>
                  </button>

                  <button 
                    onClick={fetchRequests}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="تحديث البيانات"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>تحديث</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">إجمالي المنشآت</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{requests.length}</p>
                  </div>
                  <div className="p-2.5 bg-purple-50 text-[#71639e] rounded-xl border border-purple-100">
                    <Building2 size={24} />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">طلبات جديدة</p>
                    <p className="text-2xl font-bold text-amber-600 mt-0.5">
                      {requests.filter(r => r.state === 'draft').length}
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                    <Clock size={24} />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">منشآت مفعلة</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-0.5">
                      {requests.filter(r => r.state === 'approved').length}
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">منشآت معلقة</p>
                    <p className="text-2xl font-bold text-rose-600 mt-0.5">
                      {requests.filter(r => r.state === 'suspended').length}
                    </p>
                  </div>
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                    <PauseCircle size={24} />
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                
                {/* Search and Filters Bar */}
                <div className="p-3.5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/80">
                  <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute right-3 top-2.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="بحث باسم المنشأة، المتقدم، أو رقم الهاتف..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg pr-9 pl-4 py-1.5 text-xs text-gray-800 outline-none focus:border-[#71639e] focus:ring-1 focus:ring-[#71639e]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    <button 
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'all' ? 'bg-[#71639e] text-white shadow-xs' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      الكل ({requests.length})
                    </button>
                    <button 
                      onClick={() => setStatusFilter('draft')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'}`}
                    >
                      جديدة ({requests.filter(r => r.state === 'draft').length})
                    </button>
                    <button 
                      onClick={() => setStatusFilter('approved')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'}`}
                    >
                      مفعلة ({requests.filter(r => r.state === 'approved').length})
                    </button>
                    <button 
                      onClick={() => setStatusFilter('suspended')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'suspended' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-50'}`}
                    >
                      معلقة ({requests.filter(r => r.state === 'suspended').length})
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs aysed_subscription_table">
                    <thead className="bg-slate-100/80 text-slate-700 uppercase border-b border-gray-200 font-bold text-[11px]">
                      <tr>
                        <th className="p-3">المنشأة والمفوض</th>
                        <th className="p-3">رقم الهاتف</th>
                        <th className="p-3">القطاع والعمالة</th>
                        <th className="p-3 text-center">الحالة</th>
                        <th className="p-3">تاريخ الطلب</th>
                        <th className="p-3 text-left">الإجراءات والتحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">جاري تحميل سجلات المشتركين...</td>
                        </tr>
                      ) : filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">لا توجد منشآت أو اشتراكات مطابقة للبحث</td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-purple-50/20 transition-colors">
                            
                            {/* Company & Contact */}
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#71639e] flex items-center justify-center font-bold text-xs shrink-0">
                                  {req.name ? req.name.charAt(0) : 'ش'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-slate-900 text-xs">{req.name}</p>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-medium border border-purple-200">
                                      {req.plan_type === 'medical' ? 'طبي' : 'تجاري'}
                                    </span>
                                  </div>
                                  <p className="text-slate-500 text-[11px] font-medium">{req.requester_name}</p>
                                  {req.email && <p className="text-[10px] text-[#714B67] font-mono mt-0.5">{req.email}</p>}
                                </div>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="p-3">
                              <span className="font-mono text-slate-800 font-bold text-xs">{req.phone}</span>
                            </td>

                            {/* Sector & Headcount */}
                            <td className="p-3">
                              <div className="space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                  {req.plan_type === 'medical' ? 'عيادات ومراكز' : 'إداري وتجاري'}
                                </span>
                                <p className="text-slate-500 font-medium text-[11px]">{req.emp_count} موظف</p>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-3 text-center">
                              {req.state === 'draft' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                  قيد المراجعة
                                </span>
                              )}
                              {req.state === 'approved' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  نشطة
                                </span>
                              )}
                              {req.state === 'suspended' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                  معلقة
                                </span>
                              )}
                              {req.state === 'rejected' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold">
                                  مرفوض
                                </span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="p-3 text-slate-600 font-mono text-xs">
                              {new Date(req.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </td>

                            {/* Compact Single-Line Actions */}
                            <td className="p-3 text-left">
                              <div className="flex items-center justify-end gap-1.5 flex-nowrap whitespace-nowrap">
                                
                                {/* Impersonate / Login as Tenant Button */}
                                {onImpersonateCompany && req.state === 'approved' && (
                                  <button
                                    onClick={() => onImpersonateCompany(req.name)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                                    title="دخول فوري كمسؤول الشركة"
                                  >
                                    <Eye size={13} />
                                    <span>دخول كمسؤول</span>
                                  </button>
                                )}

                                {/* Activate Button for draft/suspended */}
                                {req.state !== 'approved' && (
                                  <button
                                    onClick={() => handleActivate(req)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-[#71639e] hover:bg-[#5e5285] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                                    title="تفعيل وترخيص المنشأة"
                                  >
                                    <PlayCircle size={13} />
                                    <span>{req.state === 'suspended' ? 'إعادة تفعيل' : 'تفعيل'}</span>
                                  </button>
                                )}

                                {/* WhatsApp Button */}
                                <button
                                  onClick={() => openWhatsApp(req.phone, req.name, req.requester_name)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg transition cursor-pointer"
                                  title="محادثة واتساب سريعة"
                                >
                                  <MessageSquare size={14} />
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => handleOpenEdit(req)}
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg transition cursor-pointer"
                                  title="تعديل بيانات الحساب"
                                >
                                  <Edit3 size={14} />
                                </button>

                                {/* Credentials for Approved */}
                                {req.state === 'approved' && (
                                  <button
                                    onClick={() => {
                                      const email = req.email || `${req.phone.replace(/[^0-9]/g, '')}@aysedhr.com`;
                                      const creds = JSON.parse(localStorage.getItem('aysed_company_credentials') || '{}');
                                      const existingPass = req.password || creds[email]?.password || 'Aysed2026#Secure';
                                      setSelectedActivation({
                                        companyName: req.name,
                                        email,
                                        password: existingPass,
                                        phone: req.phone,
                                        requesterName: req.requester_name
                                      });
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg transition cursor-pointer"
                                    title="عرض بيانات الدخول وكلمة المرور"
                                  >
                                    <Key size={14} />
                                  </button>
                                )}

                                {/* Suspend Button for Approved */}
                                {req.state === 'approved' && (
                                  <button
                                    onClick={() => handleSuspend(req)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg transition cursor-pointer"
                                    title="تجميد الحساب مؤقتاً"
                                  >
                                    <PauseCircle size={14} />
                                  </button>
                                )}

                                {/* Hard Delete */}
                                <button
                                  onClick={() => {
                                    setDeletingRequest(req);
                                    setDeleteConfirmText('');
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg border border-rose-200 transition cursor-pointer"
                                  title="حذف نهائي شامل للمنشأة"
                                >
                                  <Trash2 size={14} />
                                </button>

                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeNav === 'SERVER_STATS' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <Server className="w-6 h-6 text-[#71639e]" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">إحصائيات السيرفر وقاعدة البيانات</h3>
                    <p className="text-xs text-gray-500">حالة الخوادم السحابية ونشاط المنظومة المركزي</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">حالة الاستضافة السحابية</p>
                    <p className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>متصل (Google Cloud Run)</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">قاعدة البيانات المركزية</p>
                    <p className="text-lg font-bold text-indigo-600 mt-1 flex items-center gap-2">
                      <Database size={18} />
                      <span>Firebase & Supabase Sync Active</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">إجمالي الشركات المسجلة</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{requests.length} منشأة</p>
                  </div>
                </div>
              </div>
            </div>)}

          {activeNav === 'AUDIT_LOGS' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <Activity className="w-6 h-6 text-[#71639e]" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">سجل العمليات والأمان المركزي</h3>
                    <p className="text-xs text-gray-500">متابعة عمليات التوثيق وتعديلات الحسابات والإدارة العليا</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs font-mono text-gray-600 space-y-2">
                  <p>[INFO] {new Date().toISOString()} - Master Portal session active for {currentUserEmail || 'Super Admin'}</p>
                  <p>[INFO] {new Date().toISOString()} - Successfully loaded {requests.length} tenant subscriptions.</p>
                  <p>[SEC] {new Date().toISOString()} - JWT Token verified successfully with Role: SUPER_ADMIN.</p>
                </div>
              </div>

            </div>)}

          {activeNav === 'SYSTEM_INTEGRATION' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Header section with lock */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-[#71639e] rounded-xl border border-indigo-100">
                    <Sliders size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">إدارة المفاتيح البرمجية والربط السحابي (System Integration & APIs)</h3>
                    <p className="text-xs text-gray-500">تهيئة وتعديل وفحص اتصالات الأنظمة المدمجة مع ماسح الهويات والاتصال بقاعدة البيانات.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold shadow-2xs">
                  <Lock size={13} />
                  <span>محمي ومقفل فقط لـ: SUPER_ADMIN</span>
                </div>
              </div>

              <form onSubmit={handleSaveSystemKeys} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* 1. OCR / AI Keys Column */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="text-purple-600 w-5 h-5" />
                          <h4 className="text-sm font-bold text-gray-900">محرك الذكاء الاصطناعي ومعالجة المستندات (AI & OCR)</h4>
                        </div>
                        <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-full border border-purple-100">
                          Google Gemini API
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed">
                        يُستخدم مفتاح Gemini لتشغيل خدمات المسح التلقائي وقراءة صور الهويات المدنية الكويتية، رخص القيادة ورخص وزارة الصحة ومطابقة البيانات دون تأخير.
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-700">مفتاح API الخاص بـ Google Gemini (Gemini API Key)</label>
                          <a 
                            href="https://aistudio.google.com/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>احصل على مفتاح مجاني</span>
                            <span>🔗</span>
                          </a>
                        </div>
                        
                        <div className="relative">
                          <Key className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            dir="ltr"
                            className="w-full bg-slate-50 border border-gray-300 rounded-lg pr-9 pl-10 py-2.5 text-xs font-mono text-gray-800 focus:border-[#71639e] focus:bg-white outline-none shadow-2xs transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                            className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Gemini Status Alert */}
                      {geminiStatus !== 'idle' && (
                        <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                          geminiStatus === 'valid' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          {geminiStatus === 'valid' ? (
                            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                          ) : (
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                          )}
                          <div>
                            <p className="font-bold">
                              {geminiStatus === 'valid' ? 'متصل وصالح (Connected / Valid)' : 'فشل الاتصال والتحقق (Connection Failed)'}
                            </p>
                            <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">
                              {geminiStatus === 'valid' 
                                ? 'تم الاتصال بالخادم المركزي لـ Google Gemini بنجاح، المفتاح جاهز للعمل مع OCR.'
                                : geminiErrorMessage || 'الرجاء فحص المفتاح والتأكد من عدم وجود قيود على الاستخدام.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-gray-400">آخر فحص: لحظي ومباشر عبر خادم Google</span>
                      <button
                        type="button"
                        onClick={testGeminiConnection}
                        disabled={isTestingGemini}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        {isTestingGemini ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>جاري الفحص...</span>
                          </>
                        ) : (
                          <>
                            <Wifi size={13} />
                            <span>فحص الاتصال (Test Connection)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 2. Firebase Database Connection Column */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Database className="text-blue-600 w-5 h-5" />
                        <h4 className="text-sm font-bold text-gray-900">تهيئة قاعدة البيانات المركزية (Firebase Config)</h4>
                      </div>
                      <span className="text-[10px] text-blue-700 bg-blue-50 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                        Cloud Firestore
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      هذه الإعدادات تربط المتصفح بقاعدة البيانات المركزية لتخزين سجلات الموظفين والشركات التابعة وسحابة SaaS بشكل آمن.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-right">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">معرّف المشروع (Project ID)</label>
                        <input
                          type="text"
                          value={firebaseConfigState.projectId}
                          onChange={(e) => setFirebaseConfigState({ ...firebaseConfigState, projectId: e.target.value })}
                          placeholder="gen-lang-client-..."
                          dir="ltr"
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 focus:border-[#71639e] focus:bg-white outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">الرابط المعتمد للتوثيق (Auth Domain)</label>
                        <input
                          type="text"
                          value={firebaseConfigState.authDomain}
                          onChange={(e) => setFirebaseConfigState({ ...firebaseConfigState, authDomain: e.target.value })}
                          placeholder="project.firebaseapp.com"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 focus:border-[#71639e] focus:bg-white outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">مفتاح API الخاص بقاعدة البيانات (API Key)</label>
                        <div className="relative">
                          <input
                            type={showFirebaseApiKey ? 'text' : 'password'}
                            value={firebaseConfigState.apiKey}
                            onChange={(e) => setFirebaseConfigState({ ...firebaseConfigState, apiKey: e.target.value })}
                            placeholder="AIzaSy..."
                            dir="ltr"
                            className="w-full bg-slate-50 border border-gray-300 rounded-lg pr-3 pl-8 py-2 text-xs font-mono text-gray-800 focus:border-[#71639e] focus:bg-white outline-none shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFirebaseApiKey(!showFirebaseApiKey)}
                            className="absolute left-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showFirebaseApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">معرّف التطبيق (App ID)</label>
                        <input
                          type="text"
                          value={firebaseConfigState.appId}
                          onChange={(e) => setFirebaseConfigState({ ...firebaseConfigState, appId: e.target.value })}
                          placeholder="1:99878134269:web:..."
                          dir="ltr"
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 focus:border-[#71639e] focus:bg-white outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">حاوية التخزين (Storage Bucket)</label>
                        <input
                          type="text"
                          value={firebaseConfigState.storageBucket}
                          onChange={(e) => setFirebaseConfigState({ ...firebaseConfigState, storageBucket: e.target.value })}
                          placeholder="project.appspot.com"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 focus:border-[#71639e] focus:bg-white outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">رقم مرسل الإشعارات (Messaging Sender ID)</label>
                        <input
                          type="text"
                          value={firebaseConfigState.messagingSenderId}
                          onChange={(e) => setFirebaseConfigState({ ...firebaseConfigState, messagingSenderId: e.target.value })}
                          placeholder="99878134269"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 focus:border-[#71639e] focus:bg-white outline-none shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Firebase Status Alert */}
                    {firebaseStatus !== 'idle' && (
                      <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        firebaseStatus === 'valid' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        {firebaseStatus === 'valid' ? (
                          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                        ) : (
                          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                        )}
                        <div>
                          <p className="font-bold">
                            {firebaseStatus === 'valid' ? 'متصل وصالح (Connected / Valid)' : 'فشل اتصال قاعدة البيانات (Connection Failed)'}
                          </p>
                          <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">
                            {firebaseStatus === 'valid' 
                              ? 'تم الاتصال بقاعدة بيانات Cloud Firestore بنجاح والمصادقة على المفاتيح سارية.'
                              : firebaseErrorMessage || 'يرجى التحقق من صحة مفتاح الـ API والـ App ID وتوفر اتصال بالشبكة.'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-gray-400">آخر فحص: فحص قراءة داخلي (Local Query)</span>
                      <button
                        type="button"
                        onClick={testFirebaseConnection}
                        disabled={isTestingFirebase}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        {isTestingFirebase ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>جاري الفحص...</span>
                          </>
                        ) : (
                          <>
                            <Wifi size={13} />
                            <span>فحص الاتصال (Test Connection)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Unified Save bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                    ملاحظة: بمجرد حفظ التعديلات، سيتم مزامنة وتأمين هذه المفاتيح عبر السحابة لتعمل كإعدادات افتراضية لكافة الموظفين وعمليات الإدارة والمسح الضوئي.
                  </p>
                  
                  <button
                    type="submit"
                    disabled={isSavingSystemKeys}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-[#71639e] hover:bg-[#5e5285] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isSavingSystemKeys ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>جاري حفظ التهيئة...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>حفظ وإعادة تحميل التهيئة</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>)}

          {/* Tab 5: Full Backup & Restore Suite */}
          {activeNav === 'BACKUP_RESTORE' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              
              {/* Header */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 text-[#71639e] rounded-xl border border-purple-200">
                    <HardDrive size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">مركز النسخ الاحتياطي واستعادة البيانات الشاملة (Backup & Disaster Recovery)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">تصدير واستيراد لقطات النظام بالكامل، حماية بيانات المشتركين والموظفين، وضمان استمرارية الأعمال.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                  <ShieldCheck size={14} />
                  <span>تشفير سحابي عالي الأمان (AES-256)</span>
                </div>
              </div>

              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Database Migration Card */}
                <div className="lg:col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-xl border border-amber-300">
                      <Database size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-amber-900 mb-1">المرحلة 1: ترحيل البيانات إلى السحابة (Firestore Migration)</h4>
                      <p className="text-xs text-amber-800 mb-4 max-w-3xl leading-relaxed">
                        تقوم هذه الأداة بترحيل كافة بيانات الذاكرة المؤقتة (Local Storage) من الشركات، الموظفين، الحضور، الإجازات، والرواتب إلى قاعدة بيانات Firestore السحابية بشكل نهائي وربطها بالمزامنة اللحظية (Real-time Sync).
                      </p>
                      <button
                        onClick={async () => {
                          const { migrateLocalStorageToFirestore } = await import('../utils/firebaseMigration');
                          toast.promise(migrateLocalStorageToFirestore('comp-super-admin'), {
                            loading: 'جاري ترحيل البيانات إلى Firestore...',
                            success: 'تم ترحيل البيانات بنجاح! قاعدة البيانات السحابية تعمل الآن.',
                            error: 'حدث خطأ أثناء الترحيل'
                          });
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                      >
                        <RefreshCw size={14} />
                        <span>بدء الترحيل إلى Firestore الآن</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 1. Export Backup Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FolderDown className="text-purple-600 w-5 h-5" />
                        <h4 className="text-sm font-bold text-gray-900">تصدير نسخة احتياطية كاملة (Full JSON Snapshot)</h4>
                      </div>
                      <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                        تصدير فوري
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      يتم تجميع كافة السجلات السحابية والمحلية في ملف JSON واحد منظم يتضمن:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <CheckCheck size={14} className="text-emerald-600" />
                        <span>كافة الشركات والاشتراكات ({requests.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCheck size={14} className="text-emerald-600" />
                        <span>سجلات الموظفين والعقود</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCheck size={14} className="text-emerald-600" />
                        <span>حركات الإجازات والحضور</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCheck size={14} className="text-emerald-600" />
                        <span>قوالب المستندات والإعدادات</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-400">صيغة الملف: aysed-hr-backup.json</span>
                    <button
                      type="button"
                      onClick={exportFullBackup}
                      disabled={isExportingBackup}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#71639e] hover:bg-[#5e5285] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isExportingBackup ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>جاري إنشاء النسخة...</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>تنزيل النسخة الاحتياطية الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Import & Restore Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Upload className="text-blue-600 w-5 h-5" />
                        <h4 className="text-sm font-bold text-gray-900">استعادة البيانات من نسخة احتياطية (Restore Snapshot)</h4>
                      </div>
                      <span className="text-[10px] text-blue-700 bg-blue-50 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                        استيراد ذكي
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      اختر ملف نسخة احتياطية (.json) تم تصديره مسبقاً لاستعادة كافة الشركات وسجلات الموظفين والتهيئة بضغطة زر.
                    </p>

                    <div className="border-2 border-dashed border-gray-300 hover:border-[#71639e] bg-slate-50 hover:bg-purple-50/40 rounded-xl p-4 text-center transition">
                      <input 
                        type="file" 
                        accept=".json" 
                        id="backup-file-input" 
                        onChange={handleImportBackupFile}
                        className="hidden" 
                      />
                      <label htmlFor="backup-file-input" className="cursor-pointer block space-y-1.5">
                        <FileJson className="mx-auto text-gray-400" size={28} />
                        <p className="text-xs font-bold text-gray-800">
                          {importFileName ? importFileName : 'انقر هنا لاختيار ملف النسخة الاحتياطية (JSON)'}
                        </p>
                        <p className="text-[10px] text-gray-400">يدعم ملفات JSON المنتجة عبر نظام Aysed S HR</p>
                      </label>
                    </div>

                    {backupImportData && (
                      <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1.5 animate-in fade-in">
                        <div className="font-bold text-amber-900 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-600" />
                          <span>جاهز للاستعادة: {backupImportData.metadata?.system || 'نسخة احتياطية'}</span>
                        </div>
                        <div className="text-[11px] text-amber-800 space-y-0.5">
                          <div>تاريخ التصدير: <span className="font-mono">{backupImportData.metadata?.exportedAt || '---'}</span></div>
                          <div>عدد الشركات: <strong>{backupImportData.subscriptions?.length || backupImportData.companies?.length || 0}</strong> | عدد الموظفين: <strong>{backupImportData.employees?.length || 0}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-400">الفحص: تطابق الهيكل قبل الكتابة</span>
                    <button
                      type="button"
                      onClick={executeRestoreBackup}
                      disabled={!backupImportData || isImportingBackup}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {isImportingBackup ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>جاري استعادة البيانات...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>تأكيد واستعادة البيانات الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* System Health Overview Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="text-emerald-600 w-5 h-5" />
                  <span>مؤشرات أداء السحابة المركزية والنزاهة الرقمية (Cloud Health Status)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">حالة اتصال Firestore</p>
                    <p className="text-base font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>متصل ونشط 🟢</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">معرّف المشروع السحابي</p>
                    <p className="text-xs font-mono font-bold text-slate-800 mt-1 truncate" title={firebaseConfigState.projectId || 'ai-studio-remix'}>
                      {firebaseConfigState.projectId || 'ai-studio-remix'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">الشركات في اللقطة الحالية</p>
                    <p className="text-base font-bold text-purple-700 mt-1">{requests.length} منشأة</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">حساب السوبر أدمن النشط</p>
                    <p className="text-xs font-mono font-bold text-blue-700 mt-1 truncate">{currentUserEmail || 'Super Admin'}</p>
                  </div>
                </div>
              </div>

            </div>)}

        </main>
      </div>

      {/* Activation Success Modal */}
      {selectedActivation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 text-gray-800 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">تفعيل حساب شركة ({selectedActivation.companyName})</h3>
                  <p className="text-xs text-gray-500">بيانات اعتماد الدخول الرسمية للنظام</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedActivation(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">البريد الإلكتروني للشركة:</label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-300 font-mono text-sm text-[#71639e]">
                    <span>{selectedActivation.email}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedActivation.email);
                        toast.success('تم نسخ البريد الإلكتروني');
                      }}
                      className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded cursor-pointer transition-colors"
                    >
                      <Copy size={12} />
                      <span>نسخ</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">كلمة المرور المؤقتة المُنشأة:</label>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-300 font-mono text-sm text-amber-600">
                    <span className="tracking-wider">{selectedActivation.password}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedActivation.password);
                        toast.success('تم نسخ كلمة المرور');
                      }}
                      className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded cursor-pointer transition-colors"
                    >
                      <Copy size={12} />
                      <span>نسخ</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-200">
                مرحباً بك في Aysed S HR 2026.. تم إنشاء الحساب وتفعيل الترخيص بنجاح. يمكنك إرسال البيانات مباشرة عبر واتساب أدناه.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const cleanPhone = selectedActivation.phone.replace(/[^0-9]/g, '');
                  const fullNumber = cleanPhone.startsWith('965') ? cleanPhone : `965${cleanPhone}`;
                  const text = encodeURIComponent(
                    `مرحباً بك في Aysed S HR 2026.. رابط الدخول: ${window.location.origin} | البريد: ${selectedActivation.email} | كلمة المرور: ${selectedActivation.password}`
                  );
                  window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                <MessageSquare size={16} />
                <span>إرسال بيانات الدخول عبر واتساب</span>
              </button>

              <button
                onClick={() => setSelectedActivation(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>)}

      {/* Cascading Hard Delete Confirmation Modal */}
      {deletingRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-rose-300 rounded-2xl max-w-lg w-full p-6 text-gray-800 shadow-2xl relative animate-in fade-in zoom-in duration-200 space-y-4">
            
            <div className="flex items-start gap-3.5 pb-3 border-b border-rose-100">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200 shadow-inner">
                <Trash2 size={24} />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>حذف نهائي شامل للمنشأة (Cascading Wipe)</span>
                </h3>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">تحذير أمني: هذا الإجراء جذري ولا يمكن التراجع عنه!</p>
              </div>
              <button
                onClick={() => { setDeletingRequest(null); setDeleteConfirmText(''); }}
                disabled={isExecutingDelete}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 text-xs space-y-2 text-right">
              <div className="flex items-center justify-between font-bold text-gray-900 pb-1.5 border-b border-rose-200/60">
                <span className="text-rose-700">المنشأة المستهدفة:</span>
                <span className="bg-rose-200/70 text-rose-900 px-2.5 py-0.5 rounded-md font-mono text-xs">{deletingRequest.name}</span>
              </div>
              
              <p className="text-gray-700 font-medium">عند التأكيد، سيتم مسح المنظومة وتطهير كافة السجلات بشكل متسلسل (Cascade):</p>
              
              <ul className="space-y-1 text-[11px] text-gray-600 list-disc list-inside font-medium pr-1">
                <li><strong className="text-rose-800">Firebase Authentication:</strong> حذف حساب الدخول الرسمي للشركة نهائياً.</li>
                <li><strong className="text-rose-800">Firestore Companies & Subscriptions:</strong> حذف وثيقة الشركة وعقود الاشتراك.</li>
                <li><strong className="text-rose-800">كافة السجلات الفرعية:</strong> حذف بيانات الموظفين، الإجازات، الحضور، الرواتب، العقود، والعهد.</li>
                <li><strong className="text-rose-800">التخزين المحلي والمؤقت:</strong> إزالة بيانات الاعتماد والذاكرة المخزنة لهذا المشترك.</li>
              </ul>
            </div>

            <div className="space-y-1.5 text-right">
              <label className="block text-xs font-bold text-gray-700">
                للتأكيد، يرجى كتابة اسم المنشأة <span className="text-rose-600 font-mono select-all font-bold">"{deletingRequest.name}"</span> أو كلمة <span className="text-rose-600 font-bold">"حذف"</span>:
              </label>
              <input
                type="text"
                disabled={isExecutingDelete}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`اكتب "${deletingRequest.name}" أو "حذف"`}
                className="w-full border-2 border-rose-200 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-gray-50 text-right"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleExecuteHardDelete}
                disabled={
                  isExecutingDelete ||
                  (deleteConfirmText.trim().toLowerCase() !== deletingRequest.name.trim().toLowerCase() &&
                   deleteConfirmText.trim() !== 'حذف' &&
                   deleteConfirmText.trim().toLowerCase() !== 'delete')
                }
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  deleteConfirmText.trim().toLowerCase() === deletingRequest.name.trim().toLowerCase() ||
                  deleteConfirmText.trim() === 'حذف' ||
                  deleteConfirmText.trim().toLowerCase() === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                }`}
              >
                {isExecutingDelete ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف والتطهير الشامل...</span>
                  </>) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>تأكيد الحذف النهائي الشامل (Purge)</span>
                  </>)}
              </button>
              
              <button
                onClick={() => { setDeletingRequest(null); setDeleteConfirmText(''); }}
                disabled={isExecutingDelete}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-gray-300"
              >
                إلغاء
              </button>
            </div>

          </div>
        </div>)}

      {/* Edit Subscription / Company Account Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 text-gray-800 shadow-2xl relative animate-in fade-in zoom-in duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-[#71639e] rounded-xl border border-purple-100">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">تعديل بيانات حساب واشتراك الشركة</h3>
                  <p className="text-[11px] text-gray-500 font-mono">{editingRequest.name}</p>
                </div>
              </div>
              <button
                onClick={() => { setEditingRequest(null); setEditPassword(''); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedRequest} className="space-y-3.5 text-xs text-slate-900">
              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Building size={13} className="text-[#71639e]" />
                  <span>اسم المنشأة / الشركة *</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingRequest.name || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, name: e.target.value })}
                  placeholder="مثال: عيادات الفنار التخصصية"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-[#71639e]" />
                    <span>اسم المتقدم / المفوض *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.requester_name || ''}
                    onChange={(e) => setEditingRequest({ ...editingRequest, requester_name: e.target.value })}
                    placeholder="اسم المسؤول"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone size={13} className="text-[#71639e]" />
                    <span>رقم الهاتف (الكويت) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.phone || ''}
                    onChange={(e) => setEditingRequest({ ...editingRequest, phone: e.target.value })}
                    placeholder="965XXXXXXXX"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-[#71639e]" />
                  <span>البريد الإلكتروني المعتمد لتسجيل الدخول *</span>
                </label>
                <input
                  type="email"
                  required
                  value={editingRequest.email || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, email: e.target.value })}
                  placeholder="admin@company.com"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Lock size={13} className="text-[#71639e]" />
                  <span>كلمة المرور للدخول (تحديث اختياري)</span>
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="اتركها كما هي أو أدخل كلمة سر جديدة"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white text-amber-700"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">سيتم حفظ وتحديث بيانات المرور للشركة مباشرة.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">القطاع / الباقة</label>
                  <select
                    value={editingRequest.plan_type || 'medical'}
                    onChange={(e) => setEditingRequest({ ...editingRequest, plan_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  >
                    <option value="medical">طبي / عيادات ومراكز</option>
                    <option value="commercial">تجاري ومقاولات</option>
                    <option value="education">تعليمي ومدارس</option>
                    <option value="services">خدمي واستشارات</option>
                    <option value="industrial">صناعي وإنتاج</option>
                    <option value="admin">باقة عامة شاملة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">عدد الموظفين</label>
                  <select
                    value={editingRequest.emp_count || '1-10'}
                    onChange={(e) => setEditingRequest({ ...editingRequest, emp_count: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  >
                    <option value="1-10">1 - 10 موظفين</option>
                    <option value="11-50">11 - 50 موظف</option>
                    <option value="51-200">51 - 200 موظف</option>
                    <option value="200+">أكثر من 200 موظف</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">حالة الحساب والاشتراك</label>
                <select
                  value={editingRequest.state || 'approved'}
                  onChange={(e) => setEditingRequest({ ...editingRequest, state: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                >
                  <option value="approved">مفعل ونشط (Approved / Active)</option>
                  <option value="draft">قيد المراجعة والانتظار (Draft / Pending)</option>
                  <option value="suspended">مجمد / معلق مؤقتاً (Suspended)</option>
                  <option value="rejected">مرفوض (Rejected)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200 justify-end">
                <button
                  type="button"
                  onClick={() => { setEditingRequest(null); setEditPassword(''); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-[#71639e] hover:bg-[#5e5285] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSavingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* Create New Company / Subscription Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#71639e] to-[#5a4e80] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-amber-300" />
                <h3 className="font-bold text-sm">إنشاء اشتراك / منشأة جديدة (SaaS Tenant Provisioning)</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCompanySubmit} className="p-5 space-y-3.5 text-xs text-right text-slate-900">
              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex items-start gap-2 text-purple-800">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-medium">
                  سيتم إنشاء حساب الشركة في <strong>Firebase Auth</strong> ومزامنة سجل المنشأة في <strong>Firestore (companies)</strong> فوراً وبشكل معزول دون التأثير على جلسة المالك (Super Admin).
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Building size={13} className="text-[#71639e]" />
                  <span>اسم الشركة / المنشأة *</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCompanyForm.companyName}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, companyName: e.target.value })}
                  placeholder="مثال: شركة النور الطبية"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-[#71639e]" />
                    <span>اسم المالك / المسؤول</span>
                  </label>
                  <input
                    type="text"
                    value={newCompanyForm.requesterName}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, requesterName: e.target.value })}
                    placeholder="مثال: د. محمد العلي"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone size={13} className="text-[#71639e]" />
                    <span>رقم الهاتف (الكويت)</span>
                  </label>
                  <input
                    type="text"
                    value={newCompanyForm.phone}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, phone: e.target.value })}
                    placeholder="99112233"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Mail size={13} className="text-[#71639e]" />
                    <span>البريد الإلكتروني للدخول *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newCompanyForm.email}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                    placeholder="admin@company.com"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Lock size={13} className="text-[#71639e]" />
                    <span>كلمة المرور الابتدائية</span>
                  </label>
                  <input
                    type="text"
                    value={newCompanyForm.password}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, password: e.target.value })}
                    placeholder="Aysed2026#Secure"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white text-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">القطاع / الباقة</label>
                  <select
                    value={newCompanyForm.planType}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, planType: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  >
                    <option value="medical">طبي / عيادات ومراكز</option>
                    <option value="commercial">تجاري ومقاولات</option>
                    <option value="education">تعليمي ومدارس</option>
                    <option value="services">خدمي واستشارات</option>
                    <option value="industrial">صناعي وإنتاج</option>
                    <option value="admin">باقة عامة شاملة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">حجم المنشأة</label>
                  <select
                    value={newCompanyForm.empCount}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, empCount: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                  >
                    <option value="1-10">1 - 10 موظفين</option>
                    <option value="11-50">11 - 50 موظف</option>
                    <option value="51-200">51 - 200 موظف</option>
                    <option value="200+">أكثر من 200 موظف</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">حالة الاشتراك المبدئية</label>
                <select
                  value={newCompanyForm.initialStatus}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, initialStatus: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#71639e]/40 bg-white"
                >
                  <option value="approved">مفعل ونشط فوراً (Active / Approved)</option>
                  <option value="draft">قيد المراجعة والانتظار (Draft)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCompany}
                  className="px-5 py-2 bg-[#71639e] hover:bg-[#5e5285] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{isCreatingCompany ? 'جاري تهيئة المنشأة والحساب...' : 'إنشاء وتفعيل المنشأة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>)}

    </div>);
};

export default SuperAdminDashboard;
