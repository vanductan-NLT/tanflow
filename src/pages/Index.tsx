import { ThemeToggle } from '@/components/ThemeToggle';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { HealthReminders } from '@/components/HealthReminders';
import { SettingsPanel } from '@/components/SettingsPanel';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useHealthReminders } from '@/hooks/useHealthReminders';
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  // Initialize theme on mount
  useTheme();
  
  const pomodoro = usePomodoro();
  const reminders = useHealthReminders();

  return (
    <div className="min-h-screen bg-background transition-theme">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-effect">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="FocusFlow" className="w-7 h-7" />
            <span className="font-semibold text-lg">FocusFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SettingsPanel pomodoro={pomodoro} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Timer */}
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <PomodoroTimer pomodoro={pomodoro} />
          </div>

          {/* Right Column - Music & Reminders */}
          <div className="lg:w-80 space-y-4">
            <YouTubePlayer />
            <HealthReminders reminders={reminders} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-muted-foreground">
        <p>Tập trung. Nghỉ ngơi. Lặp lại. 🍅</p>
      </footer>
    </div>
  );
};

export default Index;
