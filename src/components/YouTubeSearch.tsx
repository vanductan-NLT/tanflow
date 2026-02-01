import { useState } from 'react';
import { Search, Loader2, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
}

export function YouTubeSearch({ onVideoSelect }: YouTubeSearchProps) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-search', {
        body: {
          query,
          maxResults: 10,
        },
      });

      if (fnError) {
        console.error('[YouTubeSearch] backend function error:', fnError);
        throw new Error(language === 'vi' ? 'Không thể tìm kiếm video' : 'Could not search videos');
      }

      const videos = ((data as any)?.videos ?? []) as YouTubeVideo[];
      setResults(videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'vi' ? 'Lỗi khi tìm kiếm' : 'Search error'));
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
          placeholder={t('music.search')}
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

      {/* Error */}
      {error && (
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
          {t('music.noResults')}
        </p>
      )}
    </div>
  );
}
