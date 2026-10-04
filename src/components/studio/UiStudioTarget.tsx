import React, { useCallback, useMemo } from 'react';
import { useLang } from '../../lib/i18n';
import { useUiStudio } from '../../context/UiStudioContext';
import type { UiElementDefaults, UiElementKind } from '../../types/uiOverrides';
import { pickUiHelp, pickUiLabel } from '../../utils/uiOverrideUtils';

export interface UiStudioTargetProps {
  uiKey: string;
  kind?: UiElementKind;
  defaults: UiElementDefaults;
  /** Group id for drag-and-drop reorder (register keys via parent) */
  reorderGroupId?: string;
  /** @deprecated use reorderGroupId + registerReorderGroup */
  reorderGroupKeys?: string[];
  className?: string;
  children?: React.ReactNode;
  respectHidden?: boolean;
  /** block | inline — match surrounding layout */
  display?: 'inline' | 'block' | 'contents';
}

export const UiStudioTarget: React.FC<UiStudioTargetProps> = ({
  uiKey,
  kind,
  defaults,
  reorderGroupId,
  reorderGroupKeys,
  className = '',
  children,
  respectHidden = true,
  display = 'inline',
}) => {
  const { lang } = useLang();
  const {
    canUseUiStudio,
    uiStudioActive,
    resolveElement,
    selection,
    selectElement,
    reorderInGroup,
  } = useUiStudio();

  const resolved = useMemo(
    () => resolveElement(uiKey, { ...defaults, kind: kind ?? defaults.kind }),
    [resolveElement, uiKey, defaults, kind]
  );

  const groupId =
    reorderGroupId ||
    (reorderGroupKeys?.length ? `legacy:${reorderGroupKeys.join('|')}` : undefined);

  const isSelected = selection?.uiKey === uiKey;
  const studioOn = canUseUiStudio && uiStudioActive;

  if (respectHidden && resolved.hidden && !studioOn) {
    return null;
  }

  const labelText = pickUiLabel(resolved, lang === 'en' ? 'en' : 'ar');
  const helpText = pickUiHelp(resolved, lang === 'en' ? 'en' : 'ar');

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      if (!studioOn) return;
      e.stopPropagation();
      selectElement({
        uiKey,
        defaults: { ...defaults, kind: kind ?? defaults.kind },
        kind: kind ?? defaults.kind,
        reorderGroupId: groupId,
      });
    },
    [studioOn, selectElement, uiKey, defaults, kind, groupId]
  );

  const onDragStart = (e: React.DragEvent) => {
    if (!studioOn || !groupId) return;
    e.stopPropagation();
    e.dataTransfer.setData('text/ui-studio-key', uiKey);
    e.dataTransfer.setData('text/ui-studio-group', groupId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!studioOn || !groupId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent) => {
    if (!studioOn || !groupId) return;
    e.preventDefault();
    e.stopPropagation();
    const fromKey = e.dataTransfer.getData('text/ui-studio-key');
    const fromGroup = e.dataTransfer.getData('text/ui-studio-group');
    if (!fromKey || fromGroup !== groupId || fromKey === uiKey) return;
    void reorderInGroup(groupId, fromKey, uiKey);
  };

  const displayClass =
    display === 'block' ? 'block w-full' : display === 'contents' ? 'contents' : 'inline';

  const inner = children ?? (
    <>
      <span>{labelText}</span>
      {helpText ? (
        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{helpText}</span>
      ) : null}
    </>
  );

  if (!studioOn) {
    return (
      <span className={`${displayClass} ${className}`.trim()} data-ui-key={uiKey}>
        {inner}
      </span>
    );
  }

  return (
    <span
      data-ui-key={uiKey}
      data-studio-target="true"
      onClick={handleSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(e as unknown as React.MouseEvent);
        }
      }}
      role="button"
      tabIndex={0}
      draggable={Boolean(groupId)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      title={groupId ? 'انقر للتحرير — اسحب لإعادة الترتيب' : 'انقر للتحرير في Studio'}
      className={`${displayClass} relative max-w-full align-baseline cursor-pointer ${className} ${
        resolved.hidden ? 'opacity-45' : ''
      } ${
        isSelected
          ? 'outline outline-2 outline-[#714B67] outline-offset-2 rounded-sm'
          : 'hover:outline hover:outline-1 hover:outline-[#714B67]/40 hover:outline-offset-1 rounded-sm'
      }`.trim()}
    >
      <span className={resolved.hidden ? 'line-through' : ''}>{inner}</span>
    </span>
  );
};

export function useUiStudioLabel(uiKey: string, defaults: UiElementDefaults) {
  const { lang } = useLang();
  const { resolveElement, uiStudioActive, selectElement } = useUiStudio();
  const resolved = useMemo(() => resolveElement(uiKey, defaults), [resolveElement, uiKey, defaults]);
  const locale = lang === 'en' ? 'en' : 'ar';
  return {
    resolved,
    hidden: resolved.hidden && !uiStudioActive,
    label: pickUiLabel(resolved, locale),
    help: pickUiHelp(resolved, locale),
    selectInStudio: () =>
      selectElement({ uiKey, defaults, kind: defaults.kind }),
  };
}
