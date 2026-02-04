import { Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePomodoro } from '@/hooks/usePomodoro';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';
import { useBackground, GRADIENT_THEMES, GradientTheme } from '@/hooks/useBackground';
import { PexelsSettings } from '@/components/PexelsSettings';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
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
  const { t, language } = useLanguage();
  const background = useBackground();

  const themeKeys = Object.keys(GRADIENT_THEMES) as GradientTheme[];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('settings.title')}</SheetTitle>
          <SheetDescription>{t('settings.description')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">

          {/* Auto-start next session */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>{t('settings.autoStart')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('settings.autoStartDesc')}
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

          {/* Gradient Background Color Picker - Only show when video is disabled */}
          {!pexels.settings.enabled && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>{t('background.colorTheme')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('background.colorThemeDesc')}
                  </p>
                </div>
                
                {/* Color Palette Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {themeKeys.map((key) => {
                    const theme = GRADIENT_THEMES[key];
                    const isSelected = background.settings.theme === key;
                    const themeName = language === 'en' ? theme.nameEn : theme.name;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          background.updateSettings({ enabled: true, theme: key });
                        }}
                        className={cn(
                          "group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
                          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          isSelected && "ring-2 ring-primary ring-offset-2 bg-muted/30"
                        )}
                      >
                        {/* Color Preview Circle */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full shadow-md transition-transform",
                            "group-hover:scale-110",
                            isSelected && "scale-110"
                          )}
                          style={{ background: theme.preview }}
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full flex items-center justify-center bg-black/20">
                              <Check className="h-5 w-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        
                        {/* Theme Name */}
                        <span className={cn(
                          "text-xs text-center truncate w-full",
                          isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {themeName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
