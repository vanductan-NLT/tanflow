
# Kế hoạch: Topic Recommendations + Sửa lỗi Track Name & Phát liên tục

## Tóm tắt

Thêm tính năng chọn topic nhạc có sẵn (Lofi, Jazz, Piano...), hiển thị đúng tên bài hát từ YouTube API với truncate "...", và sửa lỗi phát liên tục khi video kết thúc.

---

## Phần 1: Sửa hiển thị tên bài nhạc đúng

### Vấn đề hiện tại
- `currentTrack.name` được lấy từ mảng `PLAYLISTS` hardcoded (5 video preset)
- Khi user chọn video từ search/custom URL, videoId không có trong PLAYLISTS → fallback về "Lofi Hip Hop"

### Giải pháp
- Sử dụng `player.getVideoData().title` từ YouTube IFrame API để lấy tên thực của video đang phát
- Thêm state `currentVideoTitle` trong `useYouTubePlayer`
- Cập nhật title khi video ready hoặc state change sang PLAYING
- UI tự động truncate với CSS `truncate` class (đã có)

### Thay đổi kỹ thuật

**File: `src/types/youtube.d.ts`**
```typescript
// Thêm method getVideoData vào Player class
getVideoData(): { video_id: string; title: string; author: string };
```

**File: `src/hooks/useYouTubePlayer.ts`**
```typescript
const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');

// Trong onReady event
const videoData = event.target.getVideoData();
if (videoData?.title) setCurrentVideoTitle(videoData.title);

// Trong onStateChange khi PLAYING
if (event.data === window.YT.PlayerState.PLAYING) {
  const videoData = event.target.getVideoData();
  if (videoData?.title) setCurrentVideoTitle(videoData.title);
}

// Export currentVideoTitle thay vì currentTrack.name
```

---

## Phần 2: Sửa lỗi phát liên tục

### Vấn đề hiện tại
- `handleNext()` tìm video trong `PLAYLISTS` hardcoded (chỉ 5 video)
- Khi user phát video từ search/custom URL → không tìm thấy → logic sai
- `autoPlay` flag không được kiểm tra đúng cách trong một số trường hợp

### Giải pháp
- Tạo **queue system** lưu danh sách video đã search/chọn
- Khi video kết thúc + autoPlay bật: tự động search thêm video cùng topic và phát tiếp
- Nếu không có queue, replay video hiện tại hoặc search thêm

### Thay đổi kỹ thuật

**File: `src/hooks/useYouTubePlayer.ts`**

```typescript
// Thêm state cho queue và current topic
const [videoQueue, setVideoQueue] = useState<Array<{id: string, title: string}>>([]);
const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
const [currentTopic, setCurrentTopic] = useLocalStorage<string>('focusflow-music-topic', 'lofi');

// handleNext mới
const handleNext = useCallback(() => {
  // Nếu có queue và còn video
  if (videoQueue.length > 0 && currentQueueIndex < videoQueue.length - 1) {
    const nextIndex = currentQueueIndex + 1;
    setCurrentQueueIndex(nextIndex);
    setShouldAutoPlay(true);
    setSavedVideoId(videoQueue[nextIndex].id);
  } else {
    // Không còn video trong queue → search thêm hoặc loop lại
    // Gọi searchAndQueue(currentTopic)
  }
}, [videoQueue, currentQueueIndex, currentTopic]);
```

---

## Phần 3: Topic Recommendations UI

### Tính năng mới
- Hiển thị các topic có sẵn dưới dạng chips/buttons: Lofi, Jazz, Piano, Nature, Ambient, Classical, Chill
- Khi user chọn topic → auto search YouTube với query tương ứng → phát video đầu tiên
- Topic được lưu vào localStorage để nhớ lần sau

### UI Design

```
┌─────────────────────────────────────────────┐
│ 🎵 Nhạc nền                            [▲] │
├─────────────────────────────────────────────┤
│                                             │
│  Chọn thể loại:                            │
│  [🎵 Lofi] [☕ Jazz] [🎹 Piano] [🌿 Nature]│
│  [🌙 Ambient] [🎻 Classical] [✨ Chill]    │
│                                             │
│  ─────────────────────────────────────      │
│  ▶ Lofi Girl - beats to relax/study...     │
│  ━━━━━━━━━●──────────── 2:45 / 10:30       │
│                                             │
│  [⏯] [⏭] [🔊 ━━━━] [🔁]                   │
│                                             │
│  [🔍 Tìm kiếm nhạc trên YouTube]           │
│  [ Hoặc dán link YouTube...        ] [↗]   │
└─────────────────────────────────────────────┘
```

### Thay đổi kỹ thuật

**File: `src/components/MusicTopicSelector.tsx`** (tạo mới)

```typescript
const MUSIC_TOPICS = [
  { id: 'lofi', name: 'Lofi', emoji: '🎵', query: 'lofi hip hop beats' },
  { id: 'jazz', name: 'Jazz', emoji: '☕', query: 'jazz coffee shop music' },
  { id: 'piano', name: 'Piano', emoji: '🎹', query: 'piano study music' },
  { id: 'nature', name: 'Nature', emoji: '🌿', query: 'nature sounds relaxing' },
  { id: 'ambient', name: 'Ambient', emoji: '🌙', query: 'ambient study music' },
  { id: 'classical', name: 'Classical', emoji: '🎻', query: 'classical music focus' },
  { id: 'chill', name: 'Chill', emoji: '✨', query: 'chill music playlist' },
];

interface Props {
  currentTopic: string;
  onTopicSelect: (topic: typeof MUSIC_TOPICS[0]) => void;
  isLoading: boolean;
}
```

**File: `src/hooks/useYouTubePlayer.ts`**

```typescript
// Thêm function để search và phát theo topic
const searchAndPlayTopic = useCallback(async (topic: MusicTopic) => {
  setCurrentTopic(topic.id);
  setIsSearchingTopic(true);
  
  // Gọi edge function youtube-search với topic.query
  const { data } = await supabase.functions.invoke('youtube-search', {
    body: { query: topic.query, maxResults: 10 }
  });
  
  const videos = data?.videos ?? [];
  if (videos.length > 0) {
    setVideoQueue(videos);
    setCurrentQueueIndex(0);
    setVideoAndPlay(videos[0].id);
  }
  
  setIsSearchingTopic(false);
}, []);
```

**File: `src/components/YouTubePlayer.tsx`**
- Import và thêm `MusicTopicSelector` component
- Pass props: currentTopic, onTopicSelect, isSearchingTopic

---

## Tóm tắt files cần thay đổi

| File | Thay đổi |
|------|----------|
| `src/types/youtube.d.ts` | Thêm `getVideoData()` type |
| `src/hooks/useYouTubePlayer.ts` | Thêm currentVideoTitle, videoQueue, currentTopic, searchAndPlayTopic |
| `src/components/MusicTopicSelector.tsx` | **Tạo mới** - UI chọn topic |
| `src/components/YouTubePlayer.tsx` | Thêm MusicTopicSelector, hiển thị currentVideoTitle |
| `src/components/MiniMusicPlayer.tsx` | Cập nhật hiển thị tên bài thực |

---

## Thứ tự triển khai

1. Cập nhật `youtube.d.ts` - thêm type cho getVideoData
2. Sửa `useYouTubePlayer.ts` - lấy title thực + queue system
3. Tạo `MusicTopicSelector.tsx` - UI chọn topic
4. Cập nhật `YouTubePlayer.tsx` - tích hợp topic selector + title mới
5. Cập nhật `MiniMusicPlayer.tsx` - đồng bộ logic nếu cần
6. Test end-to-end: chọn topic → phát nhạc → hết bài → tự chuyển bài
