import { ThemeToggle } from '@/components/ThemeToggle';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { HealthReminders } from '@/components/HealthReminders';
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
    <div className="min-h-screen bg-background/80 transition-theme">
      {/* Background: Video if API key exists, otherwise gradient */}
      {pexels.settings.enabled && pexels.settings.apiKey ? (
        <VideoBackground timerMode={pomodoro.mode} isRunning={pomodoro.isRunning} />
      ) : (
        <BackgroundScene timerMode={pomodoro.mode} />
      )}

      {/* Header - blur when focusing */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 glass-effect transition-all duration-700",
        isFocusing && "opacity-30 blur-[2px] hover:opacity-100 hover:blur-0"
      )}>
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-slide-down">
            <img src="/favicon.png" alt="FocusFlow" className="w-7 h-7" />
            <span className="font-semibold text-lg">FocusFlow</span>
          </div>
          <div className="flex items-center gap-2 animate-slide-down">
            <ThemeToggle />
            <SettingsPanel pomodoro={pomodoro} pexels={pexels} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Timer (always clear) */}
          <div 
            className="flex-1 flex flex-col items-center justify-center py-8 animate-zoom-in"
            style={{ animationDelay: '0.15s' }}
          >
            <PomodoroTimer pomodoro={pomodoro} />
          </div>

          {/* Right Column - Music & Reminders (blur when focusing) */}
          <div className={cn(
            "lg:w-80 space-y-4 transition-all duration-700",
            isFocusing && "opacity-40 blur-[3px] hover:opacity-100 hover:blur-0 scale-[0.98] hover:scale-100"
          )}>
            <div 
              className="animate-slide-up"
              style={{ animationDelay: '0.25s' }}
            >
              <YouTubePlayer />
            </div>
            <div 
              className="animate-slide-up"
              style={{ animationDelay: '0.35s' }}
            >
              <HealthReminders reminders={reminders} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - fade when focusing */}
      <footer className={cn(
        "fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-muted-foreground transition-all duration-500",
        isFocusing ? "opacity-0" : "opacity-100"
      )}>
        <p>Tập trung. Nghỉ ngơi. Lặp lại. 🍅</p>
      </footer>
    </div>
  );
};

export default Index;
