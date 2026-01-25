import { Bell, Droplets, Eye, Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealthReminder } from '@/hooks/useHealthReminders';

interface UpcomingRemindersProps {
  reminders: HealthReminder[];
  timeUntilNext: Record<string, number>;
  formatTimeRemaining: (seconds: number) => string;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  '💧': <Droplets className="h-4 w-4 text-info" />,
  '👀': <Eye className="h-4 w-4 text-warning" />,
  '🚶': <Footprints className="h-4 w-4 text-success" />,
};

export function UpcomingReminders({ reminders, timeUntilNext, formatTimeRemaining, className }: UpcomingRemindersProps) {
  const enabledReminders = reminders.filter(r => r.enabled).slice(0, 3);
  
  if (enabledReminders.length === 0) return null;

  // Find the next reminder
  let nextReminder: HealthReminder | null = null;
  let minTime = Infinity;
  enabledReminders.forEach(r => {
    const time = timeUntilNext[r.id] || r.intervalMinutes * 60;
    if (time < minTime) {
      minTime = time;
      nextReminder = r;
    }
  });

  return (
    <div className={cn("glass-effect rounded-2xl p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Nhắc nhở sắp tới</span>
        {nextReminder && (
          <span className="text-xs text-muted-foreground ml-auto">
            trong {formatTimeRemaining(minTime)}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {enabledReminders.map(reminder => (
          <div
            key={reminder.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs"
          >
            {iconMap[reminder.icon] || <span>{reminder.icon}</span>}
            <span>{reminder.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
