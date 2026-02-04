
# Breath Box - Chức năng thở theo nhịp cho tab Thiền

## Tổng quan
Thêm tính năng "Breath Box" như một mode phụ trong tab Thiền (Meditation), cho phép người dùng thực hành thở theo nhịp hình vuông với các bước: Hít vào → Giữ → Thở ra → Giữ.

## Thiết kế giao diện

### Visual Box Animation (lưu ý: chỗ này vẫn là hình tròn, ko phải hình vuông)
```text
          ┌─────────────────────────────────────┐
          │          Hít vào / Breathe In       │
          │              ↓ →                    │
          │  ┌─────────────────────────────┐    │
          │  │                             │    │
Giữ/Hold  │  │           4                 │    │  Giữ/Hold
          │  │        seconds              │    │
          │  │                             │    │
          │  └─────────────────────────────┘    │
          │              ← ↑                    │
          │         Thở ra / Breathe Out        │
          └─────────────────────────────────────┘
```

- Hiển thị hình tròn với 4 điểm đại diện cho 4 bước
- Số đếm ngược ở giữa (4, 3, 2, 1...)
- Text hiện tại (Hít vào/Giữ/Thở ra) highlight ở cạnh tương ứng
- Animation dot di chuyển theo cạnh vuông
- Hỗ trợ text cho cả 2 ngôn ngữ

### UI Toggle và Settings
- Toggle "Breath Box" xuất hiện khi ở tab Thiền (khi timer đang dừng)
- Dropdown chọn template: 4-4-4-4 (mặc định), 4-7-8, 5-5-5-5, Custom
- Khi bật Breath Box: timer thiền bị ẩn, thay bằng animation hộp thở

## Files cần tạo/sửa

### 1. Tạo mới: `src/components/BreathBox.tsx`
Component chính hiển thị animation box breathing:
- Props: `pattern`, `isActive`, `onComplete`, `language`
- State: `phase` (inhale/holdIn/exhale/holdOut), `secondsLeft`, `cycleCount`
- Animation: SVG path di chuyển quanh hình vuông
- Âm thanh tick mỗi khi chuyển phase (dùng Web Audio API như timer hiện tại)

### 2. Tạo mới: `src/hooks/useBreathBox.ts`
Hook quản lý logic breath box:
- Pattern templates: `{ id: string, name: string, inhale: number, holdIn: number, exhale: number, holdOut: number }`
- Default patterns: 
  - `box-4`: 4-4-4-4 (Navy SEALs - mặc định)
  - `relaxing-478`: 4-7-8 (thư giãn sâu)
  - `box-5`: 5-5-5-5 (nâng cao)
- Timer logic cho từng phase
- Persist settings với useLocalStorage

### 3. Cập nhật: `src/components/PomodoroTimer.tsx`
- Thêm toggle "Breath Box" khi mode === 'meditation' && !isRunning
- Khi bật: hiển thị BreathBox component thay vì timer circle
- Thêm dropdown chọn pattern

### 4. Cập nhật: `src/components/MinimalTimer.tsx`
- Khi mode === 'meditation' && breathBoxEnabled:
  - Hiển thị BreathBox animation thay vì số timer
  - Giữ controls (play/pause/reset)

### 5. Cập nhật: `src/contexts/LanguageContext.tsx`
Thêm translations:
```typescript
// EN
'breathBox.title': 'Breath Box',
'breathBox.enable': 'Enable Breath Box',
'breathBox.pattern': 'Breathing pattern',
'breathBox.inhale': 'Breathe In',
'breathBox.holdIn': 'Hold',
'breathBox.exhale': 'Breathe Out', 
'breathBox.holdOut': 'Hold',
'breathBox.cycle': 'Cycle',
'breathBox.pattern.box4': 'Box 4-4-4-4 (Navy SEALs)',
'breathBox.pattern.relaxing': 'Relaxing 4-7-8',
'breathBox.pattern.box5': 'Box 5-5-5-5',

// VI
'breathBox.title': 'Thở hộp',
'breathBox.enable': 'Bật chế độ thở hộp',
'breathBox.pattern': 'Nhịp thở',
'breathBox.inhale': 'Hít vào',
'breathBox.holdIn': 'Giữ',
'breathBox.exhale': 'Thở ra',
'breathBox.holdOut': 'Giữ',
'breathBox.cycle': 'Vòng',
'breathBox.pattern.box4': 'Hộp 4-4-4-4 (Navy SEALs)',
'breathBox.pattern.relaxing': 'Thư giãn 4-7-8',
'breathBox.pattern.box5': 'Hộp 5-5-5-5',
```

### 6. Cập nhật: `src/pages/Index.tsx`
- Import và sử dụng useBreathBox hook
- Truyền breathBox state xuống timer components
- Khi meditation + breathBox: hiển thị BreathBox trong focus mode

### 7. Cập nhật: `src/hooks/usePomodoro.ts`
- Thêm `breathBoxEnabled: boolean` vào PomodoroSettings
- Thêm `breathBoxPattern: string` vào PomodoroSettings (mặc định 'box-4')

## Chi tiết kỹ thuật

### Animation Logic
```typescript
// Phases cycle: inhale → holdIn → exhale → holdOut → repeat
type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

// SVG path animation dựa trên phase:
// - inhale: di chuyển lên (bottom → top)
// - holdIn: di chuyển sang phải (left → right)
// - exhale: di chuyển xuống (top → bottom)
// - holdOut: di chuyển sang trái (right → left)
```

### Tick Sound
- Sử dụng cùng logic playTickSound từ usePomodoro
- Tick khi chuyển sang phase mới (không tick mỗi giây)
- Tick nhẹ hơn (frequency thấp hơn, ~600Hz thay vì 800Hz)

### Flow hoạt động
1. User chọn tab "Thiền" → thấy toggle "Breath Box"
2. Bật toggle → timer meditation ẩn, hiển thị box animation
3. Nhấn Play → animation bắt đầu, đếm từng giây
4. Mỗi khi chuyển phase → kêu tick
5. Hoàn thành 1 vòng (4 phase) → tăng cycle count
6. Nhấn Pause/Stop → dừng animation
7. Tắt toggle → quay lại meditation timer bình thường

## Ưu tiên triển khai
1. Tạo hook `useBreathBox.ts` với logic cơ bản
2. Tạo component `BreathBox.tsx` với animation SVG
3. Tích hợp vào `PomodoroTimer.tsx` (normal view)
4. Tích hợp vào `MinimalTimer.tsx` (focus view)
5. Thêm translations
6. Test end-to-end
