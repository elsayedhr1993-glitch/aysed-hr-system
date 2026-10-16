/** Code defaults for the app launcher. Stored rows override display fields only. */

export const LAUNCHER_GROUPS = [
  'people',
  'recruitment',
  'time',
  'payroll',
  'documents',
  'reports',
  'admin',
] as const;

export type LauncherGroupId = (typeof LAUNCHER_GROUPS)[number];

export const LAUNCHER_ICONS = [
  'Users',
  'UserPlus',
  'FileSignature',
  'Calendar',
  'Clock',
  'Banknote',
  'BarChart3',
  'FolderKanban',
  'Scan',
  'Briefcase',
  'ShieldCheck',
  'FileText',
] as const;

export type LauncherIconName = (typeof LAUNCHER_ICONS)[number];

/** `employee` matches the three apps the employee role already opens. */
export type LauncherPermission = 'employee' | 'staff';

export interface LauncherTileDefault {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: LauncherIconName;
  group: LauncherGroupId;
  /** Order inside the default group. */
  order: number;
  /** Order of the card grid before any saved order. */
  catalogIndex: number;
  visible: boolean;
  permission: LauncherPermission;
}

export const LAUNCHER_TILE_DEFAULTS: readonly LauncherTileDefault[] = [
  { id: 'EMPLOYEES', titleAr: 'الموظفون', titleEn: 'Employees', icon: 'Users', group: 'people', order: 10, catalogIndex: 0, visible: true, permission: 'staff' },
  { id: 'RECRUITMENT', titleAr: 'التوظيف والمقابلات', titleEn: 'Recruitment', icon: 'UserPlus', group: 'recruitment', order: 10, catalogIndex: 1, visible: true, permission: 'staff' },
  { id: 'CONTRACTS', titleAr: 'عقود العمل', titleEn: 'Contracts', icon: 'FileSignature', group: 'people', order: 20, catalogIndex: 2, visible: true, permission: 'staff' },
  { id: 'LEAVES', titleAr: 'الإجازات', titleEn: 'Time Off', icon: 'Calendar', group: 'time', order: 20, catalogIndex: 3, visible: true, permission: 'employee' },
  { id: 'HOLIDAYS', titleAr: 'العطلات الرسمية', titleEn: 'Holidays', icon: 'Calendar', group: 'time', order: 30, catalogIndex: 4, visible: true, permission: 'staff' },
  { id: 'ATTENDANCE', titleAr: 'الحضور والدوام', titleEn: 'Attendance', icon: 'Clock', group: 'time', order: 10, catalogIndex: 5, visible: true, permission: 'employee' },
  { id: 'PAYROLL', titleAr: 'الرواتب وحماية الأجور', titleEn: 'Payroll & WPS', icon: 'Banknote', group: 'payroll', order: 10, catalogIndex: 6, visible: true, permission: 'staff' },
  { id: 'REPORTS', titleAr: 'التقارير', titleEn: 'Reports', icon: 'BarChart3', group: 'reports', order: 10, catalogIndex: 7, visible: true, permission: 'staff' },
  { id: 'DOCUMENTS', titleAr: 'المستندات', titleEn: 'Documents', icon: 'FolderKanban', group: 'documents', order: 10, catalogIndex: 8, visible: true, permission: 'employee' },
  { id: 'SCANNER_APP', titleAr: 'الماسح الذكي', titleEn: 'Smart Scanner', icon: 'Scan', group: 'documents', order: 30, catalogIndex: 9, visible: true, permission: 'staff' },
  { id: 'CUSTODY_LOANS', titleAr: 'العهد', titleEn: 'Assets', icon: 'Briefcase', group: 'people', order: 30, catalogIndex: 10, visible: true, permission: 'staff' },
  { id: 'AUDIT_LOGS', titleAr: 'سجل الرقابة', titleEn: 'Audit Log', icon: 'ShieldCheck', group: 'admin', order: 10, catalogIndex: 11, visible: true, permission: 'staff' },
  { id: 'DOCUMENT_TEMPLATES', titleAr: 'قوالب ونماذج المستندات', titleEn: 'Document Templates', icon: 'FileText', group: 'documents', order: 20, catalogIndex: 12, visible: true, permission: 'staff' },
];

const BY_ID = new Map(LAUNCHER_TILE_DEFAULTS.map((tile) => [tile.id, tile]));

export function launcherTileById(id: string): LauncherTileDefault | undefined {
  return BY_ID.get(id);
}

export function isLauncherIcon(value: unknown): value is LauncherIconName {
  return typeof value === 'string' && (LAUNCHER_ICONS as readonly string[]).includes(value);
}

export function isLauncherGroup(value: unknown): value is LauncherGroupId {
  return typeof value === 'string' && (LAUNCHER_GROUPS as readonly string[]).includes(value);
}

export function isLauncherPermission(value: unknown): value is LauncherPermission {
  return value === 'employee' || value === 'staff';
}

export function launcherTileKey(id: string): string {
  return `launcher.app.${id}`;
}

export function launcherTileIdFromKey(key: string): string | null {
  if (!key.startsWith('launcher.app.')) return null;
  const id = key.slice('launcher.app.'.length);
  return launcherTileById(id) ? id : null;
}

/**
 * Who may open the app. Uses the code permission only.
 * A saved permission, and hidden/visible, are not consulted.
 */
export function launcherTileAllowed(role: string | undefined | null, tileId: string): boolean {
  const tile = launcherTileById(tileId);
  if (!tile) return false;
  if (String(role || '').trim().toUpperCase() === 'EMPLOYEE') return tile.permission === 'employee';
  return true;
}

export interface LauncherTileOverride {
  label?: { ar?: string; en?: string };
  icon?: string;
  group?: string;
  order?: number;
  hidden?: boolean;
  permission?: string;
}

export interface ResolvedLauncherTile {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: LauncherIconName;
  group: LauncherGroupId;
  order: number;
  catalogIndex: number;
  hidden: boolean;
  /** Always the code permission, even when a different value is stored. */
  permission: LauncherPermission;
  storedPermission: LauncherPermission;
}

export function resolveLauncherTile(
  id: string,
  override?: LauncherTileOverride | null
): ResolvedLauncherTile | null {
  const tile = launcherTileById(id);
  if (!tile) return null;
  const storedPermission = isLauncherPermission(override?.permission) ? override.permission : tile.permission;
  return {
    id: tile.id,
    titleAr: override?.label?.ar?.trim() || tile.titleAr,
    titleEn: override?.label?.en?.trim() || tile.titleEn,
    icon: isLauncherIcon(override?.icon) ? override.icon : tile.icon,
    group: isLauncherGroup(override?.group) ? override.group : tile.group,
    order: typeof override?.order === 'number' && Number.isFinite(override.order) ? override.order : tile.order,
    catalogIndex: tile.catalogIndex,
    hidden: Boolean(override?.hidden),
    permission: tile.permission,
    storedPermission,
  };
}

/** Display on the launcher. Hiding removes the tile and does not change launcherTileAllowed. */
export function launcherTileShown(
  role: string | undefined | null,
  tileId: string,
  override?: LauncherTileOverride | null
): boolean {
  if (!launcherTileAllowed(role, tileId)) return false;
  const resolved = resolveLauncherTile(tileId, override);
  return Boolean(resolved && !resolved.hidden);
}
