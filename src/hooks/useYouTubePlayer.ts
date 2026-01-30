import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { MUSIC_TOPICS, MusicTopic } from '@/components/MusicTopicSelector';

const DEFAULT_PLAYLISTS = [
  { id: '1', name: 'Lofi Hip Hop', videoId: 'jfKfPfyJRdk', thumbnail: '🎵' },
  { id: '2', name: 'Jazz & Coffee', videoId: '-5KAN9_CzSA', thumbnail: '☕' },
  { id: '3', name: 'Nature Sounds', videoId: 'eKFTSSKCzWA', thumbnail: '🌿' },
  { id: '4', name: 'Piano Focus', videoId: '4oStw0r33so', thumbnail: '🎹' },
  { id: '5', name: 'Ambient Study', videoId: 'lTRiuFIWV54', thumbnail: '🌙' },
];

interface QueueVideo {
  id: string;
  title: string;
}

export function useYouTubePlayer() {
  const [savedVideoId, setSavedVideoId] = useLocalStorage<string>('focusflow-youtube-video', 'jfKfPfyJRdk');
  const [autoPlay, setAutoPlay] = useLocalStorage<boolean>('focusflow-youtube-autoplay', true);
  const [currentTopic, setCurrentTopic] = useLocalStorage<string>('focusflow-music-topic', 'lofi');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
  const [isSearchingTopic, setIsSearchingTopic] = useState(false);
  
  // Queue system
  const [videoQueue, setVideoQueue] = useState<QueueVideo[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  
  const playerRef = useRef<YT.Player | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // For display, use real title or fallback to playlist name
  const currentTrack = DEFAULT_PLAYLISTS.find(p => p.videoId === savedVideoId) || DEFAULT_PLAYLISTS[0];
  const displayTitle = currentVideoTitle || currentTrack.name;

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

  // Search videos for a topic
  const searchTopicVideos = useCallback(async (query: string): Promise<QueueVideo[]> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-search', {
        body: { query, maxResults: 10 }
      });
      
      if (fnError) {
        console.error('Search error:', fnError);
        return [];
      }
      
      const videos = data?.videos ?? [];
      return videos.map((v: { id: string; title: string }) => ({
        id: v.id,
        title: v.title
      }));
    } catch (err) {
      console.error('Failed to search topics:', err);
      return [];
    }
  }, []);

  // Handle next with queue system
  const handleNext = useCallback(async () => {
    // If we have queue and not at the end
    if (videoQueue.length > 0 && currentQueueIndex < videoQueue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIndex);
      setShouldAutoPlay(true);
      setSavedVideoId(videoQueue[nextIndex].id);
      setCurrentVideoTitle(videoQueue[nextIndex].title);
    } else {
      // End of queue or no queue - search more videos
      const topic = MUSIC_TOPICS.find(t => t.id === currentTopic);
      if (topic) {
        setIsSearchingTopic(true);
        const videos = await searchTopicVideos(topic.query);
        setIsSearchingTopic(false);
        
        if (videos.length > 0) {
          setVideoQueue(videos);
          setCurrentQueueIndex(0);
          setShouldAutoPlay(true);
          setSavedVideoId(videos[0].id);
          setCurrentVideoTitle(videos[0].title);
        }
      } else {
        // Fallback: cycle through default playlists
        const currentIndex = DEFAULT_PLAYLISTS.findIndex(p => p.videoId === savedVideoId);
        const nextIndex = (currentIndex + 1) % DEFAULT_PLAYLISTS.length;
        setSavedVideoId(DEFAULT_PLAYLISTS[nextIndex].videoId);
      }
    }
  }, [videoQueue, currentQueueIndex, currentTopic, savedVideoId, setSavedVideoId, searchTopicVideos]);

  const handlePrev = useCallback(() => {
    if (videoQueue.length > 0 && currentQueueIndex > 0) {
      const prevIndex = currentQueueIndex - 1;
      setCurrentQueueIndex(prevIndex);
      setShouldAutoPlay(true);
      setSavedVideoId(videoQueue[prevIndex].id);
      setCurrentVideoTitle(videoQueue[prevIndex].title);
    } else {
      const currentIndex = DEFAULT_PLAYLISTS.findIndex(p => p.videoId === savedVideoId);
      const prevIndex = currentIndex === 0 ? DEFAULT_PLAYLISTS.length - 1 : currentIndex - 1;
      setSavedVideoId(DEFAULT_PLAYLISTS[prevIndex].videoId);
    }
  }, [videoQueue, currentQueueIndex, savedVideoId, setSavedVideoId]);

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
            
            // Get real video title
            try {
              const videoData = event.target.getVideoData();
              if (videoData?.title) {
                setCurrentVideoTitle(videoData.title);
              }
            } catch (e) {
              console.warn('Could not get video data:', e);
            }
            
            if (shouldAutoPlay) {
              event.target.playVideo();
              setShouldAutoPlay(false);
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            const state = event.data;
            setIsPlaying(state === window.YT.PlayerState.PLAYING);
            
            // Update title when playing
            if (state === window.YT.PlayerState.PLAYING) {
              try {
                const videoData = event.target.getVideoData();
                if (videoData?.title) {
                  setCurrentVideoTitle(videoData.title);
                }
              } catch (e) {
                console.warn('Could not get video data:', e);
              }
            }
            
            // Auto-play next when video ends
            if (state === window.YT.PlayerState.ENDED && autoPlay) {
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

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  // Set video and auto-play
  const setVideoAndPlay = useCallback((videoId: string) => {
    setShouldAutoPlay(true);
    setSavedVideoId(videoId);
    setCurrentVideoTitle(''); // Reset, will be updated on ready
  }, [setSavedVideoId]);

  // Search and play by topic
  const searchAndPlayTopic = useCallback(async (topic: MusicTopic) => {
    setCurrentTopic(topic.id);
    setIsSearchingTopic(true);
    setError(null);
    
    const videos = await searchTopicVideos(topic.query);
    
    if (videos.length > 0) {
      setVideoQueue(videos);
      setCurrentQueueIndex(0);
      setShouldAutoPlay(true);
      setSavedVideoId(videos[0].id);
      setCurrentVideoTitle(videos[0].title);
    } else {
      setError('Không tìm thấy video. Thử lại sau.');
    }
    
    setIsSearchingTopic(false);
  }, [setCurrentTopic, setSavedVideoId, searchTopicVideos]);

  return {
    isPlaying,
    isPlayerReady,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    currentTrack: { ...currentTrack, name: displayTitle },
    playlists: DEFAULT_PLAYLISTS,
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
    currentVideoTitle: displayTitle,
    currentTopic,
    searchAndPlayTopic,
    isSearchingTopic,
    videoQueue,
    currentQueueIndex,
  };
}
