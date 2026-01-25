import { ThemeToggle } from '@/components/ThemeToggle';
import { FocusModeTimer } from '@/components/FocusModeTimer';
import { MiniMusicPlayer } from '@/components/MiniMusicPlayer';
import { UpcomingReminders } from '@/components/UpcomingReminders';
import { SettingsPanel } from '@/components/SettingsPanel';
import { VideoBackground } from '@/components/VideoBackground';
import { BackgroundScene } from '@/components/BackgroundScene';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useHealthReminders } from '@/hooks/useHealthReminders';
import { useTheme } from '@/hooks/useTheme';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';
import { cn } from '@/lib/utils';

const Index = () => {
  useTheme();
  
  const pomodoro = usePomodoro();
  const reminders = useHealthReminders();
  const pexels = usePexelsVideo();

  const isFocusing = pomodoro.mode === 'pomodoro' && pomodoro.isRunning;

  return (
    <div className="min-h-screen transition-theme">
      {/* Background: Video if API key exists, otherwise gradient */}
      {pexels.settings.enabled && pexels.settings.apiKey ? (
        <VideoBackground timerMode={pomodoro.mode} isRunning={pomodoro.isRunning} />
      ) : (
        <BackgroundScene timerMode={pomodoro.mode} />
      )}

      {/* Header - fades when focusing */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-700",
        isFocusing 
          ? "opacity-30 hover:opacity-100 blur-[1px] hover:blur-0" 
          : "opacity-100"
      )}>
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full animate-slide-down">
            <img src="/favicon.png" alt="FocusFlow" className="w-6 h-6" />
            <span className="font-semibold">FocusFlow</span>
          </div>
          <div className="flex items-center gap-2 glass-effect px-2 py-1 rounded-full animate-slide-down">
            <ThemeToggle />
            <SettingsPanel pomodoro={pomodoro} pexels={pexels} />
          </div>
        </div>
      </header>

      {/* Main Content - Focus Mode Layout */}
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
        {/* Timer - always prominent */}
        <div className="animate-zoom-in" style={{ animationDelay: '0.15s' }}>
          <FocusModeTimer pomodoro={pomodoro} />
        </div>

        {/* Bottom widgets - blur when focusing */}
        <div className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 space-y-3 transition-all duration-700",
          isFocusing 
            ? "opacity-40 hover:opacity-100 blur-[2px] hover:blur-0 scale-95 hover:scale-100" 
            : "opacity-100"
        )}>
          {/* Music player with visualizer */}
          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <MiniMusicPlayer isFocusing={isFocusing} />
          </div>

          {/* Upcoming reminders */}
          <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <UpcomingReminders 
              reminders={reminders.reminders} 
              timeUntilNext={reminders.timeUntilNext}
              formatTimeRemaining={reminders.formatTimeRemaining}
            />
          </div>
        </div>
      </main>

      {/* Footer - hidden when focusing */}
      <footer className={cn(
        "fixed bottom-2 left-0 right-0 text-center text-xs text-muted-foreground transition-all duration-500",
        isFocusing ? "opacity-0" : "opacity-60"
      )}>
        <p>Tập trung. Nghỉ ngơi. Lặp lại. 🍅</p>
      </footer>
    </div>
  );
};

export default Index;
