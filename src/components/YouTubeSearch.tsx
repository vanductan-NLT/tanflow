import { useState } from 'react';
import { Search, Loader2, Play, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

export function YouTubeSearch({ onVideoSelect }: YouTubeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);

  const hasApiKey = !!YOUTUBE_API_KEY;

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    if (!hasApiKey) {
      setError('Chưa cấu hình YouTube API Key');
      setShowApiGuide(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(query + ' lofi music study')}&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('API key không hợp lệ hoặc đã hết quota');
        }
        throw new Error('Không thể tìm kiếm video');
      }

      const data = await response.json();
      
      const videos: YouTubeVideo[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
      }));

      setResults(videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tìm kiếm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm nhạc trên YouTube..."
          className="text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoading}
        />
        <Button 
          size="sm" 
          onClick={handleSearch} 
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* API Key Guide */}
      {!hasApiKey && (
        <Collapsible open={showApiGuide} onOpenChange={setShowApiGuide}>
          <CollapsibleTrigger asChild>
            <Alert className="cursor-pointer hover:bg-muted/50 transition-colors">
              <Info className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                Cần YouTube API Key
                <span className="text-xs text-muted-foreground">
                  (Nhấp để xem hướng dẫn)
                </span>
              </AlertTitle>
            </Alert>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 p-4 bg-muted/30 rounded-lg text-sm space-y-3">
              <p className="font-medium">Cách lấy YouTube Data API Key:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Truy cập <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Google Cloud Console <ExternalLink className="h-3 w-3" />
                </a></li>
                <li>Tạo dự án mới hoặc chọn dự án có sẵn</li>
                <li>Vào "APIs & Services" → "Library"</li>
                <li>Tìm "YouTube Data API v3" và bật nó</li>
                <li>Vào "Credentials" → "Create Credentials" → "API Key"</li>
                <li>Copy API Key và thêm vào dự án với tên <code className="bg-muted px-1.5 py-0.5 rounded text-xs">VITE_YOUTUBE_API_KEY</code></li>
              </ol>
              <p className="text-xs text-muted-foreground italic">
                * API này có quota miễn phí 10,000 units/ngày (khoảng 100 lượt tìm kiếm)
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Error */}
      {error && hasApiKey && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results.length > 0 && (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-4">
            {results.map((video) => (
              <div
                key={video.id}
                onClick={() => onVideoSelect(video.id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="relative shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2" title={video.title}>
                    {video.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {video.channelTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* No results */}
      {hasSearched && !isLoading && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Không tìm thấy kết quả nào
        </p>
      )}
    </div>
  );
}
