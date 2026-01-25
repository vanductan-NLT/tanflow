import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
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

  // Double-buffered video layers (A/B) to avoid unmount/remount flashes during source swaps.
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const [urlA, setUrlA] = useState<string | null>(videoUrl ?? null);
  const [urlB, setUrlB] = useState<string | null>(null);
  const [readyA, setReadyA] = useState(false);
  const [readyB, setReadyB] = useState(false);

  const lastAppliedKeyRef = useRef(videoKey);

  const isFocusing = timerMode === 'pomodoro' && isRunning;

  const inactiveLayer = activeLayer === 'A' ? 'B' : 'A';

  const refs = useMemo(
    () => ({
      A: videoARef,
      B: videoBRef,
    }),
    []
  );

  const urls = useMemo(
    () => ({
      A: urlA,
      B: urlB,
    }),
    [urlA, urlB]
  );

  const setUrlFor = useCallback((layer: 'A' | 'B', url: string | null) => {
    if (layer === 'A') setUrlA(url);
    else setUrlB(url);
  }, []);

  const setReadyFor = useCallback((layer: 'A' | 'B', ready: boolean) => {
    if (layer === 'A') setReadyA(ready);
    else setReadyB(ready);
  }, []);

  // Initial ready state (first load)
  useEffect(() => {
    if (urlA && !readyA) {
      // We'll mark ready when it can play.
      setReadyA(false);
    }
  }, [urlA, readyA]);

  // When Pexels gives a new URL (or forces refresh via key), load it into the inactive layer.
  useEffect(() => {
    if (!videoUrl) return;

    const currentActiveUrl = urls[activeLayer];
    const keyChanged = videoKey !== lastAppliedKeyRef.current;
    const urlChanged = videoUrl !== currentActiveUrl;
    if (!keyChanged && !urlChanged) return;
    lastAppliedKeyRef.current = videoKey;

    const targetLayer = inactiveLayer;
    setReadyFor(targetLayer, false);
    setUrlFor(targetLayer, videoUrl);

    // Force load/play on the inactive element as soon as src is set.
    // Note: src assignment causes a new resource fetch; keeping the element mounted avoids flashes.
    queueMicrotask(() => {
      const el = refs[targetLayer].current;
      if (!el) return;
      el.load();
      void el.play().catch(() => {});
    });
  }, [videoUrl, videoKey, activeLayer, inactiveLayer, refs, setReadyFor, setUrlFor, urls]);

  const crossfadeTo = useCallback(
    (layer: 'A' | 'B') => {
      // Fade to the layer that can play.
      setActiveLayer(layer);
      setReadyFor(layer, true);

      // After the crossfade completes, pause the other layer to save resources.
      const old = layer === 'A' ? 'B' : 'A';
      setTimeout(() => {
        const el = refs[old].current;
        if (!el) return;
        el.pause();
      }, 1000);
    },
    [refs, setReadyFor]
  );

  // Handle video end - refresh if setting is enabled
  const handleVideoEnded = useCallback(
    (layer: 'A' | 'B') => {
      if (!shouldRefreshOnVideoEnd) return;
      if (layer !== activeLayer) return;
      refreshVideo();
    },
    [shouldRefreshOnVideoEnd, refreshVideo, activeLayer]
  );

  if (!settings.enabled || !settings.apiKey) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Layer A */}
      <video
        ref={videoARef}
        autoPlay
        loop={!shouldRefreshOnVideoEnd}
        muted
        playsInline
        preload="auto"
        src={urlA ?? undefined}
        onCanPlay={() => {
          // First load or after swap into A
          if (activeLayer !== 'A') crossfadeTo('A');
          else setReadyA(true);
        }}
        onEnded={() => handleVideoEnded('A')}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
          activeLayer === 'A' ? "opacity-100" : "opacity-0",
          activeLayer === 'A' && isFocusing ? "scale-105 transition-transform duration-1000" : "scale-100"
        )}
      />

      {/* Layer B */}
      <video
        ref={videoBRef}
        autoPlay
        loop={!shouldRefreshOnVideoEnd}
        muted
        playsInline
        preload="auto"
        src={urlB ?? undefined}
        onCanPlay={() => {
          if (activeLayer !== 'B') crossfadeTo('B');
          else setReadyB(true);
        }}
        onEnded={() => handleVideoEnded('B')}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
          activeLayer === 'B' ? "opacity-100" : "opacity-0",
          activeLayer === 'B' && isFocusing ? "scale-105 transition-transform duration-1000" : "scale-100"
        )}
      />

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
