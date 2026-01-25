import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REMINDER_ICONS } from '@/components/icons/ReminderIcon';

export type NotificationType = 'pomodoro-complete' | 'break-complete' | 'health-reminder';

interface PiPNotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  icon?: string;
  onDismiss: () => void;
  onSnooze?: (minutes: number) => void;
  autoCloseSeconds?: number;
}

// Color mapping for health reminder icons
const iconColors: Record<string, string> = {
  droplets: 'text-blue-400',
  footprints: 'text-green-400',
  eye: 'text-purple-400',
  stretch: 'text-orange-400',
  coffee: 'text-amber-400',
  apple: 'text-red-400',
  leaf: 'text-emerald-400',
  dumbbell: 'text-indigo-400',
  brain: 'text-pink-400',
  heart: 'text-rose-400',
  // Legacy emoji mappings
  '💧': 'text-blue-400',
  '🚶': 'text-green-400',
  '👁️': 'text-purple-400',
  '🧘': 'text-orange-400',
};

export function PiPNotification({
  type,
  title,
  message,
  icon,
  onDismiss,
  onSnooze,
  autoCloseSeconds = 30,
}: PiPNotificationProps) {
  const [countdown, setCountdown] = useState(autoCloseSeconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play sound on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoAMprcmqiFJQBBr+GZdC0AWrDieVUhR7vh9qdaC0q04NmrfxQFbMP52ZJQABCmz+O3k1wCOK3l9rJ0EgFLtuD3r4ENAFq04/q1ixMBWrri+rJ/CgFfvOj8tnwKAV294fqzfQsCV73f+bF7CgJbvN/5sHkJAl6+4fqxdwgCX7/i+7B1BwJgwOP7r3MFAmHA4/ytcQQCYcDj/K1vAgJhwOP8rG0BAmHA4/ysawECYcDj/KtpAQJhwOP8q2cAAmHA4/yqZQACYcDj/KpjAAJhwOP8qWEAAmHA4/ypXwACYcHk/KldAAJhweT8qFsAAmHB5PynWQACYcHk/KdXAAJhweT8plQAAmHB5PylUgACYcHk/KVQAAJhweX8pE4AAmHB5fykTAACYcHl/KNKAAJhweX8o0gAAmHB5fyjRgACYcHl/KJEAAJhweX8okIAAmHC5vyiQAACYcLm/KE+AAJhwub8oTwAAmHC5vygOgACYcLm/KA4AAJhwub8oDYAAmHC5/yfNAACYcLn/J8yAAJhwuf8ny8AAmHC5/yeL gACYcLn/J4sAAJhwuf8nioAAmHC5/ydKAACYcPo/J0mAAJhw+j8nSQAAmHD6PycIgACYcPo/JwgAAJhw+j8nB4AAmHD6PybHAACYcPo/JsaAAJhw+n8mxgAAmHD6fybFgACYcPp/JoUAAJhw+n8mhIAAmHD6fyaEAACYcTq/JkOAAJhxOr8mQwAAmHE6vyZCgACYcTq/JkIAAJhxOr8mAYAAmHE6vyYBAACYcTq/JgDAAJhxOr8l/8AAmHE6/yX/AACYcTr/Jf6AAJhxOv8l/gAAmHE6/yW9gACYcTr/Jb0AAJhxOv8lvIAAmHF7PyW8AACYcXs/JbuAAJhxez8lu0AAmHF7PyW6wACYcXs/JbpAAJhxez8lugAAmHF7PyV5gACYcXs/JXkAAJhxe38leIAAmHF7fyV4AACYcXt/JXeAAJhxe38ld0AAmHG7vyU2wACYcbu/JTZAAJhxu78lNcAAmHG7vyU1QACYcbu/JTUAAFKPF5ob29zZg==';
    audioRef.current.play().catch(console.error);

    // Play again after 2 seconds for emphasis
    const playAgainTimeout = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    }, 2000);

    return () => clearTimeout(playAgainTimeout);
  }, []);

  // Auto-close countdown
  useEffect(() => {
    if (countdown <= 0) {
      onDismiss();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onDismiss]);

  const getHealthIcon = (iconKey: string) => {
    const IconComponent = REMINDER_ICONS[iconKey];
    const colorClass = iconColors[iconKey] || 'text-blue-400';
    
    if (IconComponent) {
      return <IconComponent className={cn("h-12 w-12", colorClass)} strokeWidth={1.5} />;
    }
    
    // Fallback for unknown icons
    const FallbackIcon = REMINDER_ICONS['droplets'];
    return <FallbackIcon className="h-12 w-12 text-blue-400" strokeWidth={1.5} />;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'pomodoro-complete':
        return {
          bg: 'from-primary/20 to-primary/5',
          iconBg: 'bg-primary/20',
          icon: <CheckCircle2 className="h-12 w-12 text-primary" />,
        };
      case 'break-complete':
        return {
          bg: 'from-info/20 to-info/5',
          iconBg: 'bg-info/20',
          icon: <Clock className="h-12 w-12 text-info" />,
        };
      case 'health-reminder':
        return {
          bg: 'from-green-500/20 to-green-500/5',
          iconBg: 'bg-green-500/20',
          icon: icon ? getHealthIcon(icon) : getHealthIcon('droplets'),
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={cn(
      "h-full w-full flex flex-col items-center justify-center p-6",
      "bg-gradient-to-br",
      styles.bg
    )}>
      {/* Icon */}
      <div className={cn(
        "rounded-full p-4 mb-4 animate-pulse",
        styles.iconBg
      )}>
        {styles.icon}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-center mb-2">
        {title}
      </h1>

      {/* Message */}
      {message && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          {message}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        {onSnooze && type === 'health-reminder' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSnooze(5)}
            className="text-xs"
          >
            Snooze 5 phút
          </Button>
        )}
        <Button
          size="sm"
          onClick={onDismiss}
          className="text-xs"
        >
          {type === 'health-reminder' ? 'Đã xong!' : 'Tiếp tục'}
        </Button>
      </div>

      {/* Auto-close countdown */}
      <p className="text-xs text-muted-foreground mt-4">
        Tự đóng sau {countdown}s
      </p>
    </div>
  );
}
