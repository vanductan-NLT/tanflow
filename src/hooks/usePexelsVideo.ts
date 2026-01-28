import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

// API key từ biến môi trường (centralized)
const ENV_PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

export type VideoRefreshMode = 'off' | 'on-pomodoro' | 'on-video-end' | '10' | '15' | '30' | '60';

export interface PexelsSettings {
  enabled: boolean;
  category: string;
  refreshMode: VideoRefreshMode;
}

const DEFAULT_SETTINGS: PexelsSettings = {
  enabled: true,
  category: 'nature',
  refreshMode: 'on-pomodoro',
};

const CATEGORIES = [
  'random',
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

// Categories to pick from when random is selected
const RANDOM_POOL = ['nature', 'forest', 'ocean', 'mountains', 'sky', 'rain', 'sunset', 'clouds'] as const;

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
    'focusflow-pexels-v2',
    DEFAULT_SETTINGS
  );
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoKey, setVideoKey] = useState(0); // Force re-render when same URL
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store latest settings without causing effect re-runs
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const fetchRandomVideo = useCallback(async () => {
    const currentSettings = settingsRef.current;
    const apiKey = ENV_PEXELS_API_KEY;
    
    console.log('[Pexels] fetchRandomVideo called', { 
      apiKey: apiKey ? 'exists' : 'missing',
      enabled: currentSettings.enabled,
      category: currentSettings.category
    });
    
    if (!apiKey || !currentSettings.enabled) {
      setError('API key chưa được cấu hình');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      // If category is 'random', pick a random category from the pool
      const searchCategory = currentSettings.category === 'random'
        ? RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)]
        : currentSettings.category;
      
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${searchCategory}&per_page=15&page=${randomPage}&orientation=landscape`,
        {
          headers: {
            Authorization: apiKey,
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
        
        console.log('[Pexels] Setting new video URL:', hdFile.link);
        setVideoUrl(hdFile.link);
        setVideoKey(prev => prev + 1); // Force VideoBackground to update
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

  // Fetch video on mount and when category changes
  useEffect(() => {
    if (settings.enabled && ENV_PEXELS_API_KEY) {
      fetchRandomVideo();
    }
  }, [settings.category, settings.enabled, fetchRandomVideo]);

  // Auto-refresh video at interval (only for interval modes)
  useEffect(() => {
    const intervalMinutes = parseInt(settings.refreshMode);
    if (!settings.enabled || !ENV_PEXELS_API_KEY || isNaN(intervalMinutes) || intervalMinutes === 0) {
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
      fetchRandomVideo();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [settings.enabled, settings.refreshMode, fetchRandomVideo]);

  const updateSettings = useCallback((updates: Partial<PexelsSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  // Direct refresh function
  const refreshVideo = useCallback(() => {
    fetchRandomVideo();
  }, [fetchRandomVideo]);

  // Helper getters for compatibility
  const shouldRefreshOnPomodoro = settings.refreshMode === 'on-pomodoro';
  const shouldRefreshOnVideoEnd = settings.refreshMode === 'on-video-end';
  const hasApiKey = !!ENV_PEXELS_API_KEY;

  return {
    settings,
    updateSettings,
    videoUrl,
    videoKey,
    isLoading,
    error,
    refreshVideo,
    categories: CATEGORIES,
    shouldRefreshOnPomodoro,
    shouldRefreshOnVideoEnd,
    hasApiKey,
  };
}
