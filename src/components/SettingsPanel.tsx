import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePomodoro } from '@/hooks/usePomodoro';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';
import { PexelsSettings } from '@/components/PexelsSettings';
import { Separator } from '@/components/ui/separator';
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
  pexels: ReturnType<typeof usePexelsVideo>;
}

export function SettingsPanel({ pomodoro, pexels }: SettingsPanelProps) {
  const { settings, updateSettings } = pomodoro;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Cài đặt</SheetTitle>
          <SheetDescription>Tùy chỉnh thời gian Pomodoro và các tùy chọn khác</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">

          {/* Auto-start next session */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Tự động chuyển chế độ</Label>
              <p className="text-xs text-muted-foreground">
                Tự bắt đầu phiên tiếp theo
              </p>
            </div>
            <Switch
              checked={settings.autoStartNextSession}
              onCheckedChange={(checked) => updateSettings({ autoStartNextSession: checked })}
            />
          </div>

          {/* Pexels Video Settings */}
          <Separator className="my-4" />
          <PexelsSettings pexels={pexels} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
