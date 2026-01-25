import { Video, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';
import { cn } from '@/lib/utils';

interface PexelsSettingsProps {
  pexels: ReturnType<typeof usePexelsVideo>;
}

const CATEGORY_LABELS: Record<string, string> = {
  nature: '🌿 Thiên nhiên',
  forest: '🌲 Rừng',
  ocean: '🌊 Biển',
  mountains: '⛰️ Núi',
  sky: '☁️ Bầu trời',
  rain: '🌧️ Mưa',
  sunset: '🌅 Hoàng hôn',
  clouds: '☁️ Mây',
};

const REFRESH_INTERVALS = [
  { value: 0, label: 'Tắt' },
  { value: 10, label: '10 phút' },
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 60, label: '1 giờ' },
];

export function PexelsSettings({ pexels }: PexelsSettingsProps) {
  const { settings, updateSettings, refreshVideo, isLoading, error, categories } = pexels;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Video className="h-4 w-4" />
        <span>Video nền (Pexels)</span>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label htmlFor="video-enabled">Bật video nền</Label>
        <Switch
          id="video-enabled"
          checked={settings.enabled}
          onCheckedChange={(enabled) => updateSettings({ enabled })}
        />
      </div>

      {settings.enabled && (
        <>
          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Pexels API Key</Label>
              <a
                href="https://www.pexels.com/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Lấy key miễn phí <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Input
              type="password"
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
              placeholder="Nhập API key..."
              className="text-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Chủ đề video</Label>
            <Select
              value={settings.category}
              onValueChange={(category) => updateSettings({ category })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto refresh interval */}
          <div className="space-y-2">
            <Label>Tự động đổi video</Label>
            <Select
              value={String(settings.autoRefreshInterval)}
              onValueChange={(value) => updateSettings({ autoRefreshInterval: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_INTERVALS.map((interval) => (
                  <SelectItem key={interval.value} value={String(interval.value)}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refresh on Pomodoro complete */}
          <div className="flex items-center justify-between">
            <Label htmlFor="refresh-pomodoro">Đổi video khi hoàn thành Pomodoro</Label>
            <Switch
              id="refresh-pomodoro"
              checked={settings.refreshOnPomodoroComplete}
              onCheckedChange={(checked) => updateSettings({ refreshOnPomodoroComplete: checked })}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshVideo}
            disabled={isLoading || !settings.apiKey}
            className="w-full"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Đổi video nền
          </Button>

          <p className="text-xs text-muted-foreground">
            💡 Video sẽ rõ nét hơn khi bạn đang tập trung
          </p>
        </>
      )}
    </div>
  );
}
