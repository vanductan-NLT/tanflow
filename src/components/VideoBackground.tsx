import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TimerMode } from '@/hooks/usePomodoro';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';

interface VideoBackgroundProps {
  timerMode: TimerMode;
  isRunning: boolean;
  pexels: ReturnType<typeof usePexelsVideo>;
}

export function VideoBackground({ timerMode, isRunning, pexels }: VideoBackgroundProps) {
  // Early return if pexels is not provided
  if (!pexels) {
    return null;
  }

  const { settings, videoUrl, refreshVideo, shouldRefreshOnVideoEnd } = pexels;
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevVideoRef = useRef<HTMLVideoElement>(null);
  const [currentUrl, setCurrentUrl] = useState(videoUrl);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [isNewVideoReady, setIsNewVideoReady] = useState(true);

  const isFocusing = timerMode === 'pomodoro' && isRunning;

  // Handle video URL changes with crossfade
  useEffect(() => {
    if (videoUrl && videoUrl !== currentUrl) {
      // Keep old video visible, prepare new one
      setPrevUrl(currentUrl);
      setCurrentUrl(videoUrl);
      setIsNewVideoReady(false);
    }
  }, [videoUrl, currentUrl]);

  // When new video is loaded, fade it in
  const handleNewVideoLoaded = useCallback(() => {
    setIsNewVideoReady(true);
    // Clear previous video after transition
    setTimeout(() => {
      setPrevUrl(null);
    }, 1000);
  }, []);

  // Handle video end - refresh if setting is enabled
  const handleVideoEnded = useCallback(() => {
    if (shouldRefreshOnVideoEnd) {
      refreshVideo();
    }
  }, [shouldRefreshOnVideoEnd, refreshVideo]);

  if (!settings.enabled || !settings.apiKey) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Previous video - fades out */}
      {prevUrl && (
        <video
          ref={prevVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            isNewVideoReady ? "opacity-0" : "opacity-100"
          )}
        >
          <source src={prevUrl} type="video/mp4" />
        </video>
      )}

      {/* Current video - fades in */}
      {currentUrl && (
        <video
          ref={videoRef}
          autoPlay
          loop={!shouldRefreshOnVideoEnd}
          muted
          playsInline
          onLoadedData={handleNewVideoLoaded}
          onEnded={handleVideoEnded}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
            isNewVideoReady ? "opacity-100" : "opacity-0",
            isFocusing ? "scale-105" : "scale-100"
          )}
        >
          <source src={currentUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay - consistent dark overlay regardless of theme */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-700",
          isFocusing 
            ? "bg-black/20" 
            : "bg-black/40"
        )} 
      />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette" />
    </div>
  );
}
