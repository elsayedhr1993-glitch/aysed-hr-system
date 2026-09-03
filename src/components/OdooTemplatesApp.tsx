import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { downloadTextFile } from '../utils/exportUtils';
import { toast } from 'react-hot-toast';

export const OdooTemplatesApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees } = useOdooHierarchy();

  const [selectedTemplate, setSelectedTemplate] = useState<'salary_cert' | 'to_whom' | 'clearance' | 'warning' | 'eos_settlement'>('salary_cert');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  
  const [empName, setEmpName] = useState('');
  const [civilId, setCivilId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('0.000');
  const [joinDate, setJoinDate] = useState('');
  const [serviceYears, setServiceYears] = useState('0');
  const [eosAmount, setEosAmount] = useState('0.000');

  const companyDisplayName = activeCompany?.nameAr || activeCompany?.name || '';

  // Auto-fill when employee is selected
  useEffect(() => {
    if (selectedEmpId) {
      const emp = employees.find(e => e.id === selectedEmpId);
      if (emp) {
        setEmpName(emp.name);
        setCivilId(emp.civilId);
        setJobTitle(emp.jobTitle);
        const totalSalary = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + (emp.medicalAllowance || 0);
        setSalary(totalSalary.toFixed(3));
        
        // Mock calculations for demo purposes
        setJoinDate('2021-01-15');
        setServiceYears('3.5');
        setEosAmount((totalSalary * 3.5 * 0.5).toFixed(3)); // Approx 15 days per year
      }
    }
  }, [selectedEmpId, employees]);

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
            <h1 className="text-xl font-black text-slate-900">النماذج والخطابات (Dynamic Generator)</h1>
            <p className="text-xs text-slate-500 font-medium">المنشأة: <strong className="text-[#714B67]">{companyDisplayName}</strong> | صياغة وطباعة فورية للكتب المعتمدة من قواعد البيانات</p>
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
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs print:hidden">
          
          <div>
            <h3 className="font-bold text-slate-900 border-b pb-2 mb-3">1. اختيار نوع الخطاب</h3>
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
                  className={`w-full text-right p-3 rounded-xl font-bold border transition cursor-pointer flex items-center justify-between ${
                    selectedTemplate === t.id ? 'bg-[#714B67]/10 border-[#714B67] text-[#714B67]' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{t.label}</span>
                  {selectedTemplate === t.id && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b pb-2 mb-3 pt-2">2. تحديد الموظف (جلب آلي)</h3>
            <div className="relative">
              <Users className="absolute right-3 top-2.5 text-slate-400" size={16} />
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl outline-none focus:border-[#714B67] font-bold text-slate-700 bg-slate-50 cursor-pointer appearance-none"
              >
                <option value="">-- اختر موظف من السجل --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.civilId})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block font-bold mb-1 text-slate-600">اسم الموظف</label>
              <input type="text" value={empName} onChange={(e) => setEmpName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg font-bold outline-none focus:border-[#714B67]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-slate-600">الرقم المدني</label>
                <input type="text" value={civilId} onChange={(e) => setCivilId(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg font-mono outline-none focus:border-[#714B67]" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-600">الراتب (د.ك)</label>
                <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold outline-none focus:border-[#714B67]" />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-600">المسمى الوظيفي</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-[#714B67]" />
            </div>
            
            {selectedTemplate === 'eos_settlement' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-600">سنوات الخدمة</label>
                  <input type="text" value={serviceYears} onChange={(e) => setServiceYears(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg font-mono outline-none focus:border-[#714B67]" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-emerald-700">المستحق (د.ك)</label>
                  <input type="text" value={eosAmount} onChange={(e) => setEosAmount(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg font-mono font-black text-emerald-700 outline-none focus:border-[#714B67]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* المعاينة الحية للخطاب A4 */}
        <div className="lg:col-span-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-md min-h-[650px] flex flex-col justify-between text-slate-900 print:border-0 print:shadow-none print:p-0">
          <div>
            <div className="flex justify-between items-center border-b-2 border-[#714B67] pb-6 mb-8 print:pb-4 print:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-100 rounded-xl border-2 border-[#714B67] flex items-center justify-center font-black text-[#714B67] text-xl">
                  {companyDisplayName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#714B67] leading-tight">{companyDisplayName}</h2>
                  <span className="text-[11px] text-slate-500 font-mono font-semibold">دولة الكويت - القطاع الأهلي | إدارة الموارد البشرية</span>
                </div>
              </div>
              <div className="text-left font-mono text-xs text-slate-500 space-y-1">
                <div>التاريخ: {new Date().toLocaleDateString('en-GB')}</div>
                <div>المرجع: HR-{new Date().getFullYear()}-{civilId.slice(-4) || '0091'}</div>
              </div>
            </div>

            <div className="px-4 print:px-0">
              {selectedTemplate === 'salary_cert' && (
                <div className="space-y-6 text-sm leading-8 font-medium">
                  <div className="text-center font-black text-xl text-slate-900 mb-8 border-b inline-block mx-auto border-slate-900 pb-1">شهادة تفصيل راتب واستمرارية تحويل</div>
                  <p className="text-justify text-base">
                    تشهد إدارة <strong>{companyDisplayName}</strong> بأن السيد/ة <strong>{empName}</strong>، ويحمل البطاقة المدنية رقم (<strong><span className="font-mono">{civilId}</span></strong>)، يعمل لدينا وتحت كفالتنا بمهنة (<strong>{jobTitle}</strong>).
                  </p>
                  <p className="text-justify text-base">
                    ويتقاضى راتباً شهرياً إجمالياً قدره (<strong><span className="font-mono">{salary}</span> د.ك</strong>) فقط لا غير، ويتم تحويل راتبه بانتظام إلى حسابه البنكي عبر نظام حماية الأجور (WPS) المعتمد في دولة الكويت.
                  </p>
                  <p className="text-justify text-base text-slate-600 mt-8">
                    وقد أُعطيت له هذه الشهادة بناءً على طلبه لتقديمها لمن يهمه الأمر، وذلك دون أدنى مسؤولية مالية أو قانونية على المنشأة تجاه الغير.
                  </p>
                </div>
              )}

              {selectedTemplate === 'to_whom' && (
                <div className="space-y-6 text-sm leading-8 font-medium">
                  <div className="text-center font-black text-xl text-slate-900 mb-8 border-b inline-block mx-auto border-slate-900 pb-1">شهادة لمن يهمه الأمر</div>
                  <p className="text-justify text-base">
                    تفيد إدارة المنشأة بأن الموظف/ <strong>{empName}</strong>، ويحمل الرقم المدني: <strong><span className="font-mono">{civilId}</span></strong>، لا يزال على رأس عمله ويمارس مهامه الوظيفية كـ (<strong>{jobTitle}</strong>) حتى تاريخ إصدار هذا الكتاب.
                  </p>
                  <p className="text-justify text-base text-slate-600 mt-8">
                    وقد أُعطيت له هذه الشهادة لتقديمها إلى الجهات الرسمية المختصة بناءً على طلبه، وذلك دون أدنى مسؤولية إدارية أو قانونية على المنشأة.
                  </p>
                </div>
              )}

              {selectedTemplate === 'clearance' && (
                <div className="space-y-6 text-sm leading-8 font-medium">
                  <div className="text-center font-black text-xl text-slate-900 mb-8 border-b inline-block mx-auto border-slate-900 pb-1">كتاب إبراء ذمة ومخالصة نهائية (براءة طرف)</div>
                  <p className="text-justify text-base">
                    تعلن إدارة <strong>{companyDisplayName}</strong> بموجب هذا المستند براءة طرف السيد/ <strong>{empName}</strong>، الرقم المدني: <strong><span className="font-mono">{civilId}</span></strong>، والذي كان يشغل منصب (<strong>{jobTitle}</strong>).
                  </p>
                  <p className="text-justify text-base">
                    ونقر نحن الإدارة بأن المذكور أعلاه قد سلّم كافة العهد العينية والممتلكات الخاصة بالمنشأة، وليس له أو عليه أي مستحقات أو مطالبات مالية أو عينية أو إدارية مستقبلاً.
                  </p>
                  <p className="text-justify text-base font-bold text-slate-800">
                    وبناءً عليه، تعتبر ذمته مبرأة براءة تامة ونهائية تجاه الشركة، ويسقط حقه وحق الشركة في أي مطالبات قانونية لاحقة بهذا الشأن.
                  </p>
                </div>
              )}

              {selectedTemplate === 'warning' && (
                <div className="space-y-6 text-sm leading-8 font-medium">
                  <div className="text-center font-black text-xl text-rose-800 mb-8 border-b inline-block mx-auto border-rose-800 pb-1">كتاب إنذار إداري (لفت نظر رسمي)</div>
                  
                  <div className="flex gap-4 p-4 border border-rose-200 bg-rose-50 rounded-xl mb-6 font-bold text-rose-900">
                    <AlertTriangle className="text-rose-600 shrink-0" />
                    <div>
                      <div>إلى السيد/ <strong>{empName}</strong></div>
                      <div className="text-xs font-mono mt-1 opacity-80">المدني: {civilId} | الوظيفة: {jobTitle}</div>
                    </div>
                  </div>

                  <p className="text-justify text-base">
                    توجه إليكم إدارة الموارد البشرية هذا الإنذار الإداري بسبب عدم الالتزام التام بالقوانين واللوائح الداخلية المعتمدة بالمنشأة، وذلك استناداً لأحكام قانون العمل الأهلي الكويتي رقم 6 لسنة 2010.
                  </p>
                  <p className="text-justify text-base text-rose-700 font-bold">
                    لذا، يرجى تلافي هذه الملاحظات فوراً والالتزام التام بواجباتكم الوظيفية.
                  </p>
                  <p className="text-justify text-base text-slate-600">
                    نود التنويه بأنه في حال تكرار المخالفة، ستضطر الإدارة لاتخاذ الإجراءات القانونية والإدارية اللاحقة المنصوص عليها في لائحة الجزاءات.
                  </p>
                </div>
              )}

              {selectedTemplate === 'eos_settlement' && (
                <div className="space-y-6 text-sm leading-8 font-medium">
                  <div className="text-center font-black text-xl text-emerald-800 mb-8 border-b inline-block mx-auto border-emerald-800 pb-1">سند مخالصة وتصفية مستحقات نهاية الخدمة</div>
                  <p className="text-justify text-base">
                    تم إعداد هذه المخالصة المالية النهائية للسيد/ <strong>{empName}</strong>، ويحمل الرقم المدني <strong><span className="font-mono">{civilId}</span></strong>، المسمى الوظيفي: <strong>{jobTitle}</strong>.
                  </p>
                  
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 my-6">
                    <div className="flex justify-between items-center text-base">
                      <span className="text-slate-600">الراتب الشامل الأخير المعتمد:</span> 
                      <strong className="font-mono text-lg">{salary} د.ك</strong>
                    </div>
                    <div className="flex justify-between items-center text-base">
                      <span className="text-slate-600">مدة الخدمة الفعلية المحتسبة:</span> 
                      <strong className="font-mono text-lg">{serviceYears} سنوات</strong>
                    </div>
                    <div className="flex justify-between items-center border-t-2 border-slate-200 pt-4 mt-2 text-emerald-800 font-black text-lg">
                      <span>صافي مكافأة نهاية الخدمة (وفق المادتين 51 و 53):</span> 
                      <span className="font-mono text-xl bg-emerald-100 px-3 py-1 rounded-lg">{eosAmount} د.ك</span>
                    </div>
                  </div>

                  <p className="text-justify text-base text-slate-600">
                    يقر الطرف الثاني (الموظف) باستلامه كافة مستحقاته العمالية ونهاية الخدمة المبينة أعلاه، وتعتبر ذمة المنشأة مبرأة تماماً من أي مطالبات مالية أو عمالية من تاريخه.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end border-t-2 border-slate-100 pt-8 mt-12 text-sm px-4 print:px-0">
            <div className="text-center w-48">
              <span className="block font-bold text-slate-500 mb-6">الختم الرسمي للمنشأة</span>
              <div className="w-24 h-24 border-[3px] border-dashed border-[#714B67]/30 rounded-full mx-auto flex items-center justify-center text-xs text-[#714B67] font-black transform -rotate-12 opacity-80 text-center leading-tight">
                {companyDisplayName.split(' ')[0]}<br/>للشؤون الإدارية
              </div>
            </div>
            
            {selectedTemplate === 'eos_settlement' && (
              <div className="text-center w-48">
                <span className="block font-bold text-slate-500 mb-12">توقيع الموظف (المقر بما فيه)</span>
                <div className="border-b-2 border-slate-400 border-dashed w-full mx-auto"></div>
                <div className="mt-2 font-bold text-slate-700 text-xs">{empName}</div>
              </div>
            )}

            <div className="text-center w-48">
              <span className="block font-bold text-slate-500 mb-12">إدارة الموارد البشرية</span>
              <div className="border-b-2 border-slate-400 border-dashed w-full mx-auto"></div>
              <div className="mt-2 font-black text-[#714B67] text-xs">المدير المختص</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OdooTemplatesApp;
