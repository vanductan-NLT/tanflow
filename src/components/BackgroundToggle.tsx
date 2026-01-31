import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBackground, GRADIENT_THEMES, GradientTheme } from '@/hooks/useBackground';
import { cn } from '@/lib/utils';

interface BackgroundToggleProps {
  background: ReturnType<typeof useBackground>;
}

export function BackgroundToggle({ background }: BackgroundToggleProps) {
  const { settings, updateSettings } = background;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Palette className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="bg-enabled" className="font-medium">Nền gradient</Label>
            <Switch
              id="bg-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          {settings.enabled && (
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
                    <div 
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br",
                        themeData.colors
                      )} 
                    />
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-[10px] font-medium text-white pb-1 drop-shadow-sm">
                        {themeData.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
