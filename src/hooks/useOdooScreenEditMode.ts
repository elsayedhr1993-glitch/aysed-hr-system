import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseOdooScreenEditModeOptions<T> {
  /** When true, screen opens directly in edit mode (e.g. create forms). */
  startInEditMode?: boolean;
  /** External source of truth; when it changes and not editing, draft resets. */
  source: T | null;
}

export function useOdooScreenEditMode<T>({
  source,
  startInEditMode = false,
}: UseOdooScreenEditModeOptions<T>) {
  const [isEditMode, setIsEditMode] = useState(startInEditMode);
  const [draft, setDraft] = useState<T | null>(source);
  const snapshotRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isEditMode && source !== null && source !== undefined) {
      setDraft(source);
      snapshotRef.current = null;
    }
  }, [source, isEditMode]);

  const enterEditMode = useCallback(() => {
    if (draft !== null && draft !== undefined) {
      snapshotRef.current = JSON.parse(JSON.stringify(draft)) as T;
    }
    setIsEditMode(true);
  }, [draft]);

  const discardEdits = useCallback(() => {
    const snap = snapshotRef.current;
    if (snap !== null) {
      setDraft(snap);
    } else if (source !== null && source !== undefined) {
      setDraft(source);
    }
    snapshotRef.current = null;
    setIsEditMode(false);
  }, [source]);

  const exitEditModeAfterSave = useCallback(() => {
    snapshotRef.current = null;
    setIsEditMode(false);
  }, []);

  const patchDraft = useCallback((patch: Partial<T>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  return {
    draft,
    setDraft,
    patchDraft,
    setField,
    isEditMode,
    enterEditMode,
    discardEdits,
    exitEditModeAfterSave,
    setIsEditMode,
  };
}
