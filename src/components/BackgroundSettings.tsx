import { Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBackground, GRADIENT_THEMES, GradientTheme } from '@/hooks/useBackground';
import { cn } from '@/lib/utils';

interface BackgroundSettingsProps {
  background: ReturnType<typeof useBackground>;
}

export function BackgroundSettings({ background }: BackgroundSettingsProps) {
  const { settings, updateSettings } = background;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Palette className="h-4 w-4" />
        <span>Nền động</span>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label htmlFor="bg-enabled">Bật nền gradient</Label>
        <Switch
          id="bg-enabled"
          checked={settings.enabled}
          onCheckedChange={(enabled) => updateSettings({ enabled })}
        />
      </div>

      {settings.enabled && (
        <>
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Chủ đề gradient</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GRADIENT_THEMES) as GradientTheme[]).map((themeKey) => {
                const themeData = GRADIENT_THEMES[themeKey];
                const isSelected = settings.theme === themeKey;
                
                return (
                  <button
                    key={themeKey}
                    onClick={() => updateSettings({ theme: themeKey })}
                    className={cn(
                      "relative h-12 rounded-lg overflow-hidden transition-all duration-200",
                      "border-2",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/30" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {/* Gradient preview */}
                    <div 
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br",
                        themeData.colors
                      )} 
                    />
                    {/* Label overlay */}
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-[10px] font-medium text-white pb-1 drop-shadow-sm">
                        {themeData.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info text */}
          <p className="text-xs text-muted-foreground">
            💡 Gradient sẽ rõ nét hơn khi bạn đang tập trung
          </p>
        </>
      )}
    </div>
  );
}
