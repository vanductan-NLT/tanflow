import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface PexelsSettings {
  enabled: boolean;
  category: string;
  apiKey: string;
  autoRefreshInterval: number; // 0 = off, otherwise minutes
  refreshOnPomodoroComplete: boolean;
  refreshOnVideoEnd: boolean; // NEW: đổi video khi phát xong
}

const DEFAULT_SETTINGS: PexelsSettings = {
  enabled: true,
  category: 'nature',
  apiKey: '',
  autoRefreshInterval: 0,
  refreshOnPomodoroComplete: true,
  refreshOnVideoEnd: false,
};

const CATEGORIES = [
  'nature',
  'forest',
  'ocean',
  'mountains',
  'sky',
  'rain',
  'sunset',
  'clouds',
] as const;

export type VideoCategory = typeof CATEGORIES[number];

interface PexelsVideo {
  id: number;
  video_files: {
    link: string;
    quality: string;
    width: number;
    height: number;
  }[];
}

interface PexelsResponse {
  videos: PexelsVideo[];
}

export function usePexelsVideo() {
  const [settings, setSettings] = useLocalStorage<PexelsSettings>(
    'focusflow-pexels',
    DEFAULT_SETTINGS
  );
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store latest settings without causing effect re-runs
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Manual refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchRandomVideo = useCallback(async () => {
    const currentSettings = settingsRef.current;
    
    if (!currentSettings.apiKey || !currentSettings.enabled) {
      setError('Cần nhập Pexels API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${currentSettings.category}&per_page=15&page=${randomPage}&orientation=landscape`,
        {
          headers: {
            Authorization: currentSettings.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      const data: PexelsResponse = await response.json();
      
      if (data.videos && data.videos.length > 0) {
        const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
        // Find HD quality video file
        const hdFile = randomVideo.video_files.find(
          f => f.quality === 'hd' && f.width >= 1280
        ) || randomVideo.video_files[0];
        
        setVideoUrl(hdFile.link);
      } else {
        setError('Không tìm thấy video');
      }
    } catch (err) {
      setError('Lỗi kết nối Pexels API');
      console.error('Pexels error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch video on mount and when category changes or manual refresh
  useEffect(() => {
    if (settings.enabled && settings.apiKey) {
      fetchRandomVideo();
    }
  }, [settings.category, settings.apiKey, settings.enabled, refreshTrigger, fetchRandomVideo]);

  // Auto-refresh video at interval
  useEffect(() => {
    if (!settings.enabled || !settings.apiKey || settings.autoRefreshInterval === 0) {
      return;
    }

    const intervalMs = settings.autoRefreshInterval * 60 * 1000;
    const intervalId = setInterval(() => {
      fetchRandomVideo();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [settings.enabled, settings.apiKey, settings.autoRefreshInterval, fetchRandomVideo]);

  const updateSettings = useCallback((updates: Partial<PexelsSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  // Manual refresh function that triggers a new fetch
  const refreshVideo = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    settings,
    updateSettings,
    videoUrl,
    isLoading,
    error,
    refreshVideo,
    categories: CATEGORIES,
  };
}
