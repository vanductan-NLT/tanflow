import { cn } from '@/lib/utils';
import { HealthReminder } from '@/hooks/useHealthReminders';
import { ReminderIcon } from '@/components/icons/ReminderIcon';
import { useLanguage } from '@/contexts/LanguageContext';
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

export function MinimalReminders({ reminders, timeUntilNext, formatTimeRemaining }: MinimalRemindersProps) {
  const { language } = useLanguage();
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
                  <ReminderIcon iconKey={reminder.icon} size="lg" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/90 backdrop-blur-sm">
                <p className="font-medium">{reminder.name}</p>
                <p className="text-xs text-muted-foreground">{language === 'en' ? 'in' : 'trong'} {formatTimeRemaining(timeLeft)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
