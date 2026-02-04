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

export const BREATH_PATTERNS: BreathPattern[] = [
  { id: 'box-4', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: 'relaxing', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { id: 'box-5', inhale: 5, holdIn: 5, exhale: 5, holdOut: 5 },
];

interface BreathBoxState {
  enabled: boolean;
  patternId: string;
}

const DEFAULT_STATE: BreathBoxState = {
  enabled: false,
  patternId: 'box-4',
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
  
  const intervalRef = useRef<number | null>(null);
  const phaseStartRef = useRef<number>(0);
  const initialSecondsRef = useRef<number>(0);

  const currentPattern = BREATH_PATTERNS.find(p => p.id === state.patternId) || BREATH_PATTERNS[0];

  // Get duration for a phase
  const getPhaseDuration = useCallback((p: BreathPhase): number => {
    switch (p) {
      case 'inhale': return currentPattern.inhale;
      case 'holdIn': return currentPattern.holdIn;
      case 'exhale': return currentPattern.exhale;
      case 'holdOut': return currentPattern.holdOut;
    }
  }, [currentPattern]);

  // Get next phase
  const getNextPhase = useCallback((p: BreathPhase): BreathPhase => {
    switch (p) {
      case 'inhale': return 'holdIn';
      case 'holdIn': return 'exhale';
      case 'exhale': return 'holdOut';
      case 'holdOut': return 'inhale';
    }
  }, []);

  // Play tick sound when phase changes
  const playPhaseTickSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Softer, lower frequency for breathing (600Hz instead of 800Hz)
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

  // Move to next phase
  const advancePhase = useCallback(() => {
    const nextPhase = getNextPhase(phase);
    const nextDuration = getPhaseDuration(nextPhase);
    
    // Skip phases with 0 duration (e.g., holdOut in 4-7-8 pattern)
    if (nextDuration === 0) {
      // If next phase has 0 duration, skip to the one after
      const skipToPhase = getNextPhase(nextPhase);
      const skipToDuration = getPhaseDuration(skipToPhase);
      
      if (nextPhase === 'holdOut') {
        // Completed a cycle when skipping holdOut
        setCycleCount(c => c + 1);
      }
      
      setPhase(skipToPhase);
      setSecondsLeft(skipToDuration);
      initialSecondsRef.current = skipToDuration;
      phaseStartRef.current = Date.now();
    } else {
      // Increment cycle when completing holdOut (or exhale if holdOut is 0)
      if (phase === 'holdOut') {
        setCycleCount(c => c + 1);
      }
      
      setPhase(nextPhase);
      setSecondsLeft(nextDuration);
      initialSecondsRef.current = nextDuration;
      phaseStartRef.current = Date.now();
    }
    
    playPhaseTickSound();
  }, [phase, getNextPhase, getPhaseDuration, playPhaseTickSound]);

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
  }, [currentPattern.inhale]);

  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, enabled }));
    if (!enabled) {
      setIsRunning(false);
      setPhase('inhale');
      setSecondsLeft(0);
      setCycleCount(0);
    }
  }, [setState]);

  const setPatternId = useCallback((patternId: string) => {
    setState(prev => ({ ...prev, patternId }));
    // Reset when pattern changes
    setIsRunning(false);
    setPhase('inhale');
    const newPattern = BREATH_PATTERNS.find(p => p.id === patternId) || BREATH_PATTERNS[0];
    setSecondsLeft(newPattern.inhale);
    setCycleCount(0);
  }, [setState]);

  // Calculate total cycle duration
  const totalCycleDuration = currentPattern.inhale + currentPattern.holdIn + currentPattern.exhale + currentPattern.holdOut;

  // Calculate progress within current phase (0-1)
  const phaseProgress = getPhaseDuration(phase) > 0 
    ? 1 - (secondsLeft / getPhaseDuration(phase))
    : 0;

  return {
    // State
    enabled: state.enabled,
    patternId: state.patternId,
    pattern: currentPattern,
    phase,
    secondsLeft,
    cycleCount,
    isRunning,
    totalCycleDuration,
    phaseProgress,
    
    // Actions
    start,
    pause,
    reset,
    setEnabled,
    setPatternId,
  };
}
