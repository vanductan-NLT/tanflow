// Lovable Cloud backend function: fetch a random Pexels landscape video URL
// Uses secret: VITE_PEXELS_API_KEY

type VideoCategory =
  | "random"
  | "nature"
  | "forest"
  | "ocean"
  | "mountains"
  | "sky"
  | "rain"
  | "sunset"
  | "clouds";

const RANDOM_POOL: Exclude<VideoCategory, "random">[] = [
  "nature",
  "forest",
  "ocean",
  "mountains",
  "sky",
  "rain",
  "sunset",
  "clouds",
];

interface PexelsVideo {
  id: number;
  video_files: {
    link: string;
    quality: string;
    width: number;
    height: number;
  }[];
}

interface PexelsResponse {
  videos: PexelsVideo[];
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

  const apiKey = Deno.env.get("VITE_PEXELS_API_KEY") ?? "";
  if (!apiKey) return json({ error: "Missing Pexels API key" }, { status: 400 });

  let category: VideoCategory = "nature";
  const payload = await req.json().catch(() => ({} as any));
  category = (payload?.category as VideoCategory) || "nature";

  const searchCategory = category === "random"
    ? RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)]
    : category;

  const randomPage = Math.floor(Math.random() * 5) + 1;
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(searchCategory)}&per_page=15&page=${randomPage}&orientation=landscape`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: apiKey },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return json(
        { error: `Pexels request failed (${resp.status})`, details: text.slice(0, 500) },
        { status: 502 },
      );
    }

    const data = (await resp.json()) as PexelsResponse;
    if (!data?.videos?.length) return json({ error: "No videos found" }, { status: 404 });

    const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
    const hdFile =
      randomVideo.video_files.find((f) => f.quality === "hd" && f.width >= 1280) ??
      randomVideo.video_files[0];

    return json({ videoUrl: hdFile?.link ?? "" });
  } catch (e) {
    return json({ error: "Pexels fetch error", details: String(e) }, { status: 500 });
  }
});
