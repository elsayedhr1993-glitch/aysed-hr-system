import { useMemo, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { tokens } from '../design/tokens';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { MaskedValue } from '../components/ui/MaskedValue';
import { PageHeader } from '../components/ui/PageHeader';
import { RowActions } from '../components/ui/RowActions';
import { StatStrip } from '../components/ui/StatStrip';
import { StatusBadge } from '../components/ui/StatusBadge';

type DemoRow = {
  id: string;
  name: string;
  dept: string;
  amount: number;
  exception: 'warning' | 'danger' | null;
  exceptionLabel?: string;
};

const DEMO: readonly DemoRow[] = [
  { id: '1', name: 'نورة العلي', dept: 'المالية', amount: 120.5, exception: null },
  { id: '2', name: 'جابر حسين', dept: 'الموارد البشرية', amount: 0, exception: 'warning', exceptionLabel: 'ناقص مستند' },
  { id: '3', name: 'ليلى كرم', dept: 'العمليات', amount: 85, exception: null },
  { id: '4', name: 'سامي فهد', dept: 'المالية', amount: 40.25, exception: 'danger', exceptionLabel: 'انتهاء جواز' },
  { id: '5', name: 'هدى ناصر', dept: 'العمليات', amount: 0, exception: null },
  { id: '6', name: 'بدر سالم', dept: 'الموارد البشرية', amount: 15, exception: null },
];

const DEPARTMENTS = ['المالية', 'الموارد البشرية', 'العمليات'];

export function DevUiPreview() {
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [dept, setDept] = useState('all');
  const [statId, setStatId] = useState('employees');
  const [role, setRole] = useState('EMPLOYEE');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const searched = useMemo(
    () =>
      DEMO.filter((row) => {
        if (dept !== 'all' && row.dept !== dept) return false;
        if (query.trim() && !row.name.includes(query.trim())) return false;
        return true;
      }),
    [dept, query],
  );

  const rows = searched.filter((row) => {
    if (statId === 'loans') return row.amount === 0;
    if (segment === 'exception') return Boolean(row.exception);
    if (segment === 'clear') return !row.exception;
    return true;
  });

  const exceptionCount = DEMO.filter((row) => row.exception).length;
  const net = DEMO.reduce((sum, row) => sum + row.amount, 0);

  const clearFilters = () => {
    setQuery('');
    setSegment('all');
    setDept('all');
    setStatId('employees');
  };

  return (
    <main
      data-ui="dev-preview"
      style={{
        maxWidth: '64rem',
        marginInline: 'auto',
        paddingBlock: tokens.space[4],
        fontFamily: 'var(--font-sans)',
      }}
    >
      <p style={{ paddingInline: tokens.space[4], color: tokens.color.gray[500], fontSize: tokens.text.xs }}>
        معاينة تطوير فقط. غير متاحة في الإنتاج.
      </p>
      <PageHeader
        title="الموظفون"
        subtitle="مكونات مشتركة للمرحلة 6"
        primaryAction={{ label: 'إضافة', onClick: () => setNotice('الزر الأساسي جاهز') }}
        menu={[
          { id: 'export', label: 'تصدير القائمة', onSelect: () => setNotice('التصدير من القائمة') },
          { id: 'archive', label: 'أرشفة الدفعة', onSelect: () => setNotice('الأرشفة من القائمة') },
        ]}
      />
      <StatStrip
        activeId={statId}
        onSelect={(id) => {
          setStatId(id);
          if (id === 'exceptions') setSegment('exception');
          if (id === 'employees' || id === 'net') setSegment('all');
        }}
        items={[
          { id: 'employees', label: 'الموظفون', value: DEMO.length },
          { id: 'exceptions', label: 'الاستثناءات', value: exceptionCount },
          { id: 'net', label: 'الصافي', value: net, kind: 'money' },
          { id: 'loans', label: 'السلف', value: 0, kind: 'money' },
        ]}
      />
      <FilterBar
        search={query}
        onSearch={setQuery}
        searchPlaceholder="بحث بالاسم"
        segments={[
          { id: 'all', label: 'الكل', count: searched.length },
          { id: 'exception', label: 'استثناء', count: searched.filter((row) => row.exception).length },
          { id: 'clear', label: 'سليم', count: searched.filter((row) => !row.exception).length },
        ]}
        activeSegment={segment}
        onSegment={(id) => {
          setSegment(id);
          if (statId === 'loans') setStatId('employees');
        }}
        dropdowns={[
          {
            id: 'dept',
            label: 'القسم',
            value: dept,
            onChange: setDept,
            options: [
              { value: 'all', label: 'كل الأقسام' },
              ...DEPARTMENTS.map((name) => ({ value: name, label: name })),
            ],
          },
        ]}
      />
      {notice ? (
        <p style={{ paddingInline: tokens.space[4], paddingBlock: tokens.space[2], fontSize: tokens.text.xs, color: tokens.color.gray[700] }}>
          {notice}
        </p>
      ) : null}
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        pageSize={4}
        empty={{ message: 'لا توجد صفوف مطابقة', actionLabel: 'مسح التصفية', onAction: clearFilters }}
        columns={[
          { id: 'name', header: 'الاسم', cell: (row) => row.name, total: () => null },
          { id: 'dept', header: 'القسم', hideable: true, cell: (row) => row.dept },
          {
            id: 'amount',
            header: 'المبلغ',
            money: true,
            hideable: true,
            cell: (row) => row.amount,
            total: (list) => list.reduce((sum, row) => sum + row.amount, 0),
          },
          {
            id: 'exception',
            header: 'استثناء',
            cell: (row) =>
              row.exception ? <StatusBadge tone={row.exception}>{row.exceptionLabel || 'استثناء'}</StatusBadge> : '—',
          },
          {
            id: 'actions',
            header: 'إجراءات',
            cell: (row) => (
              <RowActions
                actions={[
                  { id: 'view', label: 'عرض', icon: Eye, onSelect: () => setNotice(`عرض ${row.name}`) },
                  { id: 'edit', label: 'تعديل', icon: Pencil, onSelect: () => setNotice(`تعديل ${row.name}`) },
                ]}
                menu={[{ id: 'remove', label: 'حذف السجل', onSelect: () => setConfirmOpen(true) }]}
              />
            ),
          },
        ]}
      />
      <section
        style={{
          paddingInline: tokens.space[4],
          paddingBlock: tokens.space[4],
          marginBlockStart: tokens.space[4],
        }}
      >
        <div className="flex items-center" style={{ columnGap: tokens.space[3], marginBlockEnd: tokens.space[3] }}>
          <h2 className="font-bold" style={{ fontSize: tokens.text.sm, color: tokens.color.gray[900] }}>
            الرقم المدني والجواز
          </h2>
          <label style={{ fontSize: tokens.text.xs, color: tokens.color.gray[700], marginInlineStart: 'auto' }}>
            الدور
            <select
              aria-label="دور المعاينة"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              style={{
                marginInlineStart: tokens.space[2],
                paddingInline: tokens.space[2],
                paddingBlock: tokens.space[1],
                border: `1px solid ${tokens.color.gray[200]}`,
                borderRadius: tokens.radius.md,
              }}
            >
              <option value="EMPLOYEE">موظف</option>
              <option value="HR_MANAGER">مدير الموارد البشرية</option>
              <option value="FINANCE">المالية</option>
            </select>
          </label>
        </div>
        <p style={{ fontSize: tokens.text.sm, color: tokens.color.gray[900] }}>
          مدني <MaskedValue kind="civil" role={role} value="200000000001" purpose="dev-ui" />
        </p>
        <p style={{ fontSize: tokens.text.sm, color: tokens.color.gray[900], marginBlockStart: tokens.space[2] }}>
          جواز <MaskedValue kind="passport" role={role} value="P0000001" purpose="dev-ui" />
        </p>
        <div className="flex" style={{ columnGap: tokens.space[2], marginBlockStart: tokens.space[3] }}>
          <StatusBadge tone="success">سُوّي</StatusBadge>
          <StatusBadge tone="warning">ناقص مستند</StatusBadge>
          <StatusBadge tone="danger">منتهي</StatusBadge>
        </div>
      </section>
      <ConfirmDialog
        open={confirmOpen}
        title="حذف السجل"
        message="هذا إجراء خطِر. لن يُحذف شيء من هذه المعاينة."
        confirmWord="حذف"
        confirmLabel="تأكيد الحذف"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          setNotice('أُكّد الإجراء بعد كتابة كلمة التأكيد');
        }}
      />
    </main>
  );
}
