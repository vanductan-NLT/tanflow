import { ThemeToggle } from '@/components/ThemeToggle';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { HealthReminders } from '@/components/HealthReminders';
import { SettingsPanel } from '@/components/SettingsPanel';
import { BackgroundScene } from '@/components/BackgroundScene';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useHealthReminders } from '@/hooks/useHealthReminders';
import { useTheme } from '@/hooks/useTheme';
import { useBackground } from '@/hooks/useBackground';

const Index = () => {
  // Initialize theme on mount
  useTheme();
  
  const pomodoro = usePomodoro();
  const reminders = useHealthReminders();
  const background = useBackground();

  return (
    <div className="min-h-screen bg-background/80 transition-theme">
      {/* Dynamic Background */}
      <BackgroundScene timerMode={pomodoro.mode} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-effect animate-slide-down">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="FocusFlow" className="w-7 h-7" />
            <span className="font-semibold text-lg">FocusFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SettingsPanel pomodoro={pomodoro} background={background} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Timer */}
          <div 
            className="flex-1 flex flex-col items-center justify-center py-8 animate-zoom-in"
            style={{ animationDelay: '0.15s' }}
          >
            <PomodoroTimer pomodoro={pomodoro} />
          </div>

          {/* Right Column - Music & Reminders */}
          <div className="lg:w-80 space-y-4">
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

      {/* Footer */}
      <footer 
        className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-muted-foreground animate-fade-in"
        style={{ animationDelay: '0.5s' }}
      >
        <p>Tập trung. Nghỉ ngơi. Lặp lại. 🍅</p>
      </footer>
    </div>
  );
};

export default Index;
