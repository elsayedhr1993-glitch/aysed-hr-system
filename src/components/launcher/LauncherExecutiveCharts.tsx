import React, { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useEffectiveTenantCompanyId } from '../../hooks/useEffectiveTenantCompanyId';
import { isQueryableTenantCompanyId } from '../../utils/tenantCompanyId';
import { useAuth } from '../../context/AuthContext';

const attendanceData = [
  { day: 'السبت', حضور: 100, غياب: 0 },
  { day: 'الأحد', حضور: 100, غياب: 0 },
  { day: 'الإثنين', حضور: 100, غياب: 0 },
  { day: 'الثلاثاء', حضور: 100, غياب: 0 },
  { day: 'الأربعاء', حضور: 100, غياب: 0 },
  { day: 'الخميس', حضور: 100, غياب: 0 },
];

/** Executive charts — shown in Reports & Analytics app (not on home launcher). */
export const LauncherExecutiveCharts: React.FC<{
  employeesCount?: number;
  leavesPendingCount?: number;
}> = ({ employeesCount = 0, leavesPendingCount = 0 }) => {
  const { isLoading: authLoading } = useAuth();
  const currentCompanyId = useEffectiveTenantCompanyId();
  const [realEmployees, setRealEmployees] = useState<any[]>([]);
  const [realLeaves, setRealLeaves] = useState<any[]>([]);

  useEffect(() => {
    if (!isQueryableTenantCompanyId(currentCompanyId)) {
      setRealLeaves([]);
      return;
    }
    const leavesQuery = query(collection(db, 'leave_requests'), where('companyId', '==', currentCompanyId));
    return onSnapshot(leavesQuery, (snapshot) => {
      setRealLeaves(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
    });
  }, [currentCompanyId]);

  useEffect(() => {
    if (authLoading || !isQueryableTenantCompanyId(currentCompanyId)) {
      setRealEmployees([]);
      return;
    }
    const employeesQuery = query(collection(db, 'employees'), where('companyId', '==', currentCompanyId));
    return onSnapshot(employeesQuery, (snapshot) => {
      setRealEmployees(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
    });
  }, [currentCompanyId, authLoading]);

  const payrollDeptData = useMemo(() => {
    if (!realEmployees.length) {
      return [{ name: 'لا توجد رواتب مسجلة', value: 0, color: '#94a3b8' }];
    }
    const deptMap: Record<string, number> = {};
    const palette = ['#714B67', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
    realEmployees.forEach((emp) => {
      const dept = emp.department || 'إدارة عامة';
      const total =
        Number(emp.basicSalary || emp.salary || 0) +
        Number(emp.housingAllowance || 0) +
        Number(emp.transportAllowance || 0) +
        Number(emp.natureOfWorkAllowance || 0);
      deptMap[dept] = (deptMap[dept] || 0) + total;
    });
    const entries = Object.entries(deptMap);
    if (entries.length === 0 || entries.every(([, val]) => val === 0)) {
      return [{ name: 'إجمالي الرواتب 0', value: 0, color: '#94a3b8' }];
    }
    return entries.map(([deptName, totalVal], idx) => ({
      name: deptName,
      value: Number(totalVal.toFixed(3)),
      color: palette[idx % palette.length],
    }));
  }, [realEmployees]);

  const leavesStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      سنوية: 0,
      مرضية: 0,
      'عزاء / مادة 77': 0,
      'بدون راتب': 0,
    };
    realLeaves.forEach((req) => {
      const type = req.leaveType || req.type || 'annual';
      if (type === 'annual' || type === 'ANNUAL') counts['سنوية'] += 1;
      else if (type === 'sick' || type === 'SICK') counts['مرضية'] += 1;
      else if (type === 'bereavement' || type === 'BEREAVEMENT') counts['عزاء / مادة 77'] += 1;
      else if (type === 'unpaid' || type === 'UNPAID') counts['بدون راتب'] += 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [realLeaves]);

  const empCount = realEmployees.length || employeesCount;
  const pendingLeaves =
    realLeaves.filter((req) => {
      const status = String(req.status || '').toUpperCase();
      return ['PENDING', 'PENDING_MANAGER', 'PENDING_HR', 'WAITING', 'DRAFT', 'قيد الانتظار'].includes(status);
    }).length || leavesPendingCount;

  return (
    <div className="w-full space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>مؤشرات الأداء المالية والإدارية (Dafthra Analytics)</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">بيانات حية • KWD</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between max-h-[210px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-800">معدل الحضور الأسبوعي</span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +2.4%
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '10px',
                  }}
                />
                <Bar dataKey="حضور" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between max-h-[210px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-800">توزيع الرواتب (د.ك)</span>
            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {empCount} موظف
            </span>
          </div>
          <div className="h-28 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payrollDeptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {payrollDeptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '10px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between max-h-[210px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-800">طلبات الإجازات النشطة</span>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {pendingLeaves} بانتظار الاعتماد
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leavesStatusData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={65} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '10px',
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
