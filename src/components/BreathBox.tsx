import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BreathPhase, BreathPattern } from '@/hooks/useBreathBox';

interface BreathBoxProps {
  pattern: BreathPattern;
  phase: BreathPhase;
  secondsLeft: number;
  cycleCount: number;
  isRunning: boolean;
  phaseProgress: number;
  targetCycles?: number;
  className?: string;
  variant?: 'normal' | 'minimal';
}

export function BreathBox({
  pattern,
  phase,
  secondsLeft,
  cycleCount,
  isRunning,
  phaseProgress,
  targetCycles = 0,
  className,
  variant = 'normal',
}: BreathBoxProps) {
  const { t } = useLanguage();

  // Phase labels
  const phaseLabels: Record<BreathPhase, string> = {
    inhale: t('breathBox.inhale'),
    holdIn: t('breathBox.holdIn'),
    exhale: t('breathBox.exhale'),
    holdOut: t('breathBox.holdOut'),
  };

  // Calculate circle scale based on phase (smooth, continuous)
  const getCircleScale = (): number => {
    if (!isRunning) return 0.8;
    
    switch (phase) {
      case 'inhale':
        // Grow from 0.6 to 1.0
        return 0.6 + (phaseProgress * 0.4);
      case 'holdIn':
        // Stay at full size
        return 1;
      case 'exhale':
        // Shrink from 1.0 to 0.6
        return 1 - (phaseProgress * 0.4);
      case 'holdOut':
        // Stay at small size
        return 0.6;
      default:
        return 0.8;
    }
  };

  const circleScale = getCircleScale();

  // Calculate total phases and current position for smooth arc animation
  const phases: BreathPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut'];
  const phaseIndex = phases.indexOf(phase);
  
  // Calculate overall progress (0 to 1 across all phases)
  const totalDuration = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;
  const phaseDurations = [pattern.inhale, pattern.holdIn, pattern.exhale, pattern.holdOut];
  
  let progressBefore = 0;
  for (let i = 0; i < phaseIndex; i++) {
    progressBefore += phaseDurations[i] / totalDuration;
  }
  const currentPhaseFraction = phaseDurations[phaseIndex] / totalDuration;
  const overallProgress = progressBefore + (phaseProgress * currentPhaseFraction);

  // Phase colors
  const phaseColors: Record<BreathPhase, string> = {
    inhale: 'text-[hsl(var(--timer-meditation))]',
    holdIn: 'text-info',
    exhale: 'text-primary',
    holdOut: 'text-muted-foreground',
  };

  const isMinimal = variant === 'minimal';
  const circleSize = isMinimal ? 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64' : 'w-64 h-64 sm:w-72 sm:h-72';

  // Arc calculation: stroke goes from start to current progress
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - overallProgress);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Main Circle */}
      <div className={cn('relative', circleSize)}>
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100"
          style={{ 
            transform: `scale(${circleScale})`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/20"
          />
          
          {/* Progress arc - smooth continuous line from start */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(phaseColors[phase])}
            style={{ 
              transform: 'rotate(-90deg)', 
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.1s linear, color 0.3s ease'
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            'font-bold tabular-nums',
            isMinimal ? 'text-5xl sm:text-6xl md:text-7xl' : 'text-6xl sm:text-7xl',
            phaseColors[phase]
          )}>
            {secondsLeft}
          </span>
          <span className={cn(
            'font-medium mt-1',
            isMinimal ? 'text-sm sm:text-base' : 'text-base sm:text-lg',
            'text-white/80'
          )}>
            {phaseLabels[phase]}
          </span>
        </div>
      </div>

      {/* Cycle counter */}
      {!isMinimal && (
        <div className="text-sm text-white/60">
          {t('breathBox.cycle')}: {targetCycles > 0 ? `${cycleCount} / ${targetCycles}` : cycleCount}
        </div>
      )}
    </div>
  );
}
