import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePomodoro } from '@/hooks/usePomodoro';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';
import { PexelsSettings } from '@/components/PexelsSettings';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();

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
        </div>
      </SheetContent>
    </Sheet>
  );
}
