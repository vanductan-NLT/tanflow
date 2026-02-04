import { useEffect, useState } from 'react';
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
  className,
  variant = 'normal',
}: BreathBoxProps) {
  const { t } = useLanguage();
  const [circleScale, setCircleScale] = useState(1);

  // Phase labels
  const phaseLabels: Record<BreathPhase, string> = {
    inhale: t('breathBox.inhale'),
    holdIn: t('breathBox.holdIn'),
    exhale: t('breathBox.exhale'),
    holdOut: t('breathBox.holdOut'),
  };

  // Animate circle scale based on phase
  useEffect(() => {
    if (!isRunning) {
      setCircleScale(1);
      return;
    }

    switch (phase) {
      case 'inhale':
        // Grow from 0.6 to 1.0
        setCircleScale(0.6 + (phaseProgress * 0.4));
        break;
      case 'holdIn':
        // Stay at full size
        setCircleScale(1);
        break;
      case 'exhale':
        // Shrink from 1.0 to 0.6
        setCircleScale(1 - (phaseProgress * 0.4));
        break;
      case 'holdOut':
        // Stay at small size
        setCircleScale(0.6);
        break;
    }
  }, [phase, phaseProgress, isRunning]);

  // Calculate dot position on circle (clockwise from top)
  // Top = inhale, Right = holdIn, Bottom = exhale, Left = holdOut
  const getPhaseAngle = (p: BreathPhase): number => {
    switch (p) {
      case 'inhale': return -90; // Top
      case 'holdIn': return 0;   // Right
      case 'exhale': return 90;  // Bottom
      case 'holdOut': return 180; // Left
    }
  };

  const currentAngle = getPhaseAngle(phase);
  const nextAngle = getPhaseAngle(
    phase === 'inhale' ? 'holdIn' : 
    phase === 'holdIn' ? 'exhale' : 
    phase === 'exhale' ? 'holdOut' : 'inhale'
  );
  
  // Interpolate angle based on progress
  let angleDiff = nextAngle - currentAngle;
  if (angleDiff < 0) angleDiff += 360;
  if (angleDiff > 180) angleDiff -= 360;
  const dotAngle = currentAngle + (phaseProgress * angleDiff);
  
  // Convert angle to position on circle (radius = 45 in viewBox 100x100)
  const dotRadius = 45;
  const dotX = 50 + dotRadius * Math.cos((dotAngle * Math.PI) / 180);
  const dotY = 50 + dotRadius * Math.sin((dotAngle * Math.PI) / 180);

  // Phase colors
  const phaseColors: Record<BreathPhase, string> = {
    inhale: 'text-[hsl(var(--timer-meditation))]',
    holdIn: 'text-info',
    exhale: 'text-primary',
    holdOut: 'text-muted-foreground',
  };

  const isMinimal = variant === 'minimal';
  const circleSize = isMinimal ? 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64' : 'w-64 h-64 sm:w-72 sm:h-72';

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Main Circle */}
      <div className={cn('relative', circleSize)}>
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100"
          style={{ transform: `scale(${circleScale})`, transition: 'transform 0.1s ease-out' }}
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
          
          {/* Progress arc - shows current phase position */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - phaseProgress)}`}
            className={cn('transition-colors duration-300', phaseColors[phase])}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
          
          {/* Moving dot */}
          <circle
            cx={dotX}
            cy={dotY}
            r="4"
            fill="currentColor"
            className={cn('transition-colors duration-300', phaseColors[phase])}
          />
          
          {/* 4 corner indicators */}
          {['inhale', 'holdIn', 'exhale', 'holdOut'].map((p) => {
            const angle = getPhaseAngle(p as BreathPhase);
            const x = 50 + 45 * Math.cos((angle * Math.PI) / 180);
            const y = 50 + 45 * Math.sin((angle * Math.PI) / 180);
            const isActive = phase === p;
            
            return (
              <circle
                key={p}
                cx={x}
                cy={y}
                r={isActive ? "3" : "2"}
                fill="currentColor"
                className={cn(
                  'transition-all duration-300',
                  isActive ? phaseColors[p as BreathPhase] : 'text-white/30'
                )}
              />
            );
          })}
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
          {t('breathBox.cycle')}: {cycleCount}
        </div>
      )}

      {/* Phase labels around the circle - only in normal mode */}
      {!isMinimal && (
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-white/60">
          <div className={cn('text-center', phase === 'inhale' && phaseColors.inhale)}>
            ↑ {phaseLabels.inhale} ({pattern.inhale}s)
          </div>
          <div className={cn('text-center', phase === 'holdIn' && phaseColors.holdIn)}>
            → {phaseLabels.holdIn} ({pattern.holdIn}s)
          </div>
          <div className={cn('text-center', phase === 'exhale' && phaseColors.exhale)}>
            ↓ {phaseLabels.exhale} ({pattern.exhale}s)
          </div>
          <div className={cn('text-center', phase === 'holdOut' && phaseColors.holdOut)}>
            ← {phaseLabels.holdOut} ({pattern.holdOut}s)
          </div>
        </div>
      )}
    </div>
  );
}
