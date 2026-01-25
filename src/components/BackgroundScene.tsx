import { useBackground, GRADIENT_THEMES } from '@/hooks/useBackground';
import { cn } from '@/lib/utils';
import { TimerMode } from '@/hooks/usePomodoro';

interface BackgroundSceneProps {
  timerMode?: TimerMode;
}

export function BackgroundScene({ timerMode = 'pomodoro' }: BackgroundSceneProps) {
  const { settings, theme } = useBackground();

  if (!settings.enabled) {
    return null;
  }

  // When focusing (pomodoro), show gradient more clearly
  // When resting, overlay is heavier for a calmer feel
  const isFocusing = timerMode === 'pomodoro';
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br animated-gradient particles transition-all duration-1000",
          theme.colors
        )}
      />

      {/* Overlay that adjusts based on timer mode */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-all duration-700",
          isFocusing 
            ? "from-background/20 via-background/10 to-background/40" 
            : "from-background/50 via-background/40 to-background/70"
        )} 
      />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette" />
    </div>
  );
}
