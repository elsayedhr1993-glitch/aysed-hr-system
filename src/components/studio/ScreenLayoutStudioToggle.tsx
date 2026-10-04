import React from 'react';
import type { ResolvedScreenLayout, ScreenId } from '../../types/customLayout';

interface ScreenLayoutStudioToggleProps {
  screenId: ScreenId;
  layout: ResolvedScreenLayout;
}

/** @deprecated Layout Studio drawer removed — use global Ui Studio (top bar + inspector sidebar). */
export const ScreenLayoutStudioToggle: React.FC<ScreenLayoutStudioToggleProps> = () => null;
