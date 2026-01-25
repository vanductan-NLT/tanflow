import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface BackgroundSettings {
  enabled: boolean;
  category: string;
  autoChange: boolean;
  changeInterval: number; // in minutes
}

const DEFAULT_SETTINGS: BackgroundSettings = {
  enabled: true,
  category: 'nature',
  autoChange: true,
  changeInterval: 10,
};

// Curated nature categories with Picsum IDs known to be nature/landscape
const CATEGORY_SEEDS: Record<string, number[]> = {
  nature: [10, 11, 15, 16, 17, 18, 19, 20, 22, 27, 28, 29],
  forest: [15, 28, 38, 42, 43, 47, 49, 54, 55, 57],
  mountain: [10, 11, 27, 29, 33, 36, 41, 58, 61, 66],
  ocean: [17, 18, 19, 21, 37, 45, 53, 59, 60, 69],
  sky: [16, 20, 22, 24, 48, 56, 62, 64, 67, 68],
};

export function useBackground() {
  const [settings, setSettings] = useLocalStorage<BackgroundSettings>(
    'focusflow-background',
    DEFAULT_SETTINGS
  );
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const getRandomImageUrl = useCallback(() => {
    const seeds = CATEGORY_SEEDS[settings.category] || CATEGORY_SEEDS.nature;
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
    // Using Picsum with specific seed for consistent category feel
    // Adding timestamp to prevent caching
    const timestamp = Date.now();
    return `https://picsum.photos/seed/${randomSeed}-${timestamp}/1920/1080`;
  }, [settings.category]);

  const refreshImage = useCallback(() => {
    if (!settings.enabled) return;
    
    setIsLoading(true);
    const newUrl = getRandomImageUrl();
    
    // Preload image
    const img = new Image();
    img.onload = () => {
      setImageUrl(newUrl);
      setImageKey(prev => prev + 1);
      setIsLoading(false);
    };
    img.onerror = () => {
      // Fallback: try a different seed
      const fallbackUrl = `https://picsum.photos/seed/${Date.now()}/1920/1080`;
      setImageUrl(fallbackUrl);
      setImageKey(prev => prev + 1);
      setIsLoading(false);
    };
    img.src = newUrl;
  }, [settings.enabled, getRandomImageUrl]);

  // Initial load
  useEffect(() => {
    if (settings.enabled && !imageUrl) {
      refreshImage();
    }
  }, [settings.enabled, imageUrl, refreshImage]);

  // Auto-change interval
  useEffect(() => {
    if (!settings.enabled || !settings.autoChange) return;

    const intervalMs = settings.changeInterval * 60 * 1000;
    const interval = setInterval(refreshImage, intervalMs);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.autoChange, settings.changeInterval, refreshImage]);

  // Refresh when category changes
  useEffect(() => {
    if (settings.enabled) {
      refreshImage();
    }
  }, [settings.category]);

  const updateSettings = useCallback((updates: Partial<BackgroundSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  return {
    settings,
    updateSettings,
    imageUrl,
    imageKey,
    isLoading,
    refreshImage,
  };
}
