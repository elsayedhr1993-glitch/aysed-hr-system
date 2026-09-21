/** Compact tabs + minimal forms — default on (approved). */
export const EMPLOYEE_DETAIL_COMPACT_UI_DEFAULT = true;
export const LEAVES_COMPACT_UI_DEFAULT = true;

export const EMPLOYEE_DETAIL_COMPACT_STORAGE_KEY = 'aysed_employee_detail_compact_ui';
export const LEAVES_COMPACT_STORAGE_KEY = 'aysed_leaves_compact_ui';

function readCompactFlag(storageKey: string, defaultValue: boolean): boolean {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === '0' || raw === 'false') return false;
    if (raw === '1' || raw === 'true') return true;
  } catch {
    /* ignore */
  }
  return defaultValue;
}

export function readEmployeeDetailCompactPreference(): boolean {
  return readCompactFlag(EMPLOYEE_DETAIL_COMPACT_STORAGE_KEY, EMPLOYEE_DETAIL_COMPACT_UI_DEFAULT);
}

export function readLeavesCompactPreference(): boolean {
  return readCompactFlag(LEAVES_COMPACT_STORAGE_KEY, LEAVES_COMPACT_UI_DEFAULT);
}
