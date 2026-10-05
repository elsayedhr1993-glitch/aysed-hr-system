import React from 'react';
import { Sparkles } from 'lucide-react';
import { useCopilotContext } from '../../context/CopilotContext';
import { AysedAICopilot } from '../AysedAICopilot';
import { useAuth } from '../../context/AuthContext';

/** Global FAB + copilot drawer host. */
export const CopilotShell: React.FC = () => {
  const { isOpen, open, close, runtime } = useCopilotContext();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={open}
          className="fixed z-[45] bottom-6 left-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#714B67] to-[#261928] text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-amber-400/40 cursor-pointer"
          title="مساعد Aysed HR Copilot"
          aria-label="فتح مساعد الذكاء الاصطناعي"
        >
          <Sparkles className="w-7 h-7 text-amber-300" strokeWidth={2} />
        </button>
      )}

      <AysedAICopilot
        isOpen={isOpen}
        onClose={close}
        companyId={runtime.companyId}
        activeCompany={runtime.activeCompany}
        employees={runtime.employees}
        contracts={runtime.contracts}
        leaveSummary={runtime.leaveSummary}
      />
    </>
  );
};
