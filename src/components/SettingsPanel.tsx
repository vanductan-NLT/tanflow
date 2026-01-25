import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePomodoro, PomodoroSettings } from '@/hooks/usePomodoro';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';

interface SettingsPanelProps {
  pomodoro: ReturnType<typeof usePomodoro>;
}

export function SettingsPanel({ pomodoro }: SettingsPanelProps) {
  const { settings, updateSettings, resetSession } = pomodoro;

  const handleChange = (key: keyof PomodoroSettings, value: number) => {
    updateSettings({ [key]: value });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Cài đặt</SheetTitle>
          <SheetDescription>Tùy chỉnh thời gian Pomodoro và các tùy chọn khác</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {/* Pomodoro Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Thời gian tập trung</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {settings.pomodoroDuration} phút
              </span>
            </div>
            <Slider
              value={[settings.pomodoroDuration]}
              onValueChange={([v]) => handleChange('pomodoroDuration', v)}
              min={5}
              max={60}
              step={5}
            />
          </div>

          {/* Short Break Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Nghỉ ngắn</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {settings.shortBreakDuration} phút
              </span>
            </div>
            <Slider
              value={[settings.shortBreakDuration]}
              onValueChange={([v]) => handleChange('shortBreakDuration', v)}
              min={1}
              max={15}
              step={1}
            />
          </div>

          {/* Long Break Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Nghỉ dài</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {settings.longBreakDuration} phút
              </span>
            </div>
            <Slider
              value={[settings.longBreakDuration]}
              onValueChange={([v]) => handleChange('longBreakDuration', v)}
              min={5}
              max={30}
              step={5}
            />
          </div>

          {/* Long Break Interval */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Số pomodoro trước nghỉ dài</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {settings.longBreakInterval}
              </span>
            </div>
            <Slider
              value={[settings.longBreakInterval]}
              onValueChange={([v]) => handleChange('longBreakInterval', v)}
              min={2}
              max={8}
              step={1}
            />
          </div>

          {/* Reset Session */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetSession}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset phiên làm việc
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Đặt lại timer và đếm số pomodoro về 0
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
