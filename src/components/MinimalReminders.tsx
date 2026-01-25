import { Droplets, Eye, Footprints, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealthReminder } from '@/hooks/useHealthReminders';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MinimalRemindersProps {
  reminders: HealthReminder[];
  timeUntilNext: Record<string, number>;
  formatTimeRemaining: (seconds: number) => string;
}

const iconComponents: Record<string, React.ReactNode> = {
  '💧': <Droplets className="h-5 w-5" />,
  '👀': <Eye className="h-5 w-5" />,
  '🚶': <Footprints className="h-5 w-5" />,
  '🧘': <Dumbbell className="h-5 w-5" />,
};

export function MinimalReminders({ reminders, timeUntilNext, formatTimeRemaining }: MinimalRemindersProps) {
  const enabledReminders = reminders.filter(r => r.enabled);
  
  if (enabledReminders.length === 0) return null;

  // Sort by time remaining
  const sortedReminders = [...enabledReminders].sort((a, b) => {
    const timeA = timeUntilNext[a.id] || a.intervalMinutes * 60;
    const timeB = timeUntilNext[b.id] || b.intervalMinutes * 60;
    return timeA - timeB;
  });

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {sortedReminders.slice(0, 4).map((reminder, index) => {
          const timeLeft = timeUntilNext[reminder.id] || reminder.intervalMinutes * 60;
          const isNext = index === 0;
          
          return (
            <Tooltip key={reminder.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                    "backdrop-blur-md",
                    isNext 
                      ? "bg-white/30 text-white scale-110" 
                      : "bg-white/10 text-white/60"
                  )}
                >
                  {iconComponents[reminder.icon] || <span className="text-lg">{reminder.icon}</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/90 backdrop-blur-sm">
                <p className="font-medium">{reminder.name}</p>
                <p className="text-xs text-muted-foreground">trong {formatTimeRemaining(timeLeft)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
