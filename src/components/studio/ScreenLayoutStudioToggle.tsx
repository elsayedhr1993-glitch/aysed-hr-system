import React from 'react';
import type { ResolvedScreenLayout, ScreenCustomLayout, ScreenId } from '../../types/customLayout';

interface ScreenLayoutStudioToggleProps {
  screenId: ScreenId;
  layout?: ResolvedScreenLayout | ScreenCustomLayout | null;
}

/** @deprecated Layout Studio drawer removed — use global Ui Studio (top bar + inspector sidebar). */
export const ScreenLayoutStudioToggle: React.FC<ScreenLayoutStudioToggleProps> = () => null;
