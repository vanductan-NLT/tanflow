import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // number of pomodoros before long break
}

export interface PomodoroState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  lastUpdated: number; // timestamp to calculate elapsed time
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

const DEFAULT_STATE: PomodoroState = {
  mode: 'pomodoro',
  timeLeft: 25 * 60,
  isRunning: false,
  completedPomodoros: 0,
  lastUpdated: Date.now(),
};

export function usePomodoro() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    'focusflow-pomodoro-settings',
    DEFAULT_SETTINGS
  );

  const [savedState, setSavedState] = useLocalStorage<PomodoroState>(
    'focusflow-pomodoro-state',
    { ...DEFAULT_STATE, timeLeft: DEFAULT_SETTINGS.pomodoroDuration * 60 }
  );

  // Use refs to track if this is first mount
  const isFirstMount = useRef(true);

  // Calculate initial values once
  const initialValues = useRef(() => {
    const state = savedState;
    let initialTimeLeft = state.timeLeft;
    let initialIsRunning = state.isRunning;
    
    // If timer was running, calculate elapsed time
    if (state.isRunning && state.lastUpdated) {
      const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
      initialTimeLeft = Math.max(0, state.timeLeft - elapsed);
      // Stop if time ran out
      if (initialTimeLeft <= 0) {
        initialIsRunning = false;
        initialTimeLeft = 0;
      }
    }
    
    return {
      mode: state.mode,
      timeLeft: initialTimeLeft,
      isRunning: initialIsRunning,
      completedPomodoros: state.completedPomodoros,
    };
  });

  // Get initial values only once
  const initVals = isFirstMount.current ? initialValues.current() : null;
  
  const [mode, setMode] = useState<TimerMode>(initVals?.mode ?? savedState.mode);
  const [timeLeft, setTimeLeft] = useState(initVals?.timeLeft ?? savedState.timeLeft);
  const [isRunning, setIsRunning] = useState(initVals?.isRunning ?? false);
  const [completedPomodoros, setCompletedPomodoros] = useState(initVals?.completedPomodoros ?? 0);
  
  // Mark first mount as complete
  useEffect(() => {
    isFirstMount.current = false;
  }, []);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Get duration based on current mode
  const getDuration = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case 'pomodoro':
        return settings.pomodoroDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  }, [settings]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Using a simple beep sound encoded as base64
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoAMprcmqiFJQBBr+GZdC0AWrDieVUhR7vh9qdaC0q04NmrfxQFbMP52ZJQABCmz+O3k1wCOK3l9rJ0EgFLtuD3r4ENAFq04/q1ixMBWrri+rJ/CgFfvOj8tnwKAV294fqzfQsCV73f+bF7CgJbvN/5sHkJAl6+4fqxdwgCX7/i+7B1BwJgwOP7r3MFAmHA4/ytcQQCYcDj/K1vAgJhwOP8rG0BAmHA4/ysawECYcDj/KtpAQJhwOP8q2cAAmHA4/yqZQACYcDj/KpjAAJhwOP8qWEAAmHA4/ypXwACYcHk/KldAAJhweT8qFsAAmHB5PynWQACYcHk/KdXAAJhweT8plQAAmHB5PylUgACYcHk/KVQAAJhweX8pE4AAmHB5fykTAACYcHl/KNKAAJhweX8o0gAAmHB5fyjRgACYcHl/KJEAAJhweX8okIAAmHC5vyiQAACYcLm/KE+AAJhwub8oTwAAmHC5vygOgACYcLm/KA4AAJhwub8oDYAAmHC5/yfNAACYcLn/J8yAAJhwuf8ny8AAmHC5/yeL gACYcLn/J4sAAJhwuf8nioAAmHC5/ydKAACYcPo/J0mAAJhw+j8nSQAAmHD6PycIgACYcPo/JwgAAJhw+j8nB4AAmHD6PybHAACYcPo/JsaAAJhw+n8mxgAAmHD6fybFgACYcPp/JoUAAJhw+n8mhIAAmHD6fyaEAACYcTq/JkOAAJhxOr8mQwAAmHE6vyZCgACYcTq/JkIAAJhxOr8mAYAAmHE6vyYBAACYcTq/JgDAAJhxOr8l/8AAmHE6/yX/AACYcTr/Jf6AAJhxOv8l/gAAmHE6/yW9gACYcTr/Jb0AAJhxOv8lvIAAmHF7PyW8AACYcXs/JbuAAJhxez8lu0AAmHF7PyW6wACYcXs/JbpAAJhxez8lugAAmHF7PyV5gACYcXs/JXkAAJhxe38leIAAmHF7fyV4AACYcXt/JXeAAJhxe38ld0AAmHG7vyU2wACYcbu/JTZAAJhxu78lNcAAmHG7vyU1QACYcbu/JTUAAFKPF5ob29zZg==';
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(console.error);
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    setIsRunning(false);

    if (mode === 'pomodoro') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Check if it's time for long break
      if (newCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      // Break is over, back to pomodoro
      setMode('pomodoro');
      setTimeLeft(settings.pomodoroDuration * 60);
    }
  }, [mode, completedPomodoros, settings, playNotificationSound]);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Check for completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning, handleTimerComplete]);

  // Update document title with remaining time
  useEffect(() => {
    const modeLabels: Record<TimerMode, string> = {
      pomodoro: '🍅 Tập trung',
      shortBreak: '☕ Nghỉ ngắn',
      longBreak: '🌴 Nghỉ dài',
    };
    
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (isRunning) {
      document.title = `${timeStr} - ${modeLabels[mode]} | FocusFlow`;
    } else {
      document.title = 'FocusFlow - Tập trung & Năng suất';
    }

    return () => {
      document.title = 'FocusFlow - Tập trung & Năng suất';
    };
  }, [timeLeft, mode, isRunning]);

  // Persist state to localStorage
  useEffect(() => {
    setSavedState({
      mode,
      timeLeft,
      isRunning,
      completedPomodoros,
      lastUpdated: Date.now(),
    });
  }, [mode, timeLeft, isRunning, completedPomodoros, setSavedState]);

  // Controls
  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const skip = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      if (newCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setMode('pomodoro');
      setTimeLeft(settings.pomodoroDuration * 60);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    // Reset timer with new duration if not running
    if (!isRunning) {
      setTimeLeft(
        newSettings.pomodoroDuration !== undefined && mode === 'pomodoro'
          ? newSettings.pomodoroDuration * 60
          : newSettings.shortBreakDuration !== undefined && mode === 'shortBreak'
          ? newSettings.shortBreakDuration * 60
          : newSettings.longBreakDuration !== undefined && mode === 'longBreak'
          ? newSettings.longBreakDuration * 60
          : timeLeft
      );
    }
  };

  const resetSession = () => {
    setIsRunning(false);
    setMode('pomodoro');
    setTimeLeft(settings.pomodoroDuration * 60);
    setCompletedPomodoros(0);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  return {
    mode,
    timeLeft,
    formattedTime: formatTime(timeLeft),
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
    resetSession,
  };
}
