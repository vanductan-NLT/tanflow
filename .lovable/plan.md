

## Plan: Target Cycles + Màn Hình Chúc Mừng Auto-Dismiss (3-4s)

Hiện tại Breath Box chạy vô tận và chưa có completion flow. Plan này implement toàn bộ: target cycles, auto-stop, màn hình chúc mừng hiển thị 3-4 giây rồi tự động quay về dashboard.

---

### 1. `src/hooks/useBreathBox.ts` — Thêm target cycles + completion state

- Thêm `targetCycles: number` vào `BreathBoxState` (mặc định = 5, persist localStorage)
- Thêm runtime state: `isCompleted: boolean`
- Thêm `setTargetCycles(n)` và `dismissCompletion()` actions
- Trong `advancePhase`: khi `cycleCount + 1 >= targetCycles` (và > 0), auto-pause + set `isCompleted = true` + phát completion sound (tone thấp 400Hz, dài 0.5s)
- `reset()` và `dismissCompletion()` đều set `isCompleted = false`

### 2. `src/components/BreathBoxComplete.tsx` — Component mới

- Fullscreen overlay, fade-in animation
- Confetti (reuse component có sẵn) duration 3000ms
- Hiển thị: icon sparkle lớn + "Tuyệt vời!" + "Bạn đã hoàn thành X vòng thở" + câu quote động lực ngẫu nhiên
- **Auto-dismiss sau 3.5 giây** bằng `setTimeout` → gọi callback `onDismiss`
- Không có nút bấm, chỉ tự biến mất

### 3. `src/pages/Index.tsx` — Xử lý completion flow

- Khi `breathBox.isCompleted === true`: render `BreathBoxComplete` overlay thay vì focus mode
- `onDismiss` callback: gọi `breathBox.dismissCompletion()` → reset state → quay về dashboard tự nhiên

### 4. `src/components/PomodoroTimer.tsx` — UI chọn target cycles

- Thêm hàng "+/- Số vòng" bên dưới phase duration grid (khi breathBox enabled, chưa chạy)
- Range 0-30, 0 hiển thị "∞" (vô hạn)

### 5. `src/components/BreathBox.tsx` — Hiển thị progress

- Thêm props `targetCycles`
- Cycle counter hiện "3 / 5" thay vì chỉ "3" (khi targetCycles > 0)

### 6. `src/contexts/LanguageContext.tsx` — Translations

- `breathBox.targetCycles`, `breathBox.infinite`, `breathBox.completed`, `breathBox.completedDesc`, `breathBox.cycleProgress`

### Flow

```text
Meditation → Bật BreathBox → Set pattern + số vòng → Start
  → Focus mode: thở, hiện "3/5 vòng"
  → Đủ vòng → Auto-pause + completion sound
  → Overlay: Confetti + "Tuyệt vời!" (3.5s)
  → Auto-dismiss → Về dashboard
```

