import { Video, RefreshCw, ExternalLink, Trees, TreePine, Waves, Mountain, Cloud, CloudRain, Sunset, CloudSun, LucideIcon } from 'lucide-react';
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
import { usePexelsVideo, VideoRefreshMode } from '@/hooks/usePexelsVideo';
import { cn } from '@/lib/utils';

interface PexelsSettingsProps {
  pexels: ReturnType<typeof usePexelsVideo>;
}

interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  nature: { label: 'Thiên nhiên', icon: Trees, color: 'text-green-500' },
  forest: { label: 'Rừng', icon: TreePine, color: 'text-emerald-600' },
  ocean: { label: 'Biển', icon: Waves, color: 'text-blue-500' },
  mountains: { label: 'Núi', icon: Mountain, color: 'text-slate-500' },
  sky: { label: 'Bầu trời', icon: CloudSun, color: 'text-sky-400' },
  rain: { label: 'Mưa', icon: CloudRain, color: 'text-indigo-400' },
  sunset: { label: 'Hoàng hôn', icon: Sunset, color: 'text-orange-500' },
  clouds: { label: 'Mây', icon: Cloud, color: 'text-gray-400' },
};

const REFRESH_MODE_OPTIONS: { value: VideoRefreshMode; label: string }[] = [
  { value: 'off', label: 'Tắt' },
  { value: 'on-pomodoro', label: 'Khi hoàn thành Pomodoro' },
  { value: 'on-video-end', label: 'Khi video phát xong' },
  { value: '10', label: 'Mỗi 10 phút' },
  { value: '15', label: 'Mỗi 15 phút' },
  { value: '30', label: 'Mỗi 30 phút' },
  { value: '60', label: 'Mỗi 1 giờ' },
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
                <SelectValue>
                  {(() => {
                    const config = CATEGORY_CONFIG[settings.category];
                    if (!config) return settings.category;
                    const IconComponent = config.icon;
                    return (
                      <span className="flex items-center gap-2">
                        <IconComponent className={cn("h-4 w-4", config.color)} />
                        {config.label}
                      </span>
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  if (!config) return <SelectItem key={cat} value={cat}>{cat}</SelectItem>;
                  const IconComponent = config.icon;
                  return (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <IconComponent className={cn("h-4 w-4", config.color)} />
                        {config.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Auto refresh mode - unified dropdown */}
          <div className="space-y-2">
            <Label>Tự động đổi video</Label>
            <Select
              value={settings.refreshMode}
              onValueChange={(value) => updateSettings({ refreshMode: value as VideoRefreshMode })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        </>
      )}
    </div>
  );
}
