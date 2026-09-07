import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignRight, 
  AlignCenter, 
  AlignLeft, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Table as TableIcon, 
  Undo, 
  Redo, 
  RemoveFormatting, 
  Sparkles, 
  Type, 
  Palette,
  Minus,
  CheckCircle2,
  Code2
} from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (content: string) => void;
  employeeGender?: 'male' | 'female';
  minHeight?: string;
  useLetterhead?: boolean;
}

export const SMART_PLACEHOLDERS = [
  {
    category: 'بيانات الموظف',
    items: [
      { tag: '{اسم_الموظف}', label: 'اسم الموظف' },
      { tag: '{الرقم_المدني}', label: 'الرقم المدني' },
      { tag: '{المسمى_الوظيفي}', label: 'المسمى الوظيفي' },
      { tag: '{القسم}', label: 'القسم / الإدارة' },
      { tag: '{الجنسية}', label: 'الجنسية' },
      { tag: '{تاريخ_المباشرة}', label: 'تاريخ التعيين' },
      { tag: '{نهاية_العقد}', label: 'تاريخ نهاية العقد' },
    ]
  },
  {
    category: 'الضبط اللغوي (تذكير / تأنيث)',
    items: [
      { tag: '{السيد_السيدة}', label: 'السيد / السيدة' },
      { tag: '{المذكور_المذكورة}', label: 'المذكور / المذكورة' },
      { tag: '{يعمل_تعمل}', label: 'يعمل / تعمل' },
      { tag: '{بصفته_بصفتها}', label: 'بصفته / بصفتها' },
      { tag: '{مكفولها_مكفولتها}', label: 'مكفولها / مكفولتها' },
      { tag: '{العامل_العاملة}', label: 'العامل / العاملة' },
      { tag: '{له_لها}', label: 'له / لها' },
    ]
  },
  {
    category: 'المالية والتفقيت',
    items: [
      { tag: '{الراتب_الشامل}', label: 'الراتب الإجمالي' },
      { tag: '{الراتب_الأساسي}', label: 'الراتب الأساسي' },
      { tag: '{بدل_السكن}', label: 'بدل السكن' },
      { tag: '{بدل_الانتقال}', label: 'بدل الانتقال' },
      { tag: '{تفقيت_الراتب}', label: 'تفقيت الراتب بالدينار' },
      { tag: '{اسم_البنك}', label: 'اسم البنك' },
      { tag: '{الآيبان}', label: 'رقم الآيبان IBAN' },
      { tag: '{مكافأة_نهاية_الخدمة}', label: 'مكافأة الخدمة' },
      { tag: '{تفقيت_نهاية_الخدمة}', label: 'تفقيت مكافأة الخدمة' },
    ]
  },
  {
    category: 'بيانات المنشأة والتوثيق',
    items: [
      { tag: '{اسم_الشركة}', label: 'اسم الشركة' },
      { tag: '{السجل_التجاري}', label: 'السجل التجاري' },
      { tag: '{الرقم_الآلي}', label: 'رقم PACI' },
      { tag: '{تاريخ_اليوم}', label: 'تاريخ اليوم' },
      { tag: '{الرقم_المرجعي}', label: 'الرقم المرجعي' },
    ]
  }
];

export const OdooRichDocumentEditor: React.FC<RichEditorProps> = ({
  value,
  onChange,
  employeeGender = 'male',
  minHeight = '650px',
  useLetterhead = true
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync incoming value to editor only if different
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  // Standard execCommand actions
  const format = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Insert Smart Placeholder at caret
  const insertPlaceholder = (tag: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const placeholderSpan = document.createElement('span');
        placeholderSpan.className = 'smart-tag font-mono font-bold text-[#714B67] bg-[#714B67]/10 px-1 py-0.5 rounded border border-[#714B67]/20 mx-0.5 select-all';
        placeholderSpan.contentEditable = 'false';
        placeholderSpan.innerText = tag;
        range.insertNode(placeholderSpan);
        
        // Move caret after inserted node
        range.setStartAfter(placeholderSpan);
        range.setEndAfter(placeholderSpan);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback append
        editorRef.current.innerHTML += `<span class="smart-tag font-mono font-bold text-[#714B67] bg-[#714B67]/10 px-1 py-0.5 rounded border border-[#714B67]/20 mx-0.5" contenteditable="false">${tag}</span>`;
      }
      handleInput();
    }
  };

  // Insert standard table
  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">البند</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">البيان</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">الملاحظات</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">نص البيان هنا</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">معتمد</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    format('insertHTML', tableHtml);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* 1. Main Rich Editor Toolbar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-700 select-none">
        
        {/* Font Style Buttons */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => format('bold')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="عريض (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('italic')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="مائل (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('underline')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="تسطير (Ctrl+U)"
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('strikeThrough')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="شطب"
          >
            <Strikethrough size={15} />
          </button>
        </div>

        {/* Headings & Blocks */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => format('formatBlock', '<h1>')}
            className="px-2 py-1 hover:bg-slate-100 rounded-lg text-xs font-black text-slate-800 transition cursor-pointer"
            title="عنوان رئيسي H1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => format('formatBlock', '<h2>')}
            className="px-2 py-1 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 transition cursor-pointer"
            title="عنوان فرعي H2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => format('formatBlock', '<p>')}
            className="px-2 py-1 hover:bg-slate-100 rounded-lg text-xs text-slate-600 transition cursor-pointer"
            title="فقرة عادية"
          >
            P
          </button>
        </div>

        {/* Alignments (RTL First) */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => format('justifyRight')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="محاذاة لليمين"
          >
            <AlignRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('justifyCenter')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="توسيط"
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('justifyLeft')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="محاذاة لليسار"
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('justifyFull')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="ضبط النص (Justify)"
          >
            <AlignJustify size={15} />
          </button>
        </div>

        {/* Lists & Insertables */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => format('insertUnorderedList')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="قائمة نقطية"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('insertOrderedList')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="قائمة رقمية"
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="إدراج جدول"
          >
            <TableIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('insertHorizontalRule')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="فاصل أفقي"
          >
            <Minus size={15} />
          </button>
        </div>

        {/* Colors & Utilities */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <label className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer flex items-center gap-1" title="لون النص">
            <Palette size={15} />
            <input
              type="color"
              className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
              onChange={(e) => format('foreColor', e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => format('removeFormat')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition cursor-pointer"
            title="مسح التنسيق"
          >
            <RemoveFormatting size={15} />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs mr-auto">
          <button
            type="button"
            onClick={() => format('undo')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="تراجع (Ctrl+Z)"
          >
            <Undo size={15} />
          </button>
          <button
            type="button"
            onClick={() => format('redo')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
            title="إعادة (Ctrl+Y)"
          >
            <Redo size={15} />
          </button>
        </div>

      </div>

      {/* 2. Smart Placeholders Quick Bar */}
      <div className="p-3 bg-purple-50/50 border-b border-purple-100 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-[#714B67]">
            <Sparkles size={14} />
            <span>لوحة الحقول الذكية (Dynamic Placeholders) - انقر للإدراج فوراً مكان المؤشر:</span>
          </div>
          <div className="text-[11px] font-mono text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded-md font-bold">
            جنس الموظف: {employeeGender === 'female' ? 'أنثى (تأنيث الصياغة)' : 'ذكر (تذكير الصياغة)'}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {SMART_PLACEHOLDERS.map((cat, catIdx) => (
            <React.Fragment key={cat.category}>
              {cat.items.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => insertPlaceholder(item.tag)}
                  className="bg-white hover:bg-[#714B67] hover:text-white text-slate-700 border border-purple-200 hover:border-[#714B67] px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  title={`إدراج ${item.label}`}
                >
                  <span>+</span>
                  <span>{item.label}</span>
                </button>
              ))}
              {catIdx < SMART_PLACEHOLDERS.length - 1 && (
                <span className="text-purple-300 self-center px-1">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. A4 Paper Canvas Editor */}
      <div className="p-6 md:p-8 bg-slate-200/60 overflow-y-auto flex justify-center print:bg-white print:p-0">
        <div 
          className="bg-white text-slate-900 shadow-xl print:shadow-none w-full max-w-[210mm] p-8 md:p-12 relative border border-slate-200 rounded-sm"
          style={{
            minHeight,
            fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
            lineHeight: 1.9,
            direction: 'rtl',
            textAlign: 'right',
            paddingTop: useLetterhead ? '40px' : '48mm'
          }}
        >
          {/* Header indicator in editor */}
          {!useLetterhead && (
            <div className="text-center font-mono text-[10px] text-slate-300 pb-4 border-b border-dashed border-slate-200 mb-6 select-none" contentEditable="false">
              --- منطقة الهامش المخصص لورق المنشأة المطبوع مسبقاً (48mm) ---
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="outline-none min-h-[500px] text-sm md:text-[14.5px] focus:ring-0 leading-relaxed text-slate-900 font-normal"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between px-4 font-mono">
        <span>محرر وثائق Odoo 18 الاحترافي - ورقة قياس A4 معتمدة</span>
        <span>اتجاه النص: العربية (RTL) | التنسيق: HTML5 غني</span>
      </div>

    </div>
  );
};

export default OdooRichDocumentEditor;
