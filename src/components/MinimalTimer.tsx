import { usePomodoro, TimerMode } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimalTimerProps {
  pomodoro: ReturnType<typeof usePomodoro>;
}

const modeColors: Record<TimerMode, string> = {
  pomodoro: 'text-primary',
  shortBreak: 'text-info',
  longBreak: 'text-[hsl(var(--timer-long-break))]',
};

export function MinimalTimer({ pomodoro }: MinimalTimerProps) {
  const { mode, formattedTime, isRunning, start, pause, reset, skip } = pomodoro;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Giant timer */}
      <div className={cn(
        "text-[12rem] md:text-[16rem] font-mono font-bold tracking-tighter leading-none",
        "drop-shadow-2xl",
        modeColors[mode]
      )}>
        {formattedTime}
      </div>

      {/* Minimal controls */}
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>

        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          className={cn(
            "h-20 w-20 rounded-full shadow-2xl transition-all",
            isRunning 
              ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRunning ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skip}
          className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
