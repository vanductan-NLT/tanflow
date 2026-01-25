import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface PexelsSettings {
  enabled: boolean;
  category: string;
  apiKey: string;
}

const DEFAULT_SETTINGS: PexelsSettings = {
  enabled: true,
  category: 'nature',
  apiKey: '',
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

  const fetchRandomVideo = useCallback(async () => {
    if (!settings.apiKey || !settings.enabled) {
      setError('Cần nhập Pexels API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${settings.category}&per_page=15&page=${randomPage}&orientation=landscape`,
        {
          headers: {
            Authorization: settings.apiKey,
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
  }, [settings.apiKey, settings.category, settings.enabled]);

  // Fetch video on mount and when category changes
  useEffect(() => {
    if (settings.enabled && settings.apiKey) {
      fetchRandomVideo();
    }
  }, [settings.category, settings.apiKey, settings.enabled]);

  const updateSettings = useCallback((updates: Partial<PexelsSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  return {
    settings,
    updateSettings,
    videoUrl,
    isLoading,
    error,
    refreshVideo: fetchRandomVideo,
    categories: CATEGORIES,
  };
}
