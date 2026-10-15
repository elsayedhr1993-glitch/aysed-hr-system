import { useEffect, useState } from 'react';
import { MaskedValueView, type MaskedValueViewProps } from './MaskedValueView';

export type MaskedValueProps = Omit<MaskedValueViewProps, 'role'> & {
  /** Pass a role to mask without reading the session. Omit it to use the signed-in role. */
  role?: string | null;
};

export function MaskedValue(props: MaskedValueProps) {
  if (props.role !== undefined) return <MaskedValueView {...props} role={props.role} />;
  return <SessionMaskedValueGate {...props} />;
}

function SessionMaskedValueGate(props: Omit<MaskedValueProps, 'role'>) {
  const [Connected, setConnected] = useState<typeof import('./SessionMaskedValue').SessionMaskedValue | null>(null);

  useEffect(() => {
    let live = true;
    void import('./SessionMaskedValue').then((mod) => {
      if (live) setConnected(() => mod.SessionMaskedValue);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!Connected) return <MaskedValueView {...props} role="" />;
  return <Connected {...props} />;
}
