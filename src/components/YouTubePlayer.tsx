import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, ExternalLink, Loader2 } from 'lucide-react';
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
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Initialize player when component mounts (not dependent on showPlayer)
  useEffect(() => {
    if (!savedVideoId) return;

    const initPlayer = () => {
      if (!window.YT?.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      // Destroy existing player if any
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      setIsPlayerReady(false);
      setError(null);

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
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
            setIsPlayerReady(true);
            setError(null);
            event.target.setVolume(volume);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
          onError: () => {
            setError('Không thể phát video này');
            setIsPlayerReady(false);
          },
        },
      });
    };

    initPlayer();

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      setIsPlayerReady(false);
    };
  }, [savedVideoId]);

  // Update volume - only when player is ready
  useEffect(() => {
    if (isPlayerReady && playerRef.current && typeof playerRef.current.setVolume === 'function') {
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

  const handleCustomUrl = () => {
    const videoId = extractVideoId(customUrl);
    if (videoId) {
      setSavedVideoId(videoId);
      setCustomUrl('');
    }
  };

  const selectPlaylist = (playlist: Playlist) => {
    setSavedVideoId(playlist.videoId);
  };

  return (
    <div className="w-full glass-effect rounded-2xl p-4 space-y-4">
      {/* Hidden YouTube Player - always exists */}
      <div className="hidden">
        <div id="youtube-player" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <span className="font-medium">Nhạc nền</span>
          {!isPlayerReady && showPlayer && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
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

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Player Controls */}
      {showPlayer && (
        <div className="space-y-3">
          {/* Custom Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              disabled={!isPlayerReady}
              className={cn(
                "h-10 w-10 rounded-full",
                !isPlayerReady && "opacity-50 cursor-not-allowed"
              )}
            >
              {!isPlayerReady ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
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
                disabled={!isPlayerReady}
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
                disabled={!isPlayerReady}
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
