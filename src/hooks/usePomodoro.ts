import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'meditation';

export interface PomodoroSettings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // number of pomodoros before long break
  meditationDuration: number; // in minutes
  autoStartNextSession: boolean; // auto-transition between modes
}

export interface PomodoroState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  lastUpdated: number; // timestamp to calculate elapsed time
}

export interface NotificationCallbacks {
  showPiPNotification: (opts: {
    type: 'pomodoro-complete' | 'break-complete' | 'health-reminder';
    title: string;
    message: string;
    onDismiss: () => void;
  }) => void;
  showBrowserNotification: (title: string, body: string) => void;
  onPomodoroComplete?: () => void; // Callback when a pomodoro session completes
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  pomodoroDuration: 45, // 45 phút - thời gian tối ưu cho não bộ
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  meditationDuration: 10,
  autoStartNextSession: false,
};

const DEFAULT_STATE: PomodoroState = {
  mode: 'pomodoro',
  timeLeft: 45 * 60, // Đổi thành 45 phút
  isRunning: false,
  completedPomodoros: 0,
  lastUpdated: Date.now(),
};

// Âm thanh riêng cho từng chế độ
// Alarm sound cho Focus (tiếng chuông báo thức)
const ALARM_SOUND_BASE64 = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoAMprcmqiFJQBBr+GZdC0AWrDieVUhR7vh9qdaC0q04NmrfxQFbMP52ZJQABCmz+O3k1wCOK3l9rJ0EgFLtuD3r4ENAFq04/q1ixMBWrri+rJ/CgFfvOj8tnwKAV294fqzfQsCV73f+bF7CgJbvN/5sHkJAl6+4fqxdwgCX7/i+7B1BwJgwOP7r3MFAmHA4/ytcQQCYcDj/K1vAgJhwOP8rG0BAmHA4/ysawECYcDj/KtpAQJhwOP8q2cAAmHA4/yqZQACYcDj/KpjAAJhwOP8qWEAAmHA4/ypXwACYcHk/KldAAJhweT8qFsAAmHB5PynWQACYcHk/KdXAAJhweT8plQAAmHB5PylUgACYcHk/KVQAAJhweX8pE4AAmHB5fykTAACYcHl/KNKAAJhweX8o0gAAmHB5fyjRgACYcHl/KJEAAJhweX8okIAAmHC5vyiQAACYcLm/KE+AAJhwub8oTwAAmHC5vygOgACYcLm/KA4AAJhwub8oDYAAmHC5/yfNAACYcLn/J8yAAJhwuf8ny8AAmHC5/yeL gACYcLn/J4sAAJhwuf8nioAAmHC5/ydKAACYcPo/J0mAAJhw+j8nSQAAmHD6PycIgACYcPo/JwgAAJhw+j8nB4AAmHD6PybHAACYcPo/JsaAAJhw+n8mxgAAmHD6fybFgACYcPp/JoUAAJhw+n8mhIAAmHD6fyaEAACYcTq/JkOAAJhxOr8mQwAAmHE6vyZCgACYcTq/JkIAAJhxOr8mAYAAmHE6vyYBAACYcTq/JgDAAJhxOr8l/8AAmHE6/yX/AACYcTr/Jf6AAJhxOv8l/gAAmHE6/yW9gACYcTr/Jb0AAJhxOv8lvIAAmHF7PyW8AACYcXs/JbuAAJhxez8lu0AAmHF7PyW6wACYcXs/JbpAAJhxez8lugAAmHF7PyV5gACYcXs/JXkAAJhxe38leIAAmHF7fyV4AACYcXt/JXeAAJhxe38ld0AAmHG7vyU2wACYcbu/JTZAAJhxu78lNcAAmHG7vyU1QACYcbu/JTUAAFKPF5ob29zZg==';

// Temple bell sound cho Meditation (tiếng chuông chùa)
const TEMPLE_BELL_BASE64 = 'data:audio/wav;base64,UklGRiQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAFAAB/f39/f39/f4GEiI6UmpqWj4R4aVtPS0lLUFtqfI2dnqCemZGHe25jW1dXXGVvfIqVnZ6blo6DdmlfV1RWW2Rxf4yYn5+blo2CdGdcVVNXXWl4hpKbnpuWjoJ0Z1xVU1dfanmHk52empWMgXNmXFVUV19rf4yYoJ+blIyAcmVbVFRYYG1+jJmgn5qUi4BxZFpUU1hhbn+Nmp+em5OKf3BjWVNTWGJvgI6boJ2alIp+cGJZU1NZY3GCkJ2gnpqTiX5vYVlTU1lkc4SRnqCdmZKIfm9gWFNTWmV0hpOfn52Ykod9bmBYU1NbZnWIlaCfnJeRhn1tX1hTVFxneIqXoJ+clpCEfGxeV1NUXWl6jJmgn5uVj4N7a11XU1VeanuNmp+enJSNgXlqXVZUVl9sfI6bn56blIx/eGldVlRXYW1/kJ2gnpqTi394aV1WVFhjcIKSn5+dm5KJfnZnXFVUWGRyhJSfn52ZkYd9dGVaVFRZZXWGlp+fnJiQhXtzZFpUVFpmd4iYoJ+bmI+DeXJjWVRUW2h5ipmgn5uXjoJ4cGFZVFRcanqLm5+em5aPgXdvYVhUVFxrfIybn56alY1/dW5gV1RVXWx+jp2fnZmUi35zbV5XVFZecH+Qnp+dmZOKfXFsXldVV19xgZGfn52Yk4l8cGtdV1VYYHODk5+fnZiSiHtvallWVVlic4WUnp+dmJGHem5oWVVVWmN1hpafn5yXkIV5bGdYVVVbZXeImZ+fnJaPhHdsZldVVVxneYqan5+clI6CdmplV1VVXWl7jJufnpuUjYB0aGRWVVVeaniNm5+empOLfnJnY1ZVVl9seY6cn56ak4p8cGZiVlVXYW17j52fnpmSiXtwZWFWVVdibn2Qnp+emJGIem9kYFZVV2NwgJKfn56YkId5bmNfVlVXZHGBk5+fn5eQhnhuYl5WVVdldIOU';

export function usePomodoro(notificationCallbacks?: NotificationCallbacks) {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    'focusflow-pomodoro-settings',
    DEFAULT_SETTINGS
  );

  const [savedState, setSavedState] = useLocalStorage<PomodoroState>(
    'focusflow-pomodoro-state',
    { ...DEFAULT_STATE, timeLeft: DEFAULT_SETTINGS.pomodoroDuration * 60 }
  );

  // Calculate initial values using lazy initialization in useState
  const [mode, setMode] = useState<TimerMode>(() => savedState.mode);
  const [timeLeft, setTimeLeft] = useState(() => {
    const state = savedState;
    if (state.isRunning && state.lastUpdated) {
      const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
      const remaining = Math.max(0, state.timeLeft - elapsed);
      return remaining;
    }
    return state.timeLeft;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const state = savedState;
    if (state.isRunning && state.lastUpdated) {
      const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
      const remaining = Math.max(0, state.timeLeft - elapsed);
      // Stop if time ran out
      return remaining > 0;
    }
    return false;
  });
  const [completedPomodoros, setCompletedPomodoros] = useState(() => savedState.completedPomodoros);
  // Used to force-restart the running interval when we start a new session while staying in "running" state
  const [runToken, setRunToken] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Get duration based on current mode
  const getDuration = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case 'pomodoro':
        return settings.pomodoroDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      case 'meditation':
        return settings.meditationDuration * 60;
    }
  }, [settings]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.png',
        tag: 'pomodoro-complete',
      });
    }
  }, []);

  // Play notification sound based on timer mode
  const playNotificationSound = useCallback((timerMode: TimerMode) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Sử dụng âm thanh khác nhau cho từng chế độ
    if (timerMode === 'meditation') {
      audioRef.current.src = TEMPLE_BELL_BASE64;
    } else {
      audioRef.current.src = ALARM_SOUND_BASE64;
    }
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(console.error);
  }, []);

  // Play tick sound for countdown
  const playTickSound = useCallback(() => {
    try {
      // Create audio context for reliable playback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Short, sharp tick sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      console.log('[Timer] Tick sound played');
    } catch (error) {
      console.error('[Timer] Tick sound error:', error);
    }
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    // Stop current interval before switching session to avoid the old interval
    // immediately driving the new session back to 0 and causing loops/flicker.
    setIsRunning(false);
    playNotificationSound(mode);

    const willAutoStart = settings.autoStartNextSession;

    if (mode === 'pomodoro') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Notify task system that a pomodoro completed
      notificationCallbacks?.onPomodoroComplete?.();
      
      // Only show notification if NOT auto-starting (avoid conflict with manual continue button)
      if (!willAutoStart) {
        notificationCallbacks?.showPiPNotification({
          type: 'pomodoro-complete',
          title: 'Hoàn thành Pomodoro! 🍅',
          message: `Tuyệt vời! Bạn đã hoàn thành ${newCount} phiên tập trung. Nghỉ ngơi thôi!`,
          onDismiss: () => {},
        });
        
        notificationCallbacks?.showBrowserNotification(
          'FocusFlow - Hoàn thành Pomodoro! 🍅',
          `Tuyệt vời! Bạn đã hoàn thành ${newCount} phiên tập trung. Nghỉ ngơi thôi!`
        );
      }
      
      // Check if it's time for long break
      if (newCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      
      // Auto-start next session if enabled
      if (willAutoStart) {
        setRunToken((t) => t + 1);
        setIsRunning(true);
      }
    } else if (mode === 'meditation') {
      // Meditation complete - stay in meditation mode, just stop
      notificationCallbacks?.showPiPNotification({
        type: 'break-complete',
        title: 'Hoàn thành thiền! 🧘',
        message: 'Bạn đã hoàn thành phiên thiền. Cảm thấy thư giãn hơn chưa?',
        onDismiss: () => {},
      });
      
      notificationCallbacks?.showBrowserNotification(
        'FocusFlow - Hoàn thành thiền! 🧘',
        'Bạn đã hoàn thành phiên thiền. Cảm thấy thư giãn hơn chưa?'
      );
      // Reset meditation timer but don't switch mode
      setTimeLeft(settings.meditationDuration * 60);
      setIsRunning(false);
    } else {
      // Break is over, back to pomodoro
      // Only show notification if NOT auto-starting
      if (!willAutoStart) {
        notificationCallbacks?.showPiPNotification({
          type: 'break-complete',
          title: 'Hết giờ nghỉ! ⏰',
          message: 'Đã đến lúc quay lại tập trung rồi!',
          onDismiss: () => {},
        });
        
        notificationCallbacks?.showBrowserNotification(
          'FocusFlow - Hết giờ nghỉ! ⏰',
          'Đã đến lúc quay lại tập trung rồi!'
        );
      }
      setMode('pomodoro');
      setTimeLeft(settings.pomodoroDuration * 60);
      
      // Auto-start next pomodoro if enabled
      if (willAutoStart) {
        setRunToken((t) => t + 1);
        setIsRunning(true);
      }
    }
  }, [mode, completedPomodoros, settings, playNotificationSound, notificationCallbacks]);

  // Timer countdown using timestamp-based approach for accuracy
  // Store the target end time instead of counting down
  const startTimeRef = useRef<number>(0);
  const initialTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Calculate when the timer started based on current timeLeft
      startTimeRef.current = Date.now();
      initialTimeRef.current = timeLeft;
      lastTickRef.current = 0;
      
      // Use 100ms interval for smoother UI updates
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - startTimeRef.current) / 1000;
        const remaining = Math.max(0, initialTimeRef.current - elapsedSeconds);
        const remainingCeil = Math.ceil(remaining);
        
        // Play tick sound in last 5 seconds
        if (remainingCeil <= 5 && remainingCeil > 0 && remainingCeil !== lastTickRef.current) {
          lastTickRef.current = remainingCeil;
          playTickSound();
        }
        
        // Use Math.ceil to ensure we show full seconds
        setTimeLeft(remainingCeil);
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, runToken, playTickSound]);

  // Track if we've already handled completion for current cycle
  const hasCompletedRef = useRef(false);
  
  // Reset completion flag when timer restarts with time
  useEffect(() => {
    if (timeLeft > 0) {
      hasCompletedRef.current = false;
    }
  }, [timeLeft]);
  
  // Check for completion - only trigger once per cycle
  useEffect(() => {
    if (timeLeft === 0 && isRunning && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      handleTimerComplete();
    }
  }, [timeLeft, isRunning, handleTimerComplete]);

  // Update document title with remaining time
  useEffect(() => {
    const modeLabels: Record<TimerMode, string> = {
      pomodoro: '🍅 Tập trung',
      shortBreak: '☕ Nghỉ ngắn',
      longBreak: '🌴 Nghỉ dài',
      meditation: '🧘 Thiền',
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
  const start = () => {
    setRunToken((t) => t + 1);
    setIsRunning(true);
  };
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
    } else if (mode === 'meditation') {
      // Skip just resets meditation timer
      setTimeLeft(settings.meditationDuration * 60);
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
          : newSettings.meditationDuration !== undefined && mode === 'meditation'
          ? newSettings.meditationDuration * 60
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
