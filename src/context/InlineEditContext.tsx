import React, { createContext, useContext, useMemo } from 'react';

export type InlinePersistPatch = Record<string, string | number | boolean | null | undefined>;

type InlineEditContextValue = {
  persistPatch: (patch: InlinePersistPatch) => Promise<void>;
};

const InlineEditContext = createContext<InlineEditContextValue | null>(null);

export function InlineEditProvider({
  children,
  persistPatch,
}: {
  children: React.ReactNode;
  persistPatch: (patch: InlinePersistPatch) => Promise<void>;
}) {
  const value = useMemo(() => ({ persistPatch }), [persistPatch]);
  return <InlineEditContext.Provider value={value}>{children}</InlineEditContext.Provider>;
}

export function useInlineEditContext(): InlineEditContextValue | null {
  return useContext(InlineEditContext);
}

/** Build `onPersist` for EditableField from a primary field and optional mirrored Firestore keys. */
export function useFieldPersist(
  fieldKey?: string,
  mirrorKeys?: string[]
): ((value: string) => Promise<void>) | undefined {
  const ctx = useInlineEditContext();
  if (!ctx || !fieldKey) return undefined;
  return async (value: string) => {
    const patch: InlinePersistPatch = { [fieldKey]: value };
    if (mirrorKeys) {
      mirrorKeys.forEach((k) => {
        patch[k] = value;
      });
    }
    await ctx.persistPatch(patch);
  };
}
