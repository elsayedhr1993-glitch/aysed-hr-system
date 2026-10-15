import { useAuth } from '../../context/AuthContext';
import { MaskedValueView, type MaskedValueViewProps } from './MaskedValueView';

export function SessionMaskedValue(props: Omit<MaskedValueViewProps, 'role'>) {
  const { user } = useAuth();
  return <MaskedValueView {...props} role={user?.role} />;
}
