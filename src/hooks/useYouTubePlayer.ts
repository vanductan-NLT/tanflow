import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const PLAYLISTS = [
  { id: '1', name: 'Lofi Hip Hop', videoId: 'jfKfPfyJRdk', thumbnail: '🎵' },
  { id: '2', name: 'Jazz & Coffee', videoId: '-5KAN9_CzSA', thumbnail: '☕' },
  { id: '3', name: 'Nature Sounds', videoId: 'eKFTSSKCzWA', thumbnail: '🌿' },
  { id: '4', name: 'Piano Focus', videoId: '4oStw0r33so', thumbnail: '🎹' },
  { id: '5', name: 'Ambient Study', videoId: 'lTRiuFIWV54', thumbnail: '🌙' },
];

export function useYouTubePlayer() {
  const [savedVideoId, setSavedVideoId] = useLocalStorage<string>('focusflow-youtube-video', 'jfKfPfyJRdk');
  const [autoPlay, setAutoPlay] = useLocalStorage<boolean>('focusflow-youtube-autoplay', true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = PLAYLISTS.find(p => p.videoId === savedVideoId) || PLAYLISTS[0];

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize player
  useEffect(() => {
    if (!savedVideoId) return;

    const initPlayer = () => {
      if (!window.YT?.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      setIsPlayerReady(false);
      setError(null);

      // Ensure the container exists
      const container = document.getElementById('hidden-youtube-player');
      if (!container) {
        setTimeout(initPlayer, 100);
        return;
      }

      playerRef.current = new window.YT.Player('hidden-youtube-player', {
        height: '0',
        width: '0',
        videoId: savedVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            setIsPlayerReady(true);
            event.target.setVolume(volume);
            const dur = event.target.getDuration();
            if (dur) setDuration(dur);
            // Auto play if triggered by custom URL
            if (shouldAutoPlay) {
              event.target.playVideo();
              setShouldAutoPlay(false);
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            if (event.data === window.YT.PlayerState.ENDED && autoPlay) {
              handleNext();
            }
          },
          onError: (event: YT.PlayerEvent) => {
            console.error('YouTube Player Error:', event);
            setError('Video không khả dụng. Thử video khác.');
          },
        },
      });
    };

    initPlayer();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [savedVideoId]);

  // Update progress
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
        if (playerRef.current?.getDuration) {
          const dur = playerRef.current.getDuration();
          if (dur > 0) setDuration(dur);
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlayerReady && playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(isMuted ? 0 : volume);
      } catch (e) {
        console.warn('Failed to set volume:', e);
      }
    }
  }, [volume, isMuted, isPlayerReady]);

  const handlePlayPause = useCallback(() => {
    if (!isPlayerReady || !playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlayerReady, isPlaying]);

  const handleNext = useCallback(() => {
    const currentIndex = PLAYLISTS.findIndex(p => p.videoId === savedVideoId);
    const nextIndex = (currentIndex + 1) % PLAYLISTS.length;
    setSavedVideoId(PLAYLISTS[nextIndex].videoId);
  }, [savedVideoId, setSavedVideoId]);

  const handlePrev = useCallback(() => {
    const currentIndex = PLAYLISTS.findIndex(p => p.videoId === savedVideoId);
    const prevIndex = currentIndex === 0 ? PLAYLISTS.length - 1 : currentIndex - 1;
    setSavedVideoId(PLAYLISTS[prevIndex].videoId);
  }, [savedVideoId, setSavedVideoId]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  // Function to set video and auto-play
  const setVideoAndPlay = useCallback((videoId: string) => {
    setShouldAutoPlay(true);
    setSavedVideoId(videoId);
  }, [setSavedVideoId]);

  return {
    isPlaying,
    isPlayerReady,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    currentTrack,
    playlists: PLAYLISTS,
    savedVideoId,
    setSavedVideoId,
    setVideoAndPlay,
    handlePlayPause,
    handleNext,
    handlePrev,
    autoPlay,
    setAutoPlay,
    currentTime,
    duration,
    progress,
    seekTo,
    formatTime,
    error,
  };
}
