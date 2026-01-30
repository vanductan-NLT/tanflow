// Lovable Cloud backend function: YouTube Data API search
// Uses secret: VITE_YOUTUBE_API_KEY

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      ...init.headers,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  const apiKey = Deno.env.get("VITE_YOUTUBE_API_KEY") ?? "";
  if (!apiKey) return json({ error: "Missing YouTube API key" }, { status: 400 });

  const payload = await req.json().catch(() => ({} as any));
  const queryRaw = String(payload?.query ?? "").trim();
  if (!queryRaw) return json({ error: "Missing query" }, { status: 400 });

  const maxResults = Math.min(Math.max(Number(payload?.maxResults ?? 10), 1), 25);
  const q = encodeURIComponent(`${queryRaw} lofi music study`);
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=${maxResults}&q=${q}&key=${apiKey}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      const status = resp.status;
      const msg = status === 403 ? "Invalid key or quota exceeded" : `YouTube request failed (${status})`;
      return json({ error: msg, details: text.slice(0, 500) }, { status: 502 });
    }

    const data = await resp.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    const videos: YouTubeVideo[] = items
      .map((item: any) => {
        const videoId = item?.id?.videoId;
        const snippet = item?.snippet;
        const thumb = snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url;
        if (!videoId || !snippet?.title || !thumb) return null;
        return {
          id: String(videoId),
          title: String(snippet.title),
          thumbnail: String(thumb),
          channelTitle: String(snippet.channelTitle ?? ""),
        } satisfies YouTubeVideo;
      })
      .filter(Boolean);

    return json({ videos });
  } catch (e) {
    return json({ error: "YouTube fetch error", details: String(e) }, { status: 500 });
  }
});
