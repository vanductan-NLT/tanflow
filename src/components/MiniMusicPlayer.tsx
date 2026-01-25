import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioVisualizer } from './AudioVisualizer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

const PLAYLISTS = [
  { id: '1', name: 'Lofi Hip Hop', videoId: 'jfKfPfyJRdk' },
  { id: '2', name: 'Jazz & Coffee', videoId: '-5KAN9_CzSA' },
  { id: '3', name: 'Nature Sounds', videoId: 'eKFTSSKCzWA' },
  { id: '4', name: 'Piano Focus', videoId: '4oStw0r33so' },
  { id: '5', name: 'Ambient Study', videoId: 'lTRiuFIWV54' },
];

interface MiniMusicPlayerProps {
  isFocusing: boolean;
}

export function MiniMusicPlayer({ isFocusing }: MiniMusicPlayerProps) {
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

      playerRef.current = new window.YT.Player('mini-youtube-player', {
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

  const handlePlayPause = () => {
    if (!isPlayerReady || !playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleNext = () => {
    const currentIndex = PLAYLISTS.findIndex(p => p.videoId === savedVideoId);
    const nextIndex = (currentIndex + 1) % PLAYLISTS.length;
    setSavedVideoId(PLAYLISTS[nextIndex].videoId);
  };

  return (
    <div className={cn(
      "glass-effect rounded-2xl p-4 transition-all duration-500",
      isFocusing ? "backdrop-blur-3xl bg-card/60" : "backdrop-blur-xl bg-card/80"
    )}>
      {/* Hidden player */}
      <div className="hidden">
        <div id="mini-youtube-player" />
      </div>

      <div className="flex items-center gap-4">
        {/* Audio Visualizer */}
        <AudioVisualizer isPlaying={isPlaying} className="w-20" />

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">{currentTrack.name}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            disabled={!isPlayerReady}
            className="h-10 w-10 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={!isPlayerReady}
            className="h-8 w-8 rounded-full"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8 rounded-full"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v);
              setIsMuted(false);
            }}
            max={100}
            className="w-16"
          />
        </div>
      </div>
    </div>
  );
}
