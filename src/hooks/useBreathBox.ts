import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export interface BreathPattern {
  id: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

// Mutable patterns - will be customized by user
export const BREATH_PATTERNS: BreathPattern[] = [
  { id: 'box-4', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: 'relaxing', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { id: 'box-5', inhale: 5, holdIn: 5, exhale: 5, holdOut: 5 },
];

interface BreathBoxState {
  enabled: boolean;
  patternId: string;
  targetCycles: number;
  customPatterns: Record<string, { inhale: number; holdIn: number; exhale: number; holdOut: number }>;
}

const DEFAULT_STATE: BreathBoxState = {
  enabled: false,
  patternId: 'box-4',
  targetCycles: 5,
  customPatterns: {},
};

export function useBreathBox() {
  const [state, setState] = useLocalStorage<BreathBoxState>(
    'focusflow-breathbox',
    DEFAULT_STATE
  );

  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const phaseStartRef = useRef<number>(0);
  const initialSecondsRef = useRef<number>(0);

  // Get current pattern with custom overrides
  const getPatternWithCustom = useCallback((): BreathPattern => {
    const basePattern = BREATH_PATTERNS.find(p => p.id === state.patternId) || BREATH_PATTERNS[0];
    const customOverride = state.customPatterns?.[state.patternId];
    if (customOverride) {
      return { ...basePattern, ...customOverride };
    }
    return basePattern;
  }, [state.patternId, state.customPatterns]);

  const currentPattern = getPatternWithCustom();

  const getPhaseDuration = useCallback((p: BreathPhase): number => {
    switch (p) {
      case 'inhale': return currentPattern.inhale;
      case 'holdIn': return currentPattern.holdIn;
      case 'exhale': return currentPattern.exhale;
      case 'holdOut': return currentPattern.holdOut;
    }
  }, [currentPattern]);

  const getNextPhase = useCallback((p: BreathPhase): BreathPhase => {
    switch (p) {
      case 'inhale': return 'holdIn';
      case 'holdIn': return 'exhale';
      case 'exhale': return 'holdOut';
      case 'holdOut': return 'inhale';
    }
  }, []);

  const playPhaseTickSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error('[BreathBox] Tick sound error:', error);
    }
  }, []);

  const playCompletionSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.5);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('[BreathBox] Completion sound error:', error);
    }
  }, []);

  // Move to next phase
  const advancePhase = useCallback(() => {
    const nextPhase = getNextPhase(phase);
    const nextDuration = getPhaseDuration(nextPhase);
    
    // Check if a cycle is completing
    const isCycleCompleting = (nextDuration === 0 && nextPhase === 'holdOut') || phase === 'holdOut';
    
    if (isCycleCompleting) {
      const newCycleCount = cycleCount + 1;
      const targetCycles = state.targetCycles ?? 0;
      
      // Check if target reached
      if (targetCycles > 0 && newCycleCount >= targetCycles) {
        setCycleCount(newCycleCount);
        setIsRunning(false);
        setIsCompleted(true);
        playCompletionSound();
        return;
      }
      
      setCycleCount(newCycleCount);
    }
    
    // Skip phases with 0 duration
    if (nextDuration === 0) {
      const skipToPhase = getNextPhase(nextPhase);
      const skipToDuration = getPhaseDuration(skipToPhase);
      
      setPhase(skipToPhase);
      setSecondsLeft(skipToDuration);
      initialSecondsRef.current = skipToDuration;
      phaseStartRef.current = Date.now();
    } else {
      setPhase(nextPhase);
      setSecondsLeft(nextDuration);
      initialSecondsRef.current = nextDuration;
      phaseStartRef.current = Date.now();
    }
    
    playPhaseTickSound();
  }, [phase, cycleCount, state.targetCycles, getNextPhase, getPhaseDuration, playPhaseTickSound, playCompletionSound]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || !state.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    phaseStartRef.current = Date.now();
    initialSecondsRef.current = secondsLeft > 0 ? secondsLeft : getPhaseDuration(phase);
    if (secondsLeft === 0) {
      setSecondsLeft(initialSecondsRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - phaseStartRef.current) / 1000;
      const remaining = Math.max(0, initialSecondsRef.current - elapsed);
      const remainingCeil = Math.ceil(remaining);
      
      setSecondsLeft(remainingCeil);
      
      if (remainingCeil === 0) {
        advancePhase();
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, state.enabled, phase, advancePhase, getPhaseDuration, secondsLeft]);

  // Controls
  const start = useCallback(() => {
    if (secondsLeft === 0) {
      setSecondsLeft(getPhaseDuration(phase));
    }
    playPhaseTickSound();
    setIsRunning(true);
  }, [secondsLeft, phase, getPhaseDuration, playPhaseTickSound]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('inhale');
    setSecondsLeft(currentPattern.inhale);
    setCycleCount(0);
    setIsCompleted(false);
  }, [currentPattern.inhale]);

  const dismissCompletion = useCallback(() => {
    setIsCompleted(false);
    setIsRunning(false);
    setPhase('inhale');
    setSecondsLeft(0);
    setCycleCount(0);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, enabled }));
    if (!enabled) {
      setIsRunning(false);
      setPhase('inhale');
      setSecondsLeft(0);
      setCycleCount(0);
      setIsCompleted(false);
    }
  }, [setState]);

  const setPatternId = useCallback((patternId: string) => {
    setState(prev => ({ ...prev, patternId }));
    setIsRunning(false);
    setPhase('inhale');
    const newPattern = BREATH_PATTERNS.find(p => p.id === patternId) || BREATH_PATTERNS[0];
    setSecondsLeft(newPattern.inhale);
    setCycleCount(0);
    setIsCompleted(false);
  }, [setState]);

  const setTargetCycles = useCallback((targetCycles: number) => {
    setState(prev => ({ ...prev, targetCycles: Math.max(0, Math.min(30, targetCycles)) }));
  }, [setState]);

  const adjustPhaseDuration = useCallback((phaseKey: 'inhale' | 'holdIn' | 'exhale' | 'holdOut', delta: number) => {
    setState(prev => {
      const currentCustom = prev.customPatterns[prev.patternId] as { inhale?: number; holdIn?: number; exhale?: number; holdOut?: number } | undefined;
      const basePattern = BREATH_PATTERNS.find(p => p.id === prev.patternId) || BREATH_PATTERNS[0];
      const currentValue = (currentCustom?.[phaseKey]) ?? basePattern[phaseKey];
      const newValue = Math.max(0, Math.min(30, currentValue + delta));
      
      return {
        ...prev,
        customPatterns: {
          ...prev.customPatterns,
          [prev.patternId]: {
            inhale: currentCustom?.inhale ?? basePattern.inhale,
            holdIn: currentCustom?.holdIn ?? basePattern.holdIn,
            exhale: currentCustom?.exhale ?? basePattern.exhale,
            holdOut: currentCustom?.holdOut ?? basePattern.holdOut,
            [phaseKey]: newValue,
          },
        },
      };
    });
  }, [setState]);

  const totalCycleDuration = currentPattern.inhale + currentPattern.holdIn + currentPattern.exhale + currentPattern.holdOut;

  const phaseProgress = getPhaseDuration(phase) > 0 
    ? 1 - (secondsLeft / getPhaseDuration(phase))
    : 0;

  return {
    enabled: state.enabled,
    patternId: state.patternId,
    pattern: currentPattern,
    phase,
    secondsLeft,
    cycleCount,
    isRunning,
    isCompleted,
    targetCycles: state.targetCycles ?? 5,
    totalCycleDuration,
    phaseProgress,
    
    start,
    pause,
    reset,
    setEnabled,
    setPatternId,
    setTargetCycles,
    adjustPhaseDuration,
    dismissCompletion,
  };
}
