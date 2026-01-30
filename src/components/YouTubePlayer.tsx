import { Music, Play, Pause, Volume2, VolumeX, ExternalLink, Loader2, SkipForward, Repeat, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { YouTubeSearch } from '@/components/YouTubeSearch';
import { MusicTopicSelector, MusicTopic } from '@/components/MusicTopicSelector';

interface YouTubePlayerProps {
  isPlaying: boolean;
  isPlayerReady: boolean;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  currentTrack: { id: string; name: string; videoId: string; thumbnail: string };
  savedVideoId: string;
  setSavedVideoId: (id: string) => void;
  setVideoAndPlay: (id: string) => void;
  handlePlayPause: () => void;
  handleNext: () => void;
  autoPlay: boolean;
  setAutoPlay: (a: boolean) => void;
  currentTime: number;
  duration: number;
  progress: number;
  seekTo: (s: number) => void;
  formatTime: (s: number) => string;
  error: string | null;
  currentVideoTitle: string;
  currentTopic: string;
  searchAndPlayTopic: (topic: MusicTopic) => Promise<void>;
  isSearchingTopic: boolean;
}

export function YouTubePlayer({
  isPlaying,
  isPlayerReady,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  currentTrack,
  savedVideoId,
  setVideoAndPlay,
  handlePlayPause,
  handleNext,
  autoPlay,
  setAutoPlay,
  currentTime,
  duration,
  progress,
  seekTo,
  formatTime,
  error,
  currentVideoTitle,
  currentTopic,
  searchAndPlayTopic,
  isSearchingTopic,
}: YouTubePlayerProps) {
  const [customUrl, setCustomUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

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

  const handleCustomUrl = () => {
    const videoId = extractVideoId(customUrl);
    if (videoId) {
      setVideoAndPlay(videoId);
      setCustomUrl('');
    }
  };

  return (
    <div className="w-full glass-effect rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <span className="font-medium">Nhạc nền</span>
          {(!isPlayerReady || isSearchingTopic) && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs h-8 px-2"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Collapsed View - Icon + Progress Bar + Play Button */}
      {!isExpanded && (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            disabled={!isPlayerReady}
            className="h-8 w-8 rounded-full shrink-0"
          >
            {!isPlayerReady ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate mb-1">{currentVideoTitle}</p>
            <div 
              className="relative h-1.5 bg-muted rounded-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                if (duration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seekTo(percent * duration);
                }
              }}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {formatTime(currentTime)}
          </span>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <>
          {/* Topic Selector */}
          <MusicTopicSelector
            currentTopic={currentTopic}
            onTopicSelect={searchAndPlayTopic}
            isLoading={isSearchingTopic}
          />

          {/* Track Name */}
          <p className="text-xs text-muted-foreground truncate">{currentVideoTitle}</p>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div 
              className="relative h-1.5 bg-muted rounded-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                if (duration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seekTo(percent * duration);
                }
              }}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={!isPlayerReady || isSearchingTopic}
              className="h-8 w-8 rounded-full"
              title="Bài tiếp theo"
            >
              <SkipForward className="h-4 w-4" strokeWidth={1.5} />
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
                  <VolumeX className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="h-4 w-4" strokeWidth={1.5} />
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
                className="w-20"
                disabled={!isPlayerReady}
              />
            </div>

            <Button
              variant={autoPlay ? "default" : "ghost"}
              size="icon"
              onClick={() => setAutoPlay(!autoPlay)}
              className={cn("h-8 w-8", autoPlay && "bg-primary/20 text-primary")}
              title={autoPlay ? "Tắt tự động chuyển bài" : "Bật tự động chuyển bài"}
            >
              <Repeat className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Custom URL Input */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            {/* Search Toggle */}
            <Button
              variant={showSearch ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {showSearch ? 'Ẩn tìm kiếm' : 'Tìm kiếm nhạc trên YouTube'}
            </Button>

            {/* YouTube Search Component */}
            {showSearch && (
              <YouTubeSearch onVideoSelect={(videoId) => {
                setVideoAndPlay(videoId);
                setShowSearch(false);
              }} />
            )}

            {/* Manual URL Input */}
            <div className="flex gap-2">
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Hoặc dán link YouTube..."
                className="text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomUrl()}
              />
              <Button size="sm" onClick={handleCustomUrl} disabled={!customUrl}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <a
              href={`https://youtube.com/watch?v=${savedVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Mở trên YouTube
            </a>
          </div>
        </>
      )}
    </div>
  );
}
