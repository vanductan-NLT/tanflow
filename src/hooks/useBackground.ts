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

export const GRADIENT_THEMES: Record<GradientTheme, { name: string; nameEn: string; colors: string; preview: string }> = {
  aurora: {
    name: 'Bắc Cực Quang',
    nameEn: 'Aurora',
    colors: 'from-[#0f2027] via-[#203a43] via-[#2c5364] to-[#1a535c]',
    preview: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364, #1a535c)',
  },
  sunset: {
    name: 'Hoàng Hôn',
    nameEn: 'Sunset',
    colors: 'from-[#ff6b6b] via-[#ffa86b] via-[#ffd93d] to-[#ff8e53]',
    preview: 'linear-gradient(135deg, #ff6b6b, #ffa86b, #ffd93d, #ff8e53)',
  },
  forest: {
    name: 'Rừng Xanh',
    nameEn: 'Forest',
    colors: 'from-[#134e5e] via-[#1a5a4a] via-[#2d6a4f] to-[#52b788]',
    preview: 'linear-gradient(135deg, #134e5e, #1a5a4a, #2d6a4f, #52b788)',
  },
  ocean: {
    name: 'Đại Dương',
    nameEn: 'Ocean',
    colors: 'from-[#0077b6] via-[#00b4d8] via-[#48cae4] to-[#90e0ef]',
    preview: 'linear-gradient(135deg, #0077b6, #00b4d8, #48cae4, #90e0ef)',
  },
  night: {
    name: 'Đêm Sao',
    nameEn: 'Starry Night',
    colors: 'from-[#0f0c29] via-[#302b63] to-[#24243e]',
    preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  },
  lavender: {
    name: 'Oải Hương',
    nameEn: 'Lavender',
    colors: 'from-[#667eea] via-[#764ba2] to-[#f093fb]',
    preview: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
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
