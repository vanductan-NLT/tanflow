import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Playlist {
  id: string;
  name: string;
  videoId: string;
  thumbnail?: string;
}

const SUGGESTED_PLAYLISTS: Playlist[] = [
  { id: '1', name: 'Lofi Hip Hop', videoId: 'jfKfPfyJRdk', thumbnail: '🎵' },
  { id: '2', name: 'Jazz & Coffee', videoId: '-5KAN9_CzSA', thumbnail: '☕' },
  { id: '3', name: 'Nature Sounds', videoId: 'eKFTSSKCzWA', thumbnail: '🌿' },
  { id: '4', name: 'Piano Focus', videoId: '4oStw0r33so', thumbnail: '🎹' },
  { id: '5', name: 'Ambient Study', videoId: 'lTRiuFIWV54', thumbnail: '🌙' },
];

export function YouTubePlayer() {
  const [savedVideoId, setSavedVideoId] = useLocalStorage<string>('focusflow-youtube-video', 'jfKfPfyJRdk');
  const [customUrl, setCustomUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      // API is ready
    };
  }, []);

  // Initialize player when showing
  useEffect(() => {
    if (!showPlayer || !savedVideoId) return;

    const initPlayer = () => {
      if (!window.YT?.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '180',
        width: '100%',
        videoId: savedVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            event.target.setVolume(volume);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    initPlayer();

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [showPlayer, savedVideoId]);

  // Update volume
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleCustomUrl = () => {
    const videoId = extractVideoId(customUrl);
    if (videoId) {
      setSavedVideoId(videoId);
      setCustomUrl('');
      setShowPlayer(false);
      setTimeout(() => setShowPlayer(true), 100);
    }
  };

  const selectPlaylist = (playlist: Playlist) => {
    setSavedVideoId(playlist.videoId);
    setShowPlayer(false);
    setTimeout(() => setShowPlayer(true), 100);
  };

  return (
    <div className="w-full glass-effect rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <span className="font-medium">Nhạc nền</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPlayer(!showPlayer)}
          className="text-xs"
        >
          {showPlayer ? 'Thu gọn' : 'Mở rộng'}
        </Button>
      </div>

      {/* Quick Playlists */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {SUGGESTED_PLAYLISTS.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => selectPlaylist(playlist)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
              savedVideoId === playlist.videoId
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted'
            )}
          >
            <span>{playlist.thumbnail}</span>
            <span>{playlist.name}</span>
          </button>
        ))}
      </div>

      {/* Custom URL Input */}
      <div className="flex gap-2">
        <Input
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="Dán link YouTube..."
          className="text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleCustomUrl()}
        />
        <Button size="sm" onClick={handleCustomUrl} disabled={!customUrl}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Player Controls */}
      {showPlayer && (
        <div className="space-y-3">
          {/* Hidden YouTube Player */}
          <div className="rounded-lg overflow-hidden bg-black/20">
            <div id="youtube-player" />
          </div>

          {/* Custom Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="h-10 w-10 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="h-8 w-8"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={([v]) => {
                  setVolume(v);
                  setIsMuted(false);
                }}
                max={100}
                step={1}
                className="w-24"
              />
            </div>

            <a
              href={`https://youtube.com/watch?v=${savedVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mở YouTube ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Add YouTube types
declare global {
  interface Window {
    YT: typeof YT & {
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}
