import React, { useState } from 'react';
import { FileText, Printer, Download, Search, CheckCircle2, Building2, FileCheck, AlertTriangle } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { downloadTextFile } from '../utils/exportUtils';
import { toast } from 'react-hot-toast';

export const OdooTemplatesApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [selectedTemplate, setSelectedTemplate] = useState<'salary_cert' | 'to_whom' | 'clearance' | 'warning' | 'eos_settlement'>('salary_cert');
  const [empName, setEmpName] = useState('أحمد محمود الكندري');
  const [civilId, setCivilId] = useState('290010112345');
  const [jobTitle, setJobTitle] = useState('طبيب استشاري باطنية');
  const [salary, setSalary] = useState('1650.000');
  const [joinDate, setJoinDate] = useState('2020-03-01');
  const [serviceYears, setServiceYears] = useState('6.5');
  const [eosAmount, setEosAmount] = useState('4875.000');

  const companyDisplayName = activeCompany?.nameAr || 'مستوصف المنار كلينك الطبي';

  // Download Document as Text / Document file
  const handleDownloadDocument = () => {
    let docTitle = '';
    let bodyText = '';

    if (selectedTemplate === 'salary_cert') {
      docTitle = `شهادة_تفصيل_راتب_${empName}`;
      bodyText = `==========================================================\n${companyDisplayName}\nالتاريخ: ${new Date().toLocaleDateString('ar-KW')}\nالمرجع: HR-SAL-CERT-${civilId}\n==========================================================\n\nشهادة تفصيل راتب واستمرارية تحويل\n\nتشهد إدارة ${companyDisplayName} بأن السيد/ ${empName}، حامل البطاقة المدنية رقم (${civilId})، يعمل لدينا بمهنة (${jobTitle}).\nويتقاضى راتباً شهرياً إجمالياً قدره (${salary} د.ك) فقط لا غير، ويحول راتبه بانتظام عبر نظام حماية الأجور (WPS).\n\nوقد أُعطيت له هذه الشهادة بناءً على طلبه دون أدنى مسؤولية مالية أو قانونية على المنشأة تجاه الغير.\n\nالختم الرسمي للمنشأة            مدير الموارد البشرية والشؤون الإدارية`;
    } else if (selectedTemplate === 'to_whom') {
      docTitle = `شهادة_لمن_يهمه_الأمر_${empName}`;
      bodyText = `==========================================================\n${companyDisplayName}\nالتاريخ: ${new Date().toLocaleDateString('ar-KW')}\nالمرجع: HR-TO-WHOM-${civilId}\n==========================================================\n\nشهادة لمن يهمه الأمر\n\nتفيد إدارة المنشأة بأن الموظف/ ${empName}، الرقم المدني: ${civilId}، على رأس عمله ويمارس مهامه الوظيفية كـ ${jobTitle} حتى تاريخه.\nوقد أُعطيت له هذه الشهادة لتقديمها إلى الجهات الرسمية المختصة بناءً على طلبه دون أدنى مسؤولية على المنشأة.\n\nالختم الرسمي للمنشأة            مدير الموارد البشرية والشؤون الإدارية`;
    } else if (selectedTemplate === 'clearance') {
      docTitle = `إبراء_ذمة_ومخالصة_${empName}`;
      bodyText = `==========================================================\n${companyDisplayName}\nالتاريخ: ${new Date().toLocaleDateString('ar-KW')}\nالمرجع: HR-CLEAR-${civilId}\n==========================================================\n\nكتاب إبراء ذمة ومخالصة نهائية وبراءة طرف\n\nتعلن إدارة ${companyDisplayName} بموجب هذا المستند براءة طرف السيد/ ${empName}، المدني: ${civilId}، والذي كان يشغل منصب ${jobTitle}.\nونقر بأن المذكور أعلاه قد سلّم كافة العهد والممتلكات الخاصة بالمنشأة، وليس له أو عليه أي مستحقات أو مطالبات مالية أو عينية أو إدارية مستقبلاً، وتعتبر ذمته مبرأة براءة تامة ونهائية.\n\nالختم الرسمي للمنشأة            مدير الموارد البشرية والشؤون الإدارية`;
    } else if (selectedTemplate === 'warning') {
      docTitle = `إنذار_إداري_${empName}`;
      bodyText = `==========================================================\n${companyDisplayName}\nالتاريخ: ${new Date().toLocaleDateString('ar-KW')}\nالمرجع: HR-WARN-${civilId}\n==========================================================\n\nكتاب إنذار إداري ولفت نظر رسمي\n\nإلى السيد/ ${empName}، المسمى الوظيفي: ${jobTitle}، المدني: ${civilId}.\nتوجه إليكم إدارة الموارد البشرية هذا الإنذار الإداري بسبب عدم الالتزام التام بساعات العمل المقررة وقوانين الحضور والانصراف المعتمدة بالمنشأة وفقاً لقانون العمل الأهلي الكويتي رقم 6 لسنة 2010.\nلذا يرجى تلافي هذه الملاحظات والالتزام التام لتفادي اتخاذ الإجراءات القانونية اللاحقة المنصوص عليها باللوائح الداخلية.\n\nالختم الرسمي للمنشأة            مدير الموارد البشرية والشؤون الإدارية`;
    } else {
      docTitle = `مستند_تصفية_نهاية_الخدمة_${empName}`;
      bodyText = `==========================================================\n${companyDisplayName}\nالتاريخ: ${new Date().toLocaleDateString('ar-KW')}\nالمرجع: HR-EOS-${civilId}\n==========================================================\n\nسند تصفية مستحقات نهاية الخدمة (وفق المادتين 51 و 53)\n\nالاسم: ${empName}\nالرقم المدني: ${civilId}\nالوظيفة: ${jobTitle}\nالراتب الشامل: ${salary} د.ك\nمدة الخدمة: ${serviceYears} سنوات (تاريخ الالتحاق: ${joinDate})\nصافي مكافأة نهاية الخدمة المستحقة: ${eosAmount} د.ك\n\nأقر أنا الموقع أدناه باستلامي لكافة مستحقاتي العمالية ونهاية الخدمة المذكورة أعلاه نقداً أو بحوالة بنكية، وليس لي أي حق في المطالبة بأي مبالغ أخرى.\n\nتوقيع الموظف: ...........................           مدير الموارد البشرية: ...........................`;
    }

    downloadTextFile(bodyText, `${docTitle}.txt`);
    toast.success('تم تنزيل نص الخطاب الرسمي بنجاح');
  };

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">نماذج وقوالب الخطابات الرسمية (Official Templates)</h1>
            <p className="text-xs text-slate-500 font-medium">المنشأة: <strong className="text-[#714B67]">{companyDisplayName}</strong> | صياغة وطباعة فورية للكتب المعتمدة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadDocument} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition"
          >
            <Download size={15} /> تنزيل المستند (.txt)
          </button>
          <button 
            onClick={() => safePrintAction('النموذج الرسمي A4')} 
            className="bg-[#714B67] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition hover:bg-[#714B67]/95 shadow-sm"
          >
            <Printer size={15} /> طباعة النموذج A4
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* اختيار النموذج وتعديل البيانات */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs print:hidden">
          <h3 className="font-bold text-slate-900 border-b pb-2">1. اختيار نوع الخطاب</h3>
          <div className="space-y-2">
            {[
              { id: 'salary_cert', label: 'شهادة راتب واستمرارية تحويل' },
              { id: 'to_whom', label: 'شهادة لمن يهمه الأمر (إثبات عمل)' },
              { id: 'clearance', label: 'إبراء ذمة ومخالصة نهائية' },
              { id: 'warning', label: 'كتاب لفت نظر / إنذار إداري' },
              { id: 'eos_settlement', label: 'تصفية نهاية الخدمة والمستحقات' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id as any)}
                className={`w-full text-right p-3 rounded-xl font-bold border transition cursor-pointer ${
                  selectedTemplate === t.id ? 'bg-[#714B67]/10 border-[#714B67] text-[#714B67]' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <h3 className="font-bold text-slate-900 border-b pb-2 pt-2">2. بيانات الموظف في الخطاب</h3>
          <div className="space-y-2.5">
            <div>
              <label className="block font-bold mb-1">اسم الموظف</label>
              <input type="text" value={empName} onChange={(e) => setEmpName(e.target.value)} className="w-full p-2 border rounded-lg font-bold outline-none focus:border-[#714B67]" />
            </div>
            <div>
              <label className="block font-bold mb-1">الرقم المدني</label>
              <input type="text" value={civilId} onChange={(e) => setCivilId(e.target.value)} className="w-full p-2 border rounded-lg font-mono outline-none focus:border-[#714B67]" />
            </div>
            <div>
              <label className="block font-bold mb-1">المسمى الوظيفي</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-[#714B67]" />
            </div>
            <div>
              <label className="block font-bold mb-1">الراتب الإجمالي (د.ك)</label>
              <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full p-2 border rounded-lg font-mono font-bold outline-none focus:border-[#714B67]" />
            </div>
            {selectedTemplate === 'eos_settlement' && (
              <>
                <div>
                  <label className="block font-bold mb-1">سنوات الخدمة</label>
                  <input type="text" value={serviceYears} onChange={(e) => setServiceYears(e.target.value)} className="w-full p-2 border rounded-lg font-mono outline-none focus:border-[#714B67]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">مبلغ نهاية الخدمة (د.ك)</label>
                  <input type="text" value={eosAmount} onChange={(e) => setEosAmount(e.target.value)} className="w-full p-2 border rounded-lg font-mono font-bold text-emerald-700 outline-none focus:border-[#714B67]" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* المعاينة الحية للخطاب A4 */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-md min-h-[500px] flex flex-col justify-between text-slate-900 print:border-0 print:shadow-none print:p-0">
          <div>
            <div className="flex justify-between items-center border-b-2 border-[#714B67] pb-4 mb-6">
              <div>
                <h2 className="text-base font-black text-[#714B67]">{companyDisplayName}</h2>
                <span className="text-[10px] text-slate-400 font-mono">دولة الكويت - القطاع الأهلي | ترخيص وزارة الصحة</span>
              </div>
              <div className="text-left font-mono text-[11px] text-slate-500">
                <div>التاريخ: {new Date().toLocaleDateString('ar-KW')}</div>
                <div>المرجع: HR-DOC-2026/{civilId.slice(-4) || '0091'}</div>
              </div>
            </div>

            {selectedTemplate === 'salary_cert' && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="text-center font-black text-sm text-[#714B67] underline mb-4">شهادة تفصيل راتب واستمرارية تحويل</div>
                <p>تشهد إدارة <strong>{companyDisplayName}</strong> بأن السيد/ <strong>{empName}</strong>، ويحمل البطاقة المدنية رقم (<strong>{civilId}</strong>)، يعمل لدينا بمهنة (<strong>{jobTitle}</strong>).</p>
                <p>ويتقاضى راتباً شهرياً إجمالياً قدره (<strong>{salary} د.ك</strong>) فقط لا غير، ويحول راتبه بانتظام عبر نظام حماية الأجور (WPS).</p>
                <p>وقد أُعطيت له هذه الشهادة بناءً على طلبه دون أدنى مسؤولية مالية أو قانونية على المنشأة تجاه الغير.</p>
              </div>
            )}

            {selectedTemplate === 'to_whom' && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="text-center font-black text-sm text-[#714B67] underline mb-4">شهادة لمن يهمه الأمر</div>
                <p>تفيد إدارة المنشأة بأن الموظف/ <strong>{empName}</strong>، المدني: <strong>{civilId}</strong>، على رأس عمله ويمارس مهامه الوظيفية كـ <strong>{jobTitle}</strong> حتى تاريخه.</p>
                <p>وقد أُعطيت له هذه الشهادة لتقديمها إلى الجهات الرسمية المختصة بناءً على طلبه دون أدنى مسؤولية على المنشأة.</p>
              </div>
            )}

            {selectedTemplate === 'clearance' && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="text-center font-black text-sm text-[#714B67] underline mb-4">كتاب إبراء ذمة ومخالصة نهائية وبراءة طرف</div>
                <p>تعلن إدارة <strong>{companyDisplayName}</strong> بموجب هذا المستند براءة طرف السيد/ <strong>{empName}</strong>، المدني: <strong>{civilId}</strong>، والذي كان يشغل منصب <strong>{jobTitle}</strong>.</p>
                <p>ونقر بأن المذكور أعلاه قد سلّم كافة العهد والممتلكات الخاصة بالمنشأة، وليس له أو عليه أي مستحقات أو مطالبات مالية أو عينية أو إدارية مستقبلاً، وتعتبر ذمته مبرأة براءة تامة ونهائية.</p>
              </div>
            )}

            {selectedTemplate === 'warning' && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="text-center font-black text-sm text-rose-700 underline mb-4">كتاب إنذار إداري ولفت نظر أول</div>
                <p>إلى السيد/ <strong>{empName}</strong>، المسمى الوظيفي: <strong>{jobTitle}</strong>، المدني: <strong>{civilId}</strong>.</p>
                <p>توجه إليكم إدارة الموارد البشرية هذا الإنذار الإداري بسبب عدم الالتزام التام بساعات العمل المقررة وقوانين الحضور والانصراف المعتمدة بالمنشأة وفقاً لقانون العمل الأهلي الكويتي.</p>
                <p>لذا يرجى تلافي هذه الملاحظات والالتزام التام لتفادي اتخاذ الإجراءات القانونية اللاحقة المنصوص عليها باللوائح الداخلية.</p>
              </div>
            )}

            {selectedTemplate === 'eos_settlement' && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="text-center font-black text-sm text-emerald-800 underline mb-4">سند تصفية مستحقات نهاية الخدمة والمخالصة المالية</div>
                <p>تم إعداد هذه المخالصة المالية للسيد/ <strong>{empName}</strong>، المدني: <strong>{civilId}</strong>، المسمى: <strong>{jobTitle}</strong>.</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between"><span>الراتب الشامل الأخير:</span> <strong className="font-mono">{salary} د.ك</strong></div>
                  <div className="flex justify-between"><span>مدة الخدمة المحتسبة:</span> <strong className="font-mono">{serviceYears} سنوات</strong></div>
                  <div className="flex justify-between border-t pt-2 text-emerald-700 font-black"><span>صافي مكافأة نهاية الخدمة (المادتين 51 و 53):</span> <span className="font-mono">{eosAmount} د.ك</span></div>
                </div>
                <p>يقر الطرف الثاني باستلامه كافة مستحقاته العمالية ونهاية الخدمة المبينة أعلاه، وتعتبر ذمة المنشأة مبرأة تماماً.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end border-t pt-6 text-xs mt-8">
            <div className="text-center">
              <span className="block font-bold">الختم الرسمي للمنشأة</span>
              <div className="w-20 h-20 border-2 border-dashed border-[#714B67]/40 rounded-full mx-auto mt-2 flex items-center justify-center text-[10px] text-[#714B67] font-bold">مستوصف المنار</div>
            </div>
            <div className="text-center">
              <span className="block font-bold">مدير الموارد البشرية والشؤون الإدارية</span>
              <div className="mt-8 font-serif font-bold text-[#714B67]">أحمد محمود الكندري</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OdooTemplatesApp;

