import { RefreshCw, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBackground, BackgroundSettings as BGSettings } from '@/hooks/useBackground';

const CATEGORIES = [
  { value: 'nature', label: '🌿 Thiên nhiên' },
  { value: 'forest', label: '🌲 Rừng' },
  { value: 'mountain', label: '⛰️ Núi' },
  { value: 'ocean', label: '🌊 Biển' },
  { value: 'sky', label: '☁️ Bầu trời' },
];

interface BackgroundSettingsProps {
  background: ReturnType<typeof useBackground>;
}

export function BackgroundSettings({ background }: BackgroundSettingsProps) {
  const { settings, updateSettings, refreshImage, isLoading } = background;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Image className="h-4 w-4" />
        <span>Hình nền động</span>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label htmlFor="bg-enabled">Bật hình nền</Label>
        <Switch
          id="bg-enabled"
          checked={settings.enabled}
          onCheckedChange={(enabled) => updateSettings({ enabled })}
        />
      </div>

      {settings.enabled && (
        <>
          {/* Category selection */}
          <div className="space-y-2">
            <Label>Chủ đề</Label>
            <Select
              value={settings.category}
              onValueChange={(category) => updateSettings({ category })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-change toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-change">Tự động đổi ảnh</Label>
            <Switch
              id="auto-change"
              checked={settings.autoChange}
              onCheckedChange={(autoChange) => updateSettings({ autoChange })}
            />
          </div>

          {/* Change interval */}
          {settings.autoChange && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Thời gian đổi ảnh</Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {settings.changeInterval} phút
                </span>
              </div>
              <Slider
                value={[settings.changeInterval]}
                onValueChange={([v]) => updateSettings({ changeInterval: v })}
                min={1}
                max={30}
                step={1}
              />
            </div>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshImage}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Đổi ảnh nền
          </Button>
        </>
      )}
    </div>
  );
}

// Helper import
import { cn } from '@/lib/utils';
