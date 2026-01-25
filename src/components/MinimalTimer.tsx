import { usePomodoro, TimerMode } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/hooks/useTasks';

interface MinimalTimerProps {
  pomodoro: ReturnType<typeof usePomodoro>;
  activeTask?: Task | null;
}

const modeColors: Record<TimerMode, string> = {
  pomodoro: 'text-primary',
  shortBreak: 'text-info',
  longBreak: 'text-[hsl(var(--timer-long-break))]',
  meditation: 'text-[hsl(var(--timer-meditation))]',
};

export function MinimalTimer({ pomodoro, activeTask }: MinimalTimerProps) {
  const { mode, formattedTime, isRunning, start, pause, reset, skip } = pomodoro;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full px-4">
      {/* Giant timer */}
      <div className={cn(
        "text-6xl sm:text-8xl md:text-[10rem] lg:text-[14rem] font-mono font-bold tracking-tighter leading-none",
        "drop-shadow-2xl text-center",
        modeColors[mode]
      )}>
        {formattedTime}
      </div>

      {/* Active Task Name - Below timer */}
      {activeTask && !activeTask.isCompleted && mode === 'pomodoro' && (
        <p className="text-lg sm:text-xl text-white/80 font-medium truncate max-w-[280px] sm:max-w-md text-center animate-fade-in">
          {activeTask.title}
        </p>
      )}

      {/* Minimal controls */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>

        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          className={cn(
            "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full shadow-2xl transition-all",
            isRunning
              ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRunning ? (
            <Pause className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
          ) : (
            <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 ml-0.5 sm:ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skip}
          className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>
      </div>
    </div>
  );
}
