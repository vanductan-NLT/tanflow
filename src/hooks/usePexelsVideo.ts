import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use ref to store latest settings without causing effect re-runs
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const fetchRandomVideo = useCallback(async (isRetry = false) => {
    const currentSettings = settingsRef.current;
    console.log('[Pexels] fetchRandomVideo called', {
      enabled: currentSettings.enabled,
      category: currentSettings.category,
      isRetry,
    });

    if (!currentSettings.enabled) return;

    setIsLoading(true);
    if (!isRetry) {
      setError(null);
      setRetryCount(0);
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke('pexels-video', {
        body: {
          category: currentSettings.category,
        },
      });

      if (fnError) {
        console.error('[Pexels] backend function error:', fnError);
        const errorMsg = fnError.message?.toLowerCase() || '';
        if (errorMsg.includes('api key') || errorMsg.includes('unauthorized')) {
          setError('Chưa cấu hình API key trên server');
        } else {
          setError('Không thể tải video. Đang thử lại...');
        }
        return false;
      }

      const responseError = (data as any)?.error;
      if (responseError) {
        console.error('[Pexels] API error:', responseError);
        if (responseError.includes('Missing Pexels API key')) {
          setError('Chưa cấu hình Pexels API key');
        } else {
          setError('Không thể tải video. Đang thử lại...');
        }
        return false;
      }

      const url = (data as any)?.videoUrl as string | undefined;
      if (!url) {
        setError('Không tìm thấy video. Đang thử lại...');
        return false;
      }

      console.log('[Pexels] Setting new video URL:', url);
      setVideoUrl(url);
      setVideoKey(prev => prev + 1);
      setError(null);
      setRetryCount(0);
      return true;
    } catch (err) {
      console.error('[Pexels] Network error:', err);
      setError('Lỗi kết nối. Đang thử lại...');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-retry when error occurs
  useEffect(() => {
    if (error && retryCount < maxRetries && settings.enabled) {
      // Don't retry for API key errors
      if (error.includes('API key') || error.includes('Chưa cấu hình')) {
        return;
      }

      const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // Exponential backoff: 2s, 4s, 8s (max 10s)
      console.log(`[Pexels] Scheduling retry ${retryCount + 1}/${maxRetries} in ${delay}ms`);

      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchRandomVideo(true);
      }, delay);

      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    } else if (error && retryCount >= maxRetries) {
      // Max retries reached, update error message
      setError('Không thể tải video sau nhiều lần thử.');
    }
  }, [error, retryCount, settings.enabled, fetchRandomVideo]);

  // Fetch video on mount and when category changes
  useEffect(() => {
    if (settings.enabled) fetchRandomVideo();
  }, [settings.category, settings.enabled, fetchRandomVideo]);

  // Auto-refresh video at interval (only for interval modes)
  useEffect(() => {
    const intervalMinutes = parseInt(settings.refreshMode);
    if (!settings.enabled || isNaN(intervalMinutes) || intervalMinutes === 0) {
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
  // Key is stored server-side, client can't reliably detect.
  const hasApiKey = true;

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
