import { useEffect } from 'react';
import { useCopilotContext } from '../../context/CopilotContext';

/** Binds copilot open() to parent ref (TopEnterpriseActionBar lives outside inner tree). */
export function CopilotAppBridge({ onBindOpen }: { onBindOpen: (open: () => void) => void }) {
  const { open } = useCopilotContext();
  useEffect(() => {
    onBindOpen(open);
  }, [open, onBindOpen]);
  return null;
}
