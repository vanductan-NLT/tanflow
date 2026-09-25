export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface YouTubeSearchResponse {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: {
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
  error?: {
    message?: string;
  };
}

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

/** Search YouTube directly from the browser, without the Supabase edge function. */
export async function searchYouTubeVideos(
  query: string,
  maxResults = 10,
  apiKey = import.meta.env.VITE_YOUTUBE_API_KEY,
): Promise<YouTubeVideo[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  if (!apiKey) {
    throw new Error('VITE_YOUTUBE_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    maxResults: String(Math.min(Math.max(maxResults, 1), 25)),
    q: `${trimmedQuery} lofi music study`,
    key: apiKey,
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
  const data = (await response.json().catch(() => ({}))) as YouTubeSearchResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `YouTube request failed (${response.status})`);
  }

  return (data.items ?? []).flatMap((item) => {
    const id = item.id?.videoId;
    const snippet = item.snippet;
    const thumbnail = snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url;

    if (!id || !snippet?.title || !thumbnail) return [];

    return [{
      id,
      title: snippet.title,
      thumbnail,
      channelTitle: snippet.channelTitle ?? '',
    }];
  });
}
