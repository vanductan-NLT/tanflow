import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REMINDER_ICONS } from '@/components/icons/ReminderIcon';
import { useLanguage } from '@/contexts/LanguageContext';

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

const Notification = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const type = searchParams.get('type') || 'pomodoro';
  const title = searchParams.get('title') || t('reminders.title');
  const message = searchParams.get('message') || '';
  const icon = searchParams.get('icon') || '';
  const reminderId = searchParams.get('id') || '';

  // Setup BroadcastChannel for communication with main window
  useEffect(() => {
    channelRef.current = new BroadcastChannel('focusflow-notifications');
    return () => channelRef.current?.close();
  }, []);

  // Play notification sound
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoAMprcmqiFJQBBr+GZdC0AWrDieVUhR7vh9qdaC0q04NmrfxQFbMP52ZJQABCmz+O3k1wCOK3l9rJ0EgFLtuD3r4ENAFq04/q1ixMBWrri+rJ/CgFfvOj8tnwKAV294fqzfQsCV73f+bF7CgJbvN/5sHkJAl6+4fqxdwgCX7/i+7B1BwJgwOP7r3MFAmHA4/ytcQQCYcDj/K1vAgJhwOP8rG0BAmHA4/ysawECYcDj/KtpAQJhwOP8q2cAAmHA4/yqZQACYcDj/KpjAAJhwOP8qWEAAmHA4/ypXwACYcHk/KldAAJhweT8qFsAAmHB5PynWQACYcHk/KdXAAJhweT8plQAAmHB5PylUgACYcHk/KVQAAJhweX8pE4AAmHB5fykTAACYcHl/KNKAAJhweX8o0gAAmHB5fyjRgACYcHl/KJEAAJhweX8okIAAmHC5vyiQAACYcLm/KE+AAJhwub8oTwAAmHC5vygOgACYcLm/KA4AAJhwub8oDYAAmHC5/yfNAACYcLn/J8yAAJhwuf8ny8AAmHC5/yeL gACYcLn/J4sAAJhwuf8nioAAmHC5/ydKAACYcPo/J0mAAJhw+j8nSQAAmHD6PycIgACYcPo/JwgAAJhw+j8nB4AAmHD6PybHAACYcPo/JsaAAJhw+n8mxgAAmHD6fybFgACYcPp/JoUAAJhw+n8mhIAAmHD6fyaEAACYcTq/JkOAAJhxOr8mQwAAmHE6vyZCgACYcTq/JkIAAJhxOr8mAYAAmHE6vyYBAACYcTq/JgDAAJhxOr8l/8AAmHE6/yX/AACYcTr/Jf6AAJhxOv8l/gAAmHE6/yW9gACYcTr/Jb0AAJhxOv8lvIAAmHF7PyW8AACYcXs/JbuAAJhxez8lu0AAmHF7PyW6wACYcXs/JbpAAJhxez8lugAAmHF7PyV5gACYcXs/JXkAAJhxe38leIAAmHF7fyV4AACYcXt/JXeAAJhxe38ld0AAmHG7vyU2wACYcbu/JTZAAJhxu78lNcAAmHG7vyU1QACYcbu/JTUAAFKPF5ob29zZg==';
    audioRef.current.play().catch(console.error);

    // Play again after 2 seconds
    const playAgain = setTimeout(() => {
      audioRef.current?.play().catch(console.error);
    }, 2000);

    return () => clearTimeout(playAgain);
  }, []);

  // Auto-close countdown
  useEffect(() => {
    if (countdown <= 0) {
      window.close();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleDismiss = () => {
    channelRef.current?.postMessage({
      action: 'dismiss',
      type,
      id: reminderId,
    });
    window.close();
  };

  const handleSnooze = (minutes: number) => {
    channelRef.current?.postMessage({
      action: 'snooze',
      type,
      id: reminderId,
      minutes,
    });
    window.close();
  };

  const getHealthIcon = (iconKey: string) => {
    const IconComponent = REMINDER_ICONS[iconKey];
    const colorClass = iconColors[iconKey] || 'text-blue-400';
    
    if (IconComponent) {
      return <IconComponent className={cn("h-16 w-16", colorClass)} strokeWidth={1.5} />;
    }
    
    // Fallback for unknown icons
    const FallbackIcon = REMINDER_ICONS['droplets'];
    return <FallbackIcon className="h-16 w-16 text-blue-400" strokeWidth={1.5} />;
  };

  const getTypeStyles = () => {
    if (type === 'pomodoro') {
      return {
        bg: 'from-primary/30 via-primary/10 to-background',
        iconBg: 'bg-primary/20',
        icon: <CheckCircle2 className="h-16 w-16 text-primary" />,
      };
    } else if (type === 'break') {
      return {
        bg: 'from-info/30 via-info/10 to-background',
        iconBg: 'bg-info/20',
        icon: <Clock className="h-16 w-16 text-info" />,
      };
    } else {
      return {
        bg: 'from-green-500/30 via-green-500/10 to-background',
        iconBg: 'bg-green-500/20',
        icon: icon ? getHealthIcon(icon) : getHealthIcon('droplets'),
      };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={cn(
      "min-h-screen w-full flex flex-col items-center justify-center p-8",
      "bg-gradient-to-br",
      styles.bg
    )}>
      {/* Animated ring */}
      <div className="relative mb-6">
        <div className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-25",
          type === 'pomodoro' ? 'bg-primary' : type === 'break' ? 'bg-info' : 'bg-green-500'
        )} />
        <div className={cn(
          "relative rounded-full p-6",
          styles.iconBg
        )}>
          {styles.icon}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center mb-3">
        {decodeURIComponent(title)}
      </h1>

      {/* Message */}
      {message && (
        <p className="text-muted-foreground text-center mb-6 max-w-xs">
          {decodeURIComponent(message)}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {type === 'health' && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSnooze(5)}
          >
            {t('reminders.snooze')} 5 {t('reminders.minutes')}
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleDismiss}
          className="min-w-[120px]"
        >
          {type === 'health' ? t('reminders.done') : t('reminders.continue')}
        </Button>
      </div>

      {/* Auto-close countdown */}
      <p className="text-sm text-muted-foreground mt-8">
        {t('reminders.autoClose')} {countdown} {t('reminders.seconds')}
      </p>
    </div>
  );
};

export default Notification;
