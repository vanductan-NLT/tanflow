import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const PLAYLISTS = [
  { id: '1', name: 'Lofi Hip Hop', videoId: 'jfKfPfyJRdk' },
  { id: '2', name: 'Jazz & Coffee', videoId: '-5KAN9_CzSA' },
  { id: '3', name: 'Nature Sounds', videoId: 'eKFTSSKCzWA' },
  { id: '4', name: 'Piano Focus', videoId: '4oStw0r33so' },
  { id: '5', name: 'Ambient Study', videoId: 'lTRiuFIWV54' },
];

export function useYouTubePlayer() {
  const [savedVideoId, setSavedVideoId] = useLocalStorage<string>('focusflow-youtube-video', 'jfKfPfyJRdk');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);

  const currentTrack = PLAYLISTS.find(p => p.videoId === savedVideoId) || PLAYLISTS[0];

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
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNext();
            }
          },
        },
      });
    };

    initPlayer();

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [savedVideoId]);

  useEffect(() => {
    if (isPlayerReady && playerRef.current) {
      playerRef.current.setVolume(isMuted ? 0 : volume);
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
    handlePlayPause,
    handleNext,
    handlePrev,
  };
}
