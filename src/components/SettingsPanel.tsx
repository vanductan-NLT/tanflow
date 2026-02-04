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
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>{t('background.colorTheme')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('background.colorThemeDesc')}
                  </p>
                </div>
                
                {/* Compact Color Palette - Horizontal scroll on mobile */}
                <div className="flex flex-wrap gap-2">
                  {themeKeys.map((key) => {
                    const theme = GRADIENT_THEMES[key];
                    const isSelected = background.settings.theme === key;
                    const themeName = language === 'en' ? theme.nameEn : theme.name;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          background.updateSettings({ theme: key });
                        }}
                        className={cn(
                          "group relative flex items-center gap-2 px-2 py-1.5 rounded-full transition-all border",
                          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                          isSelected 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-muted-foreground/50"
                        )}
                        title={themeName}
                      >
                        {/* Color Preview Circle */}
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full shadow-sm flex-shrink-0",
                            "ring-1 ring-inset ring-black/10"
                          )}
                          style={{ background: theme.preview }}
                        />
                        
                        {/* Theme Name */}
                        <span className={cn(
                          "text-xs whitespace-nowrap",
                          isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {themeName}
                        </span>

                        {/* Check indicator */}
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary flex-shrink-0" />
                        )}
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
