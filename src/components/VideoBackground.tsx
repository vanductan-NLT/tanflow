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

  const { settings, videoUrl, videoKey, refreshVideo, shouldRefreshOnVideoEnd } = pexels;
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevVideoRef = useRef<HTMLVideoElement>(null);
  const [currentUrl, setCurrentUrl] = useState(videoUrl);
  const [currentKey, setCurrentKey] = useState(videoKey);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [isNewVideoReady, setIsNewVideoReady] = useState(true);

  const isFocusing = timerMode === 'pomodoro' && isRunning;

  // Handle video URL changes with crossfade
  useEffect(() => {
    if (videoUrl && (videoUrl !== currentUrl || videoKey !== currentKey)) {
      // Keep old video visible, prepare new one
      setPrevUrl(currentUrl || null);
      setCurrentUrl(videoUrl);
      setCurrentKey(videoKey);
      // Keep showing previous video until the new one can play, then crossfade.
      setIsNewVideoReady(false);
    }
  }, [videoUrl, videoKey, currentUrl, currentKey]);

  // Force browser to load the new source (changing <source> doesn't reliably reload in all browsers)
  useEffect(() => {
    if (!videoRef.current) return;
    // When currentUrl/currentKey changes, remount may not happen fast enough; ensure a load()
    videoRef.current.load();
    // Autoplay can be blocked in rare cases even when muted; ignore errors
    void videoRef.current.play().catch(() => {});
  }, [currentUrl, currentKey]);

  // Ensure the previous layer can render immediately (avoid brief black frame while buffering)
  useEffect(() => {
    if (!prevVideoRef.current) return;
    if (!prevUrl) return;
    prevVideoRef.current.load();
    void prevVideoRef.current.play().catch(() => {});
  }, [prevUrl]);

  // When new video can play, fade it in
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
          preload="auto"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            // While the new video isn't ready, keep previous fully visible.
            isNewVideoReady ? "opacity-0" : "opacity-100"
          )}
          src={prevUrl}
        />
      )}

      {/* Current video - fades in */}
      {currentUrl && (
        <video
          key={`cur-${currentKey}`}
          ref={videoRef}
          autoPlay
          loop={!shouldRefreshOnVideoEnd}
          muted
          playsInline
          preload="auto"
          onCanPlay={handleNewVideoLoaded}
          onEnded={handleVideoEnded}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
            // Crossfade only when we have a previous video; otherwise show current (initial load).
            prevUrl ? (isNewVideoReady ? "opacity-100" : "opacity-0") : "opacity-100",
            isFocusing ? "scale-105" : "scale-100"
          )}
          src={currentUrl}
        />
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
