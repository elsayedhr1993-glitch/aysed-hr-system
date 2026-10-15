import React, { useEffect, useMemo, useState } from 'react';
import { AuditLog, Company, LeaveRequest, AttendanceRecord, Payslip, GeneratedDocument, DocumentItem, DocumentTemplate } from '../types';
import { ShieldCheck, Search, History, ArrowLeft, ArrowRight, Activity, Download } from 'lucide-react';
import { buildAuthedJsonHeaders } from '../lib/clientAuth';

interface AuditLogsAppProps {
  auditLogs?: AuditLog[];
  activeCompany?: Company | null;
  employees?: any[];
  contracts?: any[];
  leaves?: LeaveRequest[];
  attendance?: AttendanceRecord[];
  payslips?: Payslip[];
  generatedDocs?: GeneratedDocument[];
  documentTemplates?: DocumentTemplate[];
  onAddEmployee?: (emp: any) => void;
  onAddAttendance?: (rec: AttendanceRecord) => void;
  onAddLeave?: (leave: LeaveRequest) => void;
  onIssueDocument?: (genDoc: GeneratedDocument, docItem: DocumentItem) => void;
  onAddAuditLog?: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

interface AuditRow {
  id: string;
  at: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string;
  companyId: string;
  details?: string;
}

const ACTION_LABELS: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  export: 'تصدير',
  view_sensitive: 'اطلاع على بيانات حساسة',
  login: 'دخول',
  login_failure: 'فشل دخول',
  permission_change: 'تغيير صلاحيات',
  customization: 'تعديل وضع التخصيص',
  device_rejected: 'جهاز مرفوض',
};

const ENTITY_LABELS: Record<string, string> = {
  employee: 'موظف',
  contract: 'عقد',
  payroll: 'رواتب ومسيرات',
  settlement: 'تسوية',
  leave: 'إجازة',
  attendance: 'حضور يدوي',
  document: 'مستند',
  facility: 'منشأة',
  session: 'دخول',
  device: 'جهاز',
  identity: 'هوية',
  user: 'مستخدم',
  custom_layout: 'تخصيص',
  audit_log: 'سجل الرقابة',
  export: 'تصدير',
  print: 'طباعة',
};

function dateInputValue(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function labelOf(map: Record<string, string>, key: string): string {
  return map[key] || key;
}

export const AuditLogsApp: React.FC<AuditLogsAppProps> = () => {
  const [tab, setTab] = useState<'logs' | 'system'>('logs');
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [scope, setScope] = useState<'platform' | 'company' | ''>('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState(() => dateInputValue(7));
  const [toDate, setToDate] = useState(() => dateInputValue(0));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState('');
  const [persistence, setPersistence] = useState<'memory' | 'firestore' | ''>('');
  const [alerts, setAlerts] = useState<Array<{ at: string; message: string }>>([]);
  const pageSize = 10;

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (userFilter.trim()) params.set('user', userFilter.trim());
    if (actionFilter !== 'ALL') params.set('action', actionFilter);
    if (entityFilter !== 'ALL') params.set('entity', entityFilter);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return params.toString();
  }, [searchTerm, userFilter, actionFilter, entityFilter, fromDate, toDate, page]);

  useEffect(() => {
    if (tab !== 'logs') return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const headers = await buildAuthedJsonHeaders();
        const res = await fetch(`/api/audit/events?${query}`, { headers });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || 'تعذر قراءة سجل الرقابة');
          setRows([]);
          setTotal(0);
          return;
        }
        setError('');
        setRows(Array.isArray(data.events) ? data.events : []);
        setTotal(Number(data.total) || 0);
        setScope(data.scope === 'platform' ? 'platform' : 'company');
        setPersistence(data.persistence === 'memory' ? 'memory' : data.persistence === 'firestore' ? 'firestore' : '');
        setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      } catch {
        if (!cancelled) setError('تعذر الاتصال بسجل الرقابة');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, tab]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const selected = rows.find((row) => row.id === selectedId) || null;

  const exportLog = async () => {
    const headers = await buildAuthedJsonHeaders();
    const res = await fetch('/api/audit/export', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        q: searchTerm.trim(),
        user: userFilter.trim(),
        action: actionFilter,
        entity: entityFilter,
        from: fromDate,
        to: toDate,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'تعذر تصدير السجل');
      return;
    }
    const blob = new Blob([JSON.stringify(data.events || [], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-log.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setPage(1);
    setTab('logs');
    const refresh = await fetch(`/api/audit/events?${query}`, { headers });
    const refreshed = await refresh.json().catch(() => ({}));
    if (refresh.ok) {
      setRows(Array.isArray(refreshed.events) ? refreshed.events : []);
      setTotal(Number(refreshed.total) || 0);
    }
  };

  const runHealth = async () => {
    setHealthStatus('');
    try {
      const res = await fetch('/api/health');
      const data = await res.json().catch(() => ({}));
      if (data.status === 'ok') setHealthStatus('الخدمة تستجيب');
      else setHealthStatus('الخدمة لم تُرجع حالة ناجحة');
    } catch {
      setHealthStatus('تعذر الاتصال بفحص الاتصال');
    }
  };

  return (
    <div className="space-y-5 font-sans text-slate-800" dir="rtl">
      {persistence === 'memory' ? (
        <div className="bg-amber-100 text-amber-950 text-xs font-bold px-4 py-2 rounded-lg border border-amber-300">
          سجل الرقابة في ذاكرة هذه العملية فقط. التشغيل محلي بدون المحاكي، والأحداث تختفي عند إعادة تشغيل الخادم.
        </div>
      ) : null}
      {alerts.length > 0 ? (
        <div className="bg-rose-50 text-rose-800 text-xs font-bold px-4 py-2 rounded-lg border border-rose-200">
          تعذر حفظ أو قراءة بعض أحداث الرقابة. العملية الأصلية لم تُلغَ. {alerts[alerts.length - 1]?.message}
        </div>
      ) : null}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>سجل الرقابة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {scope === 'platform' ? 'سجل المنصة' : 'سجل المنشأة الحالية'} — آخر 7 أيام ما لم تُغيّر الفترة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'logs' ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التغييرات ({total})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('system')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'system' ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>فحص النظام</span>
          </button>
        </div>
      </div>

      {tab === 'system' ? (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-sm">
          <p className="text-slate-600">فحص الاتصال منفصل عن سجل الرقابة. لا تُعرض نسبة جاهزية إلا إذا أعاد الفحص رقماً محسوباً.</p>
          <button
            type="button"
            onClick={() => void runHealth()}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"
          >
            تشغيل فحص الاتصال
          </button>
          {healthStatus ? <p className="font-bold text-slate-800">{healthStatus}</p> : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث في المستخدم أو الكيان أو المعرّف"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pr-9 pl-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="المستخدم"
                value={userFilter}
                onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold bg-white"
              >
                <option value="ALL">كل الإجراءات</option>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={entityFilter}
                onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold bg-white"
              >
                <option value="ALL">كل الكيانات</option>
                {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <label className="flex flex-col gap-1 font-bold text-slate-600">
                من
                <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg p-2 font-normal" />
              </label>
              <label className="flex flex-col gap-1 font-bold text-slate-600">
                إلى
                <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg p-2 font-normal" />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void exportLog()}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                تصدير السجل
              </button>
            </div>

            {error ? <p className="text-xs font-bold text-rose-700">{error}</p> : null}

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-primary text-white font-bold">
                  <tr>
                    <th className="p-3">الوقت</th>
                    <th className="p-3">المستخدم</th>
                    <th className="p-3">الدور</th>
                    <th className="p-3">الإجراء</th>
                    <th className="p-3">الكيان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                        {loading ? 'جارٍ التحميل' : 'لا توجد أحداث في هذه الفترة'}
                      </td>
                    </tr>
                  ) : rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={`cursor-pointer ${selectedId === row.id ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-3 font-mono">{new Date(row.at).toLocaleString('ar-KW')}</td>
                      <td className="p-3 font-bold">{row.userName}</td>
                      <td className="p-3">{row.role}</td>
                      <td className="p-3">{labelOf(ACTION_LABELS, row.action)}</td>
                      <td className="p-3">{labelOf(ENTITY_LABELS, row.entityType)} {row.entityId ? `· ${row.entityId}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>الصفحة {page} من {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1 bg-white border border-slate-300 rounded disabled:opacity-50 flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                    السابقة
                  </button>
                  <button type="button" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)} className="px-3 py-1 bg-white border border-slate-300 rounded disabled:opacity-50 flex items-center gap-1">
                    التالية
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 text-xs space-y-3">
            <h3 className="font-bold text-sm">تفاصيل الحدث</h3>
            {!selected ? (
              <p className="text-slate-500">اختر صفاً لعرض قبل/بعد والحقول المخفية.</p>
            ) : (
              <>
                <p><span className="font-bold">IP: </span>{selected.ip || '—'}</p>
                {selected.details ? <p><span className="font-bold">التفاصيل: </span>{selected.details}</p> : null}
                <p><span className="font-bold">المنشأة: </span>{selected.companyId || 'سجل المنصة'}</p>
                <div>
                  <p className="font-bold mb-1">قبل</p>
                  <pre className="bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-auto whitespace-pre-wrap">{JSON.stringify(selected.before, null, 2)}</pre>
                </div>
                <div>
                  <p className="font-bold mb-1">بعد</p>
                  <pre className="bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-auto whitespace-pre-wrap">{JSON.stringify(selected.after, null, 2)}</pre>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
