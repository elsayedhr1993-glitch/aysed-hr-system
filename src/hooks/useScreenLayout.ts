import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useLayoutStudio } from '../context/LayoutStudioContext';
import { useLang } from '../lib/i18n';
import { subscribeScreenLayout } from '../services/customLayoutService';
import type { LayoutLocale, ResolvedScreenLayout, ScreenId } from '../types/customLayout';
import { getDefaultScreenLayout } from '../config/defaultLayouts';
import { mergeScreenLayout } from '../utils/customLayoutUtils';

export function useScreenLayout(screenId: ScreenId): {
  layout: ResolvedScreenLayout;
  loading: boolean;
  locale: LayoutLocale;
} {
  const { activeCompanyId, activeCompany } = useCompany();
  const { studioSession } = useLayoutStudio();
  const { lang } = useLang();
  const locale: LayoutLocale = lang === 'en' ? 'en' : 'ar';
  const companyId =
    activeCompanyId && activeCompanyId !== 'SAAS_PLATFORM'
      ? activeCompanyId
      : activeCompany?.id || '';

  const [layout, setLayout] = useState<ResolvedScreenLayout>(() =>
    mergeScreenLayout(getDefaultScreenLayout(screenId, companyId), null, companyId)
  );
  const [loading, setLoading] = useState(Boolean(companyId));

  useEffect(() => {
    if (!companyId) {
      setLayout(mergeScreenLayout(getDefaultScreenLayout(screenId, ''), null, ''));
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeScreenLayout(
      companyId,
      screenId,
      next => {
        setLayout(next);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [companyId, screenId]);

  useEffect(() => {
    if (!companyId || studioSession?.screenId !== screenId) return;
    setLayout(
      mergeScreenLayout(getDefaultScreenLayout(screenId, companyId), studioSession.draft, companyId)
    );
  }, [studioSession, screenId, companyId]);

  return { layout, loading, locale };
}
