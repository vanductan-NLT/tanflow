import { useEffect, useRef, useCallback, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { MinimalTimer } from '@/components/MinimalTimer';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { HealthReminders } from '@/components/HealthReminders';
import { SettingsPanel } from '@/components/SettingsPanel';
import { VideoBackground } from '@/components/VideoBackground';
import { BackgroundScene } from '@/components/BackgroundScene';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { MinimalReminders } from '@/components/MinimalReminders';
import { QuoteDisplay } from '@/components/QuoteDisplay';
import { TaskList } from '@/components/TaskList';
import { TaskCompleteDialog } from '@/components/TaskCompleteDialog';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useHealthReminders } from '@/hooks/useHealthReminders';
import { useTheme } from '@/hooks/useTheme';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useNotificationPopup } from '@/hooks/useNotificationPopup';
import { useTasks, Task } from '@/hooks/useTasks';

const Index = () => {
  useTheme();
  
  // Task management
  const tasks = useTasks();
  const [taskCompleteDialogOpen, setTaskCompleteDialogOpen] = useState(false);
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  
  // Notification system - must be called before usePomodoro
  const { showNotification: showPiPNotification } = useNotificationPopup();
  
  // Browser notification helper
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.png',
        tag: 'pomodoro-complete',
      });
    }
  }, []);
  
  // Handle pomodoro complete - increment task cycle
  const handlePomodoroComplete = useCallback(() => {
    if (tasks.activeTaskId) {
      const taskCompleted = tasks.incrementCycle(tasks.activeTaskId);
      if (taskCompleted) {
        // Task reached target cycles, show completion dialog
        const task = tasks.tasks.find(t => t.id === tasks.activeTaskId);
        if (task) {
          setCompletedTask({ ...task, completedCycles: task.completedCycles + 1 });
          setTaskCompleteDialogOpen(true);
        }
      }
    }
  }, [tasks]);
  
  const pomodoro = usePomodoro({
    showPiPNotification,
    showBrowserNotification,
    onPomodoroComplete: handlePomodoroComplete,
  });
  const reminders = useHealthReminders({ pauseReminders: pomodoro.mode === 'meditation' && pomodoro.isRunning });
  const pexels = usePexelsVideo();
  const youtube = useYouTubePlayer();

  // Track previous completed count to detect new completions
  const prevCompletedRef = useRef(pomodoro.completedPomodoros);
  
  // Refresh video when a pomodoro completes
  useEffect(() => {
    if (pomodoro.completedPomodoros > prevCompletedRef.current) {
      if (pexels.shouldRefreshOnPomodoro && pexels.settings.enabled && pexels.settings.apiKey) {
        pexels.refreshVideo();
      }
    }
    prevCompletedRef.current = pomodoro.completedPomodoros;
  }, [pomodoro.completedPomodoros, pexels]);

  // Task completion handlers
  const handleTaskComplete = (taskId: string) => {
    tasks.markComplete(taskId);
    setCompletedTask(null);
  };

  const handleAddMoreTime = (taskId: string, additionalCycles: number) => {
    tasks.addMoreCycles(taskId, additionalCycles);
    setCompletedTask(null);
  };

  const isFocusing = (pomodoro.mode === 'pomodoro' || pomodoro.mode === 'meditation') && pomodoro.isRunning;
  const isMeditating = pomodoro.mode === 'meditation';

  return (
    <div className="min-h-screen transition-theme">
      {/* Hidden YouTube Player */}
      <div className="hidden">
        <div id="hidden-youtube-player" />
      </div>

      {/* Background: Video if API key exists, otherwise gradient */}
      {pexels.settings.enabled && pexels.settings.apiKey ? (
        <VideoBackground timerMode={pomodoro.mode} isRunning={pomodoro.isRunning} pexels={pexels} />
      ) : (
        <BackgroundScene timerMode={pomodoro.mode} />
      )}

      {/* ===== FOCUS MODE UI ===== */}
      {isFocusing ? (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-fade-in">
          {/* Inspirational Quote - only show when no active task */}
          {!tasks.activeTask && (
            <div className="absolute top-8 sm:top-12 md:top-16 left-0 right-0 px-4">
              <QuoteDisplay mode={pomodoro.mode} />
            </div>
          )}

          {/* Minimal Timer (shows active task name) */}
          <MinimalTimer pomodoro={pomodoro} activeTask={tasks.activeTask} />

          {/* Bottom bar: Visualizer + Reminders (hide reminders in meditation) */}
          <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 w-full max-w-sm sm:max-w-md md:max-w-lg px-4">
            {/* Audio Visualizer */}
            <AudioVisualizer 
              isPlaying={youtube.isPlaying} 
              className="h-10 sm:h-12 md:h-16 w-full max-w-[200px] sm:max-w-[256px] md:max-w-[320px]"
              barCount={24}
            />

            {/* Health reminder icons - only show when NOT meditating */}
            {!isMeditating && (
              <MinimalReminders 
                reminders={reminders.reminders}
                timeUntilNext={reminders.timeUntilNext}
                formatTimeRemaining={reminders.formatTimeRemaining}
              />
            )}
          </div>
        </div>
      ) : (
        /* ===== NORMAL UI ===== */
        <>
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-40 glass-effect animate-slide-down">
            <div className="container max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-0">
                <img src="/favicon.png" alt="FocusFlow" className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                <span className="font-semibold text-base sm:text-lg truncate">FocusFlow</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <ThemeToggle />
                <SettingsPanel pomodoro={pomodoro} pexels={pexels} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 sm:pb-8">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 xl:gap-16">
              {/* Left Column - Timer */}
              <div 
                className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 lg:py-12 animate-zoom-in"
                style={{ animationDelay: '0.15s' }}
              >
                <PomodoroTimer pomodoro={pomodoro} />
              </div>

              {/* Right Column - Tasks, Music & Reminders */}
              <div className="w-full lg:w-80 xl:w-96 space-y-4 lg:space-y-6">
                {/* Tasks */}
                <div 
                  className="animate-slide-up"
                  style={{ animationDelay: '0.20s' }}
                >
                  <TaskList
                    tasks={tasks.tasks}
                    activeTaskId={tasks.activeTaskId}
                    pomodoroDuration={pomodoro.settings.pomodoroDuration}
                    onAddTask={tasks.addTask}
                    onDeleteTask={tasks.deleteTask}
                    onSetActiveTask={tasks.setActiveTask}
                  />
                </div>
                <div 
                  className="animate-slide-up"
                  style={{ animationDelay: '0.30s' }}
                >
                  <YouTubePlayer {...youtube} />
                </div>
                <div 
                  className="animate-slide-up"
                  style={{ animationDelay: '0.40s' }}
                >
                  <HealthReminders reminders={reminders} />
                </div>
              </div>
            </div>
          </main>

        </>
      )}

      {/* Task Complete Dialog */}
      <TaskCompleteDialog
        open={taskCompleteDialogOpen}
        onOpenChange={setTaskCompleteDialogOpen}
        task={completedTask}
        onComplete={handleTaskComplete}
        onAddMoreTime={handleAddMoreTime}
      />
    </div>
  );
};

export default Index;
