import { useBackground } from '@/hooks/useBackground';
import { cn } from '@/lib/utils';
import { TimerMode } from '@/hooks/usePomodoro';

interface BackgroundSceneProps {
  timerMode?: TimerMode;
}

export function BackgroundScene({ timerMode = 'pomodoro' }: BackgroundSceneProps) {
  const { theme } = useBackground();

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

      {/* Overlay - consistent dark overlay regardless of theme */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-all duration-700",
          isFocusing 
            ? "from-black/10 via-black/5 to-black/30" 
            : "from-black/30 via-black/20 to-black/50"
        )} 
      />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette" />
    </div>
  );
}
