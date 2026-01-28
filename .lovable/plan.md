

# Kế hoạch Cá nhân hóa FocusFlow

## Tổng quan

Cập nhật ứng dụng FocusFlow với các cải tiến sau:
1. **Pexels API**: Chuyển sang sử dụng API key tập trung từ biến môi trường
2. **Âm thanh hoàn thành**: Thêm âm thanh riêng biệt cho Focus (Alarm) và Meditation (Temple Bell)
3. **Thời gian mặc định**: Đổi thời gian tập trung mặc định từ 25 phút lên 45 phút
4. **YouTube Search**: Tạm hoãn vì cần YouTube Data API Key (tương lai sẽ thêm, nên cứ làm và hướng dẫn cách thêm)

---

## Chi tiết thay đổi

### 1. Pexels API - Sử dụng biến môi trường

**Mục tiêu**: Loại bỏ yêu cầu người dùng nhập API key, sử dụng key tập trung.

```text
┌─────────────────────────────────────────┐
│  Trước đây                              │
│  ┌─────────┐    ┌───────────────────┐   │
│  │ User    │───>│ Nhập API Key vào  │   │
│  │         │    │ Settings Panel    │   │
│  └─────────┘    └───────────────────┘   │
└─────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Sau khi cập nhật                       │
│  ┌─────────────┐   ┌─────────────────┐  │
│  │ .env file   │──>│ VITE_PEXELS_    │  │
│  │             │   │ API_KEY         │  │
│  └─────────────┘   └─────────────────┘  │
│         ↓                               │
│  ┌─────────────────────────────────┐    │
│  │ usePexelsVideo.ts đọc từ        │    │
│  │ import.meta.env.VITE_PEXELS_... │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**File thay đổi**:
- `src/hooks/usePexelsVideo.ts`: Đọc API key từ `import.meta.env.VITE_PEXELS_API_KEY`
- `src/components/PexelsSettings.tsx`: Xóa ô nhập API key và link "Lấy key miễn phí"

### 2. Âm thanh hoàn thành riêng biệt

**Mục tiêu**: Phát âm thanh khác nhau khi hoàn thành Focus vs Meditation.

| Chế độ | Âm thanh | Mô tả |
|--------|----------|-------|
| Focus/Pomodoro | Alarm | Tiếng chuông báo thức rõ ràng |
| Meditation | Temple Bell | Tiếng chuông chùa nhẹ nhàng |

**File thay đổi**:
- `src/hooks/usePomodoro.ts`:
  - Cập nhật `playNotificationSound` để nhận tham số `mode`
  - Thêm 2 URL âm thanh (sử dụng base64 hoặc file audio trong `/public`)

### 3. Thời gian mặc định 45 phút

**Mục tiêu**: Thay đổi thời gian tập trung mặc định thành 45 phút (nghiên cứu cho thấy đây là thời gian tối ưu).

**File thay đổi**:
- `src/hooks/usePomodoro.ts`: Đổi `DEFAULT_SETTINGS.pomodoroDuration` từ 25 → 45
- `src/components/SettingsPanel.tsx`: Thêm gợi ý bên cạnh slider

### 4. YouTube Search (Tạm hoãn)

**Lý do**: Tính năng tìm kiếm YouTube cần YouTube Data API v3 key. Vì bạn chưa có key này, tính năng sẽ được tạm hoãn.

**Khi có API key**, sẽ triển khai:
- Component `YouTubeSearch.tsx` với ô tìm kiếm
- Hiển thị kết quả với thumbnail
- Click để phát video

---

## Yêu cầu từ bạn

Trước khi triển khai, bạn cần cung cấp **Pexels API Key** để lưu vào biến môi trường. Bạn có thể cung cấp key sau khi approve plan.

---

## Phần kỹ thuật

### Thay đổi trong usePexelsVideo.ts

```typescript
// Đọc API key từ biến môi trường thay vì localStorage
const ENV_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

// Trong hàm fetchRandomVideo
const apiKey = ENV_API_KEY || currentSettings.apiKey;
if (!apiKey || !currentSettings.enabled) {
  setError('Cần cấu hình Pexels API key');
  return;
}
```

### Thay đổi trong PexelsSettings.tsx

Xóa hoàn toàn phần:
- Ô Input nhập API key
- Link "Lấy key miễn phí"
- Các reference tới `settings.apiKey`

### Thay đổi trong usePomodoro.ts

```typescript
// Mặc định mới
const DEFAULT_SETTINGS: PomodoroSettings = {
  pomodoroDuration: 45,  // Thay đổi từ 25
  // ...
};

// Hàm phát âm thanh theo mode
const playNotificationSound = useCallback((timerMode: TimerMode) => {
  const soundUrl = timerMode === 'meditation' 
    ? TEMPLE_BELL_SOUND_URL 
    : ALARM_SOUND_URL;
  // Phát âm thanh
}, []);
```

### Thay đổi trong SettingsPanel.tsx

```typescript
// Thêm gợi ý
<div className="flex items-center justify-between">
  <div>
    <Label>Thời gian tập trung</Label>
    <p className="text-xs text-muted-foreground">
      45 phút là khoảng thời gian tối ưu cho não bộ
    </p>
  </div>
  <span className="text-sm font-mono text-muted-foreground">
    {settings.pomodoroDuration} phút
  </span>
</div>
```

---

## Kế hoạch kiểm tra

| Tính năng | Cách kiểm tra |
|-----------|---------------|
| Pexels API | Mở settings, xác nhận không còn ô nhập API key, video vẫn load |
| Âm thanh Focus | Chạy timer 10 giây, kiểm tra âm thanh alarm |
| Âm thanh Meditation | Chạy meditation 10 giây, kiểm tra âm thanh temple bell |
| Thời gian mặc định | Reset settings, xác nhận mặc định là 45 phút |

