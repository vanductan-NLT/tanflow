import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type GradientTheme = 'aurora' | 'sunset' | 'forest' | 'ocean' | 'night' | 'lavender';

export interface BackgroundSettings {
  enabled: boolean;
  theme: GradientTheme;
}

const DEFAULT_SETTINGS: BackgroundSettings = {
  enabled: false,
  theme: 'aurora',
};

export const GRADIENT_THEMES: Record<GradientTheme, { name: string; colors: string }> = {
  aurora: {
    name: 'Bắc Cực Quang',
    colors: 'from-[#0f2027] via-[#203a43] via-[#2c5364] to-[#1a535c]',
  },
  sunset: {
    name: 'Hoàng Hôn',
    colors: 'from-[#ff6b6b] via-[#ffa86b] via-[#ffd93d] to-[#ff8e53]',
  },
  forest: {
    name: 'Rừng Xanh',
    colors: 'from-[#134e5e] via-[#1a5a4a] via-[#2d6a4f] to-[#52b788]',
  },
  ocean: {
    name: 'Đại Dương',
    colors: 'from-[#0077b6] via-[#00b4d8] via-[#48cae4] to-[#90e0ef]',
  },
  night: {
    name: 'Đêm Sao',
    colors: 'from-[#0f0c29] via-[#302b63] to-[#24243e]',
  },
  lavender: {
    name: 'Oải Hương',
    colors: 'from-[#667eea] via-[#764ba2] to-[#f093fb]',
  },
};

export function useBackground() {
  const [settings, setSettings] = useLocalStorage<BackgroundSettings>(
    'focusflow-background',
    DEFAULT_SETTINGS
  );

  const updateSettings = useCallback((updates: Partial<BackgroundSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  // Fallback to 'aurora' if stored theme doesn't exist (e.g., old localStorage data)
  const validTheme = GRADIENT_THEMES[settings.theme] ? settings.theme : 'aurora';
  
  return {
    settings: { ...settings, theme: validTheme },
    updateSettings,
    theme: GRADIENT_THEMES[validTheme],
  };
}
