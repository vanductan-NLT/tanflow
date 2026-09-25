import { describe, expect, it, vi } from 'vitest';
import { searchYouTubeVideos } from '@/lib/youtube';

describe('searchYouTubeVideos', () => {
  it('searches YouTube directly and maps valid videos', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      items: [{
        id: { videoId: 'video-1' },
        snippet: {
          title: 'Focus music',
          channelTitle: 'Focus channel',
          thumbnails: { medium: { url: 'https://img.example/video-1.jpg' } },
        },
      }],
    }), { status: 200 }));

    await expect(searchYouTubeVideos('piano', 10, 'test-key')).resolves.toEqual([{
      id: 'video-1',
      title: 'Focus music',
      channelTitle: 'Focus channel',
      thumbnail: 'https://img.example/video-1.jpg',
    }]);

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.origin + requestUrl.pathname).toBe('https://www.googleapis.com/youtube/v3/search');
    expect(requestUrl.searchParams.get('key')).toBe('test-key');
    expect(requestUrl.searchParams.get('q')).toBe('piano lofi music study');
    fetchMock.mockRestore();
  });

  it('surfaces the error returned by YouTube', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      error: { message: 'API key not valid' },
    }), { status: 400 }));

    await expect(searchYouTubeVideos('jazz', 10, 'bad-key')).rejects.toThrow('API key not valid');
    fetchMock.mockRestore();
  });
});
