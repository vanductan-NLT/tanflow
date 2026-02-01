import { Video, Trees, TreePine, Waves, Mountain, Cloud, CloudRain, Sunset, CloudSun, Shuffle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PexelsSettingsProps {
  pexels: ReturnType<typeof usePexelsVideo>;
}

interface CategoryConfig {
  labelKey: string;
  icon: LucideIcon;
  color: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  random: { labelKey: 'background.random', icon: Shuffle, color: 'text-purple-500' },
  nature: { labelKey: 'background.nature', icon: Trees, color: 'text-green-500' },
  forest: { labelKey: 'background.forest', icon: TreePine, color: 'text-emerald-600' },
  ocean: { labelKey: 'background.ocean', icon: Waves, color: 'text-blue-500' },
  mountains: { labelKey: 'background.mountains', icon: Mountain, color: 'text-slate-500' },
  sky: { labelKey: 'background.sky', icon: CloudSun, color: 'text-sky-400' },
  rain: { labelKey: 'background.rain', icon: CloudRain, color: 'text-indigo-400' },
  sunset: { labelKey: 'background.sunset', icon: Sunset, color: 'text-orange-500' },
  clouds: { labelKey: 'background.clouds', icon: Cloud, color: 'text-gray-400' },
};

const REFRESH_MODE_OPTIONS: { value: VideoRefreshMode; labelKey: string }[] = [
  { value: 'off', labelKey: 'background.refreshOff' },
  { value: 'on-pomodoro', labelKey: 'background.refreshOnPomodoro' },
  { value: 'on-video-end', labelKey: 'background.refreshOnVideoEnd' },
  { value: '10', labelKey: 'background.refreshEvery10' },
  { value: '15', labelKey: 'background.refreshEvery15' },
  { value: '30', labelKey: 'background.refreshEvery30' },
  { value: '60', labelKey: 'background.refreshEvery60' },
];

export function PexelsSettings({ pexels }: PexelsSettingsProps) {
  const { settings, updateSettings, refreshVideo, isLoading, error, categories } = pexels;
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Video className="h-4 w-4" />
        <span>{t('background.title')}</span>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label htmlFor="video-enabled">{t('background.enable')}</Label>
        <Switch
          id="video-enabled"
          checked={settings.enabled}
          onCheckedChange={(enabled) => updateSettings({ enabled })}
        />
      </div>

      {settings.enabled && (
        <>
          {/* Category */}
          <div className="space-y-2">
            <Label>{t('background.category')}</Label>
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
                        {t(config.labelKey)}
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
                        {t(config.labelKey)}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Auto refresh mode - unified dropdown */}
          <div className="space-y-2">
            <Label>{t('background.autoRefresh')}</Label>
            <Select
              value={settings.refreshMode}
              onValueChange={(value) => updateSettings({ refreshMode: value as VideoRefreshMode })}
            >
              <SelectTrigger>
                <SelectValue>
                  {(() => {
                    const option = REFRESH_MODE_OPTIONS.find(o => o.value === settings.refreshMode);
                    return option ? t(option.labelKey) : settings.refreshMode;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {REFRESH_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
