import { doc, getDoc } from 'firebase/firestore';
import { db, getCompaniesCollectionName } from '../lib/firebase';
import { savePlatformPamForm } from './platformOwnerApi';
import { mergeSessionCompanyProfile } from './tenantProfileApi';
import {
  DEFAULT_PAM_COORDINATES,
  mergePamCoordinates,
  PAM_OVERLAY_SCHEMA_VERSION,
  PamCoordinatesConfig,
  PamFontChoice,
} from './pamContractPdfService';

function overlayLayerIsCurrent(version: unknown): boolean {
  return typeof version === 'number' && version >= PAM_OVERLAY_SCHEMA_VERSION;
}

const PLATFORM_COLLECTION = 'platform_settings';
const PLATFORM_PAM_DOC_ID = 'pam_form_2';

export type PamRenderSettings = {
  coords: PamCoordinatesConfig;
  font: PamFontChoice;
};

export async function fetchPlatformPamLayer(): Promise<{
  coords?: Partial<PamCoordinatesConfig>;
  font?: PamFontChoice;
}> {
  try {
    const snap = await getDoc(doc(db, PLATFORM_COLLECTION, PLATFORM_PAM_DOC_ID));
    if (!snap.exists()) return {};
    const data = snap.data();
    const coords = overlayLayerIsCurrent(data.pamOverlaySchemaVersion)
      ? (data.pamOverlayCoords as Partial<PamCoordinatesConfig> | undefined)
      : undefined;
    return {
      coords,
      font: (data.pamFontChoice as PamFontChoice) || undefined,
    };
  } catch {
    return {};
  }
}

export async function fetchCompanyRecord(companyId: string): Promise<Record<string, unknown> | null> {
  if (!companyId) return null;
  try {
    const snap = await getDoc(doc(db, getCompaniesCollectionName(), companyId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch {
    return null;
  }
}

export async function resolvePamRenderSettings(companyId?: string): Promise<PamRenderSettings> {
  const platform = await fetchPlatformPamLayer();
  let companyCoords: Partial<PamCoordinatesConfig> | undefined;
  let companyFont: PamFontChoice | undefined;

  if (companyId) {
    const record = await fetchCompanyRecord(companyId);
    if (record) {
      companyCoords = overlayLayerIsCurrent(record.pamOverlaySchemaVersion)
        ? (record.pamOverlayCoords as Partial<PamCoordinatesConfig> | undefined)
        : undefined;
      companyFont = (record.pamFontChoice as PamFontChoice) || undefined;
    }
  }

  return {
    coords: mergePamCoordinates(DEFAULT_PAM_COORDINATES, platform.coords, companyCoords),
    font: companyFont || platform.font || 'cairo',
  };
}

export async function saveCompanyPamSettings(
  _companyId: string,
  payload: { pamOverlayCoords?: PamCoordinatesConfig; pamFontChoice?: PamFontChoice }
): Promise<void> {
  await mergeSessionCompanyProfile({
    ...payload,
    pamOverlaySchemaVersion: PAM_OVERLAY_SCHEMA_VERSION,
    pamSettingsUpdatedAt: new Date().toISOString(),
  });
}

export async function savePlatformPamSettings(payload: {
  pamOverlayCoords: PamCoordinatesConfig;
  pamFontChoice?: PamFontChoice;
}): Promise<void> {
  await savePlatformPamForm({
    pamOverlayCoords: payload.pamOverlayCoords as unknown as Record<string, unknown>,
    pamFontChoice: payload.pamFontChoice,
    pamOverlaySchemaVersion: PAM_OVERLAY_SCHEMA_VERSION,
  });
}
