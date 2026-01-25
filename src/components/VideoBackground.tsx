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

  const { settings, videoUrl, isLoading, refreshVideo } = pexels;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const isFocusing = timerMode === 'pomodoro' && isRunning;

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      setIsVideoLoaded(false);
      videoRef.current.load();
    }
  }, [videoUrl]);

  // Handle video end - refresh if setting is enabled
  const handleVideoEnded = useCallback(() => {
    if (settings.refreshOnVideoEnd) {
      refreshVideo();
    }
  }, [settings.refreshOnVideoEnd, refreshVideo]);

  if (!settings.enabled || !settings.apiKey) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video element */}
      {videoUrl && (
        <video
          ref={videoRef}
          autoPlay
          loop={!settings.refreshOnVideoEnd}
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onEnded={handleVideoEnded}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
            isLoading || !isVideoLoaded ? "opacity-0" : "opacity-100",
            // When focusing: video is clearer
            isFocusing ? "scale-105" : "scale-100"
          )}
        >
          <source src={videoUrl} type="video/mp4" />
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

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
