import { usePomodoro, TimerMode } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface FocusModeTimerProps {
  pomodoro: ReturnType<typeof usePomodoro>;
}

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

export function FocusModeTimer({ pomodoro }: FocusModeTimerProps) {
  const { 
    mode, 
    formattedTime, 
    isRunning, 
    progress,
    start, 
    pause, 
    reset, 
    skip,
    completedPomodoros 
  } = pomodoro;

  return (
    <div className="flex flex-col items-center gap-6 p-8 glass-effect rounded-3xl backdrop-blur-2xl">
      {/* Mode indicator */}
      <div className={cn("text-sm font-medium uppercase tracking-wider", modeColors[mode])}>
        {modeLabels[mode]}
      </div>

      {/* Large timer display */}
      <div className={cn(
        "text-8xl md:text-9xl font-mono font-bold tracking-tight",
        modeColors[mode]
      )}>
        {formattedTime}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <Progress 
          value={progress} 
          className="h-1.5"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-12 w-12 rounded-full hover:bg-foreground/10"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          className={cn(
            "h-16 w-16 rounded-full shadow-lg transition-all",
            isRunning 
              ? "bg-foreground/20 hover:bg-foreground/30 text-foreground" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRunning ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skip}
          className="h-12 w-12 rounded-full hover:bg-foreground/10"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Session counter */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Phiên #{completedPomodoros + 1}</span>
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < (completedPomodoros % 4)
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
