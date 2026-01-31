import { Play, Pause, RotateCcw, SkipForward, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePomodoro, TimerMode, PomodoroSettings } from '@/hooks/usePomodoro';

interface PomodoroTimerProps {
  pomodoro: ReturnType<typeof usePomodoro>;
}

export function PomodoroTimer({ pomodoro }: PomodoroTimerProps) {
  const {
    mode,
    formattedTime,
    isRunning,
    completedPomodoros,
    settings,
    progress,
    start,
    pause,
    reset,
    skip,
    switchMode,
    updateSettings,
  } = pomodoro;

  // Get duration key and limits based on mode
  const getDurationConfig = (m: TimerMode): { key: keyof PomodoroSettings; min: number; max: number; step: number } => {
    switch (m) {
      case 'pomodoro':
        return { key: 'pomodoroDuration', min: 5, max: 90, step: 5 };
      case 'shortBreak':
        return { key: 'shortBreakDuration', min: 1, max: 15, step: 1 };
      case 'longBreak':
        return { key: 'longBreakDuration', min: 5, max: 30, step: 5 };
      case 'meditation':
        return { key: 'meditationDuration', min: 5, max: 60, step: 5 };
    }
  };

  const config = getDurationConfig(mode);
  const currentDuration = settings[config.key] as number;

  const handleIncrease = () => {
    if (currentDuration < config.max) {
      updateSettings({ [config.key]: currentDuration + config.step });
    }
  };

  const handleDecrease = () => {
    if (currentDuration > config.min) {
      updateSettings({ [config.key]: currentDuration - config.step });
    }
  };

  const modeLabels: Record<TimerMode, string> = {
    pomodoro: 'Tập trung',
    shortBreak: 'Nghỉ ngắn',
    longBreak: 'Nghỉ dài',
    meditation: 'Thiền',
  };

  const modeColors: Record<TimerMode, string> = {
    pomodoro: 'text-primary',
    shortBreak: 'text-info',
    longBreak: 'text-[hsl(var(--timer-long-break))]',
    meditation: 'text-[hsl(var(--timer-meditation))]',
  };

  const progressColors: Record<TimerMode, string> = {
    pomodoro: 'bg-primary',
    shortBreak: 'bg-info',
    longBreak: 'bg-[hsl(var(--timer-long-break))]',
    meditation: 'bg-[hsl(var(--timer-meditation))]',
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 rounded-full bg-muted/50 flex-wrap justify-center">
        {(['pomodoro', 'shortBreak', 'longBreak', 'meditation'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              mode === m
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center w-72 h-72">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={cn('transition-all duration-1000', modeColors[mode])}
          />
        </svg>

        {/* Time Display with +/- controls when paused */}
        <div className="flex flex-col items-center z-10">
          <div className="flex items-center gap-2">
            {/* Decrease button - only show when paused */}
            <div className={cn(
              "transition-all duration-200",
              isRunning ? "opacity-0 pointer-events-none w-0" : "opacity-100 w-12"
            )}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                disabled={currentDuration <= config.min}
                className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30"
                aria-label="Giảm thời gian"
              >
                <Minus className="h-6 w-6" />
              </Button>
            </div>
            
            <span className={cn('text-7xl font-light tracking-tight tabular-nums', modeColors[mode])}>
              {formattedTime}
            </span>
            
            {/* Increase button - only show when paused */}
            <div className={cn(
              "transition-all duration-200",
              isRunning ? "opacity-0 pointer-events-none w-0" : "opacity-100 w-12"
            )}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                disabled={currentDuration >= config.max}
                className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30"
                aria-label="Tăng thời gian"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <span className="text-sm text-muted-foreground mt-2">
            {modeLabels[mode]}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-12 w-12 rounded-full"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          className={cn(
            'h-16 w-16 rounded-full text-lg font-medium shadow-lg transition-all duration-200',
            isRunning && 'bg-muted text-foreground hover:bg-muted/80'
          )}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skip}
          className="h-12 w-12 rounded-full"
          aria-label="Skip to next"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Session Counter */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Session:</span>
        <div className="flex gap-1">
          {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i < (completedPomodoros % settings.longBreakInterval)
                  ? progressColors[mode]
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
        <span className="ml-1">
          #{Math.floor(completedPomodoros / settings.longBreakInterval) + 1}
        </span>
      </div>
    </div>
  );
}
