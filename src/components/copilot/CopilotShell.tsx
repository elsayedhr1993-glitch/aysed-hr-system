import React from 'react';
import { useCopilotContext } from '../../context/CopilotContext';
import { AysedAICopilot } from '../AysedAICopilot';
import { useAuth } from '../../context/AuthContext';

/** Global FAB + copilot drawer host. */
export const CopilotShell: React.FC = () => {
  const { isOpen, close, runtime } = useCopilotContext();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
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
