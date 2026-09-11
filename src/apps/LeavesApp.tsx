import React from 'react';

export interface LeavesAppProps {
  onNavigateToApp?: (app: any) => void;
}

export const LeavesApp: React.FC<LeavesAppProps> = ({ onNavigateToApp }) => {
  return (
    <div className="p-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-bold text-base">تطبيق الإجازات القديم تم إيقافه</div>
            <div className="mt-1 text-amber-800">
              هذا العرض مؤرشف ولا يُستخدم للتعديل. التشغيل الرسمي والإعتماد يمر عبر تطبيق الإجازات الرسمي فقط.
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToApp?.('leaves')}
            className="bg-[#714B67] hover:bg-[#5e3955] text-white text-xs font-bold px-4 py-2 rounded shadow"
          >
            فتح التطبيق الرسمي للإجازات
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeavesApp;
