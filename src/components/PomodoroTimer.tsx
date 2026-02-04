import { Play, Pause, RotateCcw, SkipForward, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePomodoro, TimerMode, PomodoroSettings } from '@/hooks/usePomodoro';
import { useBreathBox, BREATH_PATTERNS } from '@/hooks/useBreathBox';
import { BreathBox } from '@/components/BreathBox';
import { useLanguage } from '@/contexts/LanguageContext';

interface PomodoroTimerProps {
  pomodoro: ReturnType<typeof usePomodoro>;
  breathBox?: ReturnType<typeof useBreathBox>;
}

export function PomodoroTimer({ pomodoro, breathBox }: PomodoroTimerProps) {
  const { t } = useLanguage();
  const {
    mode,
    formattedTime,
    isRunning,
    completedPomodoros,
    settings,
    progress,
    start,
    pause,
    reset,
    skip,
    switchMode,
    updateSettings,
  } = pomodoro;

  // Check if breath box mode is active
  const isBreathBoxActive = mode === 'meditation' && breathBox?.enabled;

  // Get duration key and limits based on mode
  const getDurationConfig = (m: TimerMode): { key: keyof PomodoroSettings; min: number; max: number; step: number } => {
    switch (m) {
      case 'pomodoro':
        return { key: 'pomodoroDuration', min: 5, max: 90, step: 5 };
      case 'shortBreak':
        return { key: 'shortBreakDuration', min: 1, max: 15, step: 1 };
      case 'longBreak':
        return { key: 'longBreakDuration', min: 5, max: 30, step: 5 };
      case 'meditation':
        return { key: 'meditationDuration', min: 5, max: 60, step: 5 };
    }
  };

  const config = getDurationConfig(mode);
  const currentDuration = settings[config.key] as number;

  const handleIncrease = () => {
    if (currentDuration < config.max) {
      updateSettings({ [config.key]: currentDuration + config.step });
    }
  };

  const handleDecrease = () => {
    if (currentDuration > config.min) {
      updateSettings({ [config.key]: currentDuration - config.step });
    }
  };

  const modeLabels: Record<TimerMode, string> = {
    pomodoro: t('timer.pomodoro'),
    shortBreak: t('timer.shortBreak'),
    longBreak: t('timer.longBreak'),
    meditation: t('timer.meditation'),
  };

  const modeColors: Record<TimerMode, string> = {
    pomodoro: 'text-primary',
    shortBreak: 'text-info',
    longBreak: 'text-[hsl(var(--timer-long-break))]',
    meditation: 'text-[hsl(var(--timer-meditation))]',
  };

  const progressColors: Record<TimerMode, string> = {
    pomodoro: 'bg-primary',
    shortBreak: 'bg-info',
    longBreak: 'bg-[hsl(var(--timer-long-break))]',
    meditation: 'bg-[hsl(var(--timer-meditation))]',
  };

  // Long break interval adjustment
  const handleIntervalIncrease = () => {
    if (settings.longBreakInterval < 8) {
      updateSettings({ longBreakInterval: settings.longBreakInterval + 1 });
    }
  };

  const handleIntervalDecrease = () => {
    if (settings.longBreakInterval > 2) {
      updateSettings({ longBreakInterval: settings.longBreakInterval - 1 });
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 rounded-full bg-muted/50 flex-wrap justify-center">
        {(['pomodoro', 'shortBreak', 'longBreak', 'meditation'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              mode === m
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Breath Box Toggle & Settings - only show in meditation mode when paused */}
      {mode === 'meditation' && !isRunning && breathBox && !breathBox.isRunning && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{t('breathBox.enable')}</span>
            <Switch
              checked={breathBox.enabled}
              onCheckedChange={breathBox.setEnabled}
            />
          </div>
          {breathBox.enabled && (
            <>
              <Select value={breathBox.patternId} onValueChange={breathBox.setPatternId}>
                <SelectTrigger className="w-56 bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  {BREATH_PATTERNS.map((pattern) => {
                    const patternKey = `breathBox.pattern.${pattern.id}` as const;
                    return (
                      <SelectItem key={pattern.id} value={pattern.id}>
                        {t(patternKey)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Phase duration adjustments */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(['inhale', 'holdIn', 'exhale', 'holdOut'] as const).map((phaseKey) => (
                  <div key={phaseKey} className="flex items-center gap-1 bg-muted/30 rounded-lg px-2 py-1">
                    <span className="text-muted-foreground text-xs w-12 truncate">
                      {t(`breathBox.${phaseKey}`)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => breathBox.adjustPhaseDuration(phaseKey, -1)}
                      disabled={breathBox.pattern[phaseKey] <= 0}
                      className="h-6 w-6 rounded-full hover:bg-muted/50 disabled:opacity-30"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center font-medium text-foreground">
                      {breathBox.pattern[phaseKey]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => breathBox.adjustPhaseDuration(phaseKey, 1)}
                      disabled={breathBox.pattern[phaseKey] >= 30}
                      className="h-6 w-6 rounded-full hover:bg-muted/50 disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Timer Display - Show BreathBox or regular timer */}
      {isBreathBoxActive ? (
        <BreathBox
          pattern={breathBox.pattern}
          phase={breathBox.phase}
          secondsLeft={breathBox.secondsLeft}
          cycleCount={breathBox.cycleCount}
          isRunning={breathBox.isRunning}
          phaseProgress={breathBox.phaseProgress}
        />
      ) : (
        <div className="relative flex items-center justify-center w-72 h-72">
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={cn('transition-all duration-1000', modeColors[mode])}
            />
          </svg>

          {/* Time Display with +/- controls when paused */}
          <div className="flex flex-col items-center z-10">
            <div className="flex items-center gap-2">
              {/* Decrease button - only show when paused */}
              <div className={cn(
                "transition-all duration-200",
                isRunning ? "opacity-0 pointer-events-none w-0" : "opacity-100 w-12"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDecrease}
                  disabled={currentDuration <= config.min}
                  className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30"
                  aria-label="Giảm thời gian"
                >
                  <Minus className="h-6 w-6" />
                </Button>
              </div>
              
              <span className={cn('text-7xl font-light tracking-tight tabular-nums', modeColors[mode])}>
                {formattedTime}
              </span>
              
              {/* Increase button - only show when paused */}
              <div className={cn(
                "transition-all duration-200",
                isRunning ? "opacity-0 pointer-events-none w-0" : "opacity-100 w-12"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleIncrease}
                  disabled={currentDuration >= config.max}
                  className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30"
                  aria-label="Tăng thời gian"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <span className="text-sm text-muted-foreground mt-2">
              {modeLabels[mode]}
            </span>
          </div>
        </div>
      )}

      {/* Long Break Interval Setting - only show on longBreak mode when paused */}
      {mode === 'longBreak' && !isRunning && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{t('timer.longBreakAfter')}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleIntervalDecrease}
              disabled={settings.longBreakInterval <= 2}
              className="h-7 w-7 rounded-full hover:bg-muted/50 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center font-medium text-foreground">
              {settings.longBreakInterval}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleIntervalIncrease}
              disabled={settings.longBreakInterval >= 8}
              className="h-7 w-7 rounded-full hover:bg-muted/50 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span>🍅</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={isBreathBoxActive ? breathBox.reset : reset}
          className="h-12 w-12 rounded-full"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => {
            if (isBreathBoxActive) {
              breathBox.isRunning ? breathBox.pause() : breathBox.start();
            } else {
              isRunning ? pause() : start();
            }
          }}
          size="lg"
          className={cn(
            'h-16 w-16 rounded-full text-lg font-medium shadow-lg transition-all duration-200',
            (isBreathBoxActive ? breathBox.isRunning : isRunning) && 'bg-muted text-foreground hover:bg-muted/80'
          )}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {(isBreathBoxActive ? breathBox.isRunning : isRunning) ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>

        {!isBreathBoxActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={skip}
            className="h-12 w-12 rounded-full"
            aria-label="Skip to next"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        )}
        
        {/* Placeholder to keep layout balanced when skip is hidden */}
        {isBreathBoxActive && <div className="w-12" />}
      </div>

    </div>
  );
}
