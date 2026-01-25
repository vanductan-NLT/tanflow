import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useNotificationPopup } from './useNotificationPopup';

export interface HealthReminder {
  id: string;
  name: string;
  icon: string;
  intervalMinutes: number;
  enabled: boolean;
  lastReminded?: number;
}

// Map icon name to emoji for PiP
const iconToEmoji: Record<string, string> = {
  'droplets': '💧',
  'footprints': '🚶',
  'eye': '👁️',
  'stretch': '🧘',
};

const DEFAULT_REMINDERS: HealthReminder[] = [
  { id: 'water', name: 'Uống nước', icon: 'droplets', intervalMinutes: 30, enabled: true },
  { id: 'walk', name: 'Đi lại', icon: 'footprints', intervalMinutes: 60, enabled: true },
  { id: 'eyes', name: 'Nghỉ mắt', icon: 'eye', intervalMinutes: 20, enabled: true },
  { id: 'stretch', name: 'Vươn vai', icon: 'stretch', intervalMinutes: 45, enabled: false },
];

interface UseHealthRemindersOptions {
  pauseReminders?: boolean;
}

export function useHealthReminders(options: UseHealthRemindersOptions = {}) {
  const { pauseReminders = false } = options;
  
  const [reminders, setReminders] = useLocalStorage<HealthReminder[]>(
    'focusflow-health-reminders',
    DEFAULT_REMINDERS
  );
  
  const [timeUntilNext, setTimeUntilNext] = useState<Record<string, number>>({});
  const [isActive, setIsActive] = useState(true);
  const [activeReminder, setActiveReminder] = useState<HealthReminder | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<Record<string, number>>({});
  const { showNotification: showPiPNotification } = useNotificationPopup();

  // Play a gentle notification sound
  const playSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Gentle bell sound
      audioRef.current.src = 'data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTtvAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fX19fX19fXx8fHx8fHt7e3t7e3p6enp6eXl5eXl5eHh4eHh3d3d3d3Z2dnZ2dXV1dXV0dHR0dHNzc3NzcnJycnJxcXFxcXBwcHBwb29vb29ubm5ubm1tbW1tbGxsbGxra2tra2pqampqaWlpaWloaGhoaGdnZ2dnZmZmZmZlZWVlZWRkZGRkY2NjY2NiYmJiYmFhYWFhYGBgYGBfX19fX15eXl5eXV1dXV1cXFxcXFtbW1tbWlpaWlpZWVlZWVhYWFhYV1dXV1dWVlZWVlVVVVVVVFRUVFRTU1NTU1JSUlJSUVFRUVFQUFBQUE9PT09PTk5OTk5NTU1NTUxMTExMS0tLS0tKSkpKSklJSUlJSEhISEhHR0dHR0ZGRkZGRUVFRUVEREREREREREREREREREREREREREREREREREREREREREREQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0RERERERERERERERERFRUVFRUVFRUVFRUZFQ0NDQ0JCQkJCQUFBQUFAQEBAQD8/Pz8/Pj4+Pj49PT09PTw8PDw8Ozs7Ozs6Ojo6OTk5OTk4ODg4ODc3Nzc3NjY2NjY1NTU1NTQ0NDQ0MzMzMzMyMjIyMjExMTExMDAwMDAvLy8vLy4uLi4uLS0tLS0sLCwsLCsrKysrKioqKioqKioqKioqKioqKioqKioqKioqKioqKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKysrKysrKywsLCwsLS0tLS0tLS4uLi4uLy8vLy8wMDAwMDExMTExMjIyMjIzMzMzMzQ0NDQ0NTU1NTU2NjY2Njc3Nzc3ODg4ODg5OTk5OTo6Ojo6Ozs7Ozs8PDw8PD09PT09Pj4+Pj4/Pz8/P0BAQEBAQUFBQUFCQkJCQkNDQ0NDQ0RDQ0NERERERERFRUVFRUZGRkZGR0dHR0dHSEhISEhJSUlJSUpKSkpKS0tLS0tMTExMTExNTU1NTU5OTk5OT09PT09QUFBQUFFBUVFRUVJSU1JTU1NUVFRUVFVVVVVWV1ZWV1dXV1hYWFhYWVlZWVlaWlpaWltbW1tbXFxcXFxdXV1dXV5eXl5eX19fX19gYGBgYGFhYWFhYmJiYmJjY2NjY2RkZGRkZWVlZWVmZmZmZmdnZ2dnaGhoaGhpaWlpaWpqampqa2tra2tsbGxsbG1tbW1tbm5ubm5vb29vb3BwcHBwcXFxcXFycnJycnNzc3NzdHR0dHR1dXV1dXZ2dnZ2d3d3d3d4eHh4eHl5eXl5enp6enp7e3t7e3x8fHx8fX19fX19fn5+fn5+fn5/f39/f39/f39/f39/';
    }
    audioRef.current.volume = 0.5;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(console.error);
  }, []);

  // Initialize start times
  useEffect(() => {
    const now = Date.now();
    const newStartTimes: Record<string, number> = {};
    reminders.forEach((reminder) => {
      if (reminder.enabled && !startTimeRef.current[reminder.id]) {
        newStartTimes[reminder.id] = now;
      }
    });
    startTimeRef.current = { ...startTimeRef.current, ...newStartTimes };
  }, [reminders]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notification (fallback)
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.png',
        tag: 'health-reminder',
      });
    }
  }, []);

  // Track last triggered time to prevent double triggers
  const lastTriggeredRef = useRef<Record<string, number>>({});

  // Trigger notification for a reminder
  const triggerReminderNotification = useCallback((reminder: HealthReminder) => {
    playSound();
    setActiveReminder(reminder);
    
    // Show PiP/Popup notification
    showPiPNotification({
      type: 'health-reminder',
      title: reminder.name,
      message: 'Đã đến lúc chăm sóc sức khỏe!',
      icon: iconToEmoji[reminder.icon] || '💧',
      reminderId: reminder.id,
      onDismiss: () => setActiveReminder(null),
      onSnooze: (minutes) => {
        startTimeRef.current[reminder.id] = Date.now() - (reminder.intervalMinutes - minutes) * 60 * 1000;
        setActiveReminder(null);
      },
    });
    
    // Browser notification as fallback
    showBrowserNotification('FocusFlow - Nhắc nhở sức khỏe', `Đã đến lúc: ${reminder.name}`);
  }, [playSound, showPiPNotification, showBrowserNotification]);

  // Store trigger function in ref to avoid re-creating interval
  const triggerNotificationRef = useRef(triggerReminderNotification);
  triggerNotificationRef.current = triggerReminderNotification;

  // Update countdown timers
  useEffect(() => {
    // Skip if reminders are paused (e.g., during meditation)
    if (!isActive || pauseReminders) return;

    // Run immediately on mount
    const updateTimers = () => {
      const now = Date.now();
      const newTimeUntil: Record<string, number> = {};

      reminders.forEach((reminder) => {
        if (!reminder.enabled) return;

        const startTime = startTimeRef.current[reminder.id] || now;
        const elapsed = Math.floor((now - startTime) / 1000);
        const intervalSeconds = reminder.intervalMinutes * 60;
        const remaining = intervalSeconds - (elapsed % intervalSeconds);

        newTimeUntil[reminder.id] = remaining;

        // Check if reminder should trigger (when it cycles back to full interval)
        // Use a small window to catch the trigger
        if (elapsed > 0 && elapsed % intervalSeconds < 2) {
          const lastTriggered = lastTriggeredRef.current[reminder.id] || 0;
          // Prevent triggering more than once per cycle
          if (now - lastTriggered > intervalSeconds * 1000 - 5000) {
            triggerNotificationRef.current(reminder);
            lastTriggeredRef.current[reminder.id] = now;
          }
        }
      });

      setTimeUntilNext(newTimeUntil);
    };

    // Run immediately
    updateTimers();

    // Then run every second
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [reminders, isActive, pauseReminders]);

  // Format time as MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get next upcoming reminder
  const getNextReminder = (): { reminder: HealthReminder; timeLeft: number } | null => {
    let next: { reminder: HealthReminder; timeLeft: number } | null = null;
    
    reminders.forEach((reminder) => {
      if (!reminder.enabled) return;
      const timeLeft = timeUntilNext[reminder.id] || reminder.intervalMinutes * 60;
      
      if (!next || timeLeft < next.timeLeft) {
        next = { reminder, timeLeft };
      }
    });

    return next;
  };

  // Add a new reminder
  const addReminder = (name: string, icon: string, intervalMinutes: number) => {
    const newReminder: HealthReminder = {
      id: `custom-${Date.now()}`,
      name,
      icon,
      intervalMinutes,
      enabled: true,
    };
    setReminders([...reminders, newReminder]);
    startTimeRef.current[newReminder.id] = Date.now();
  };

  // Update a reminder
  const updateReminder = (id: string, updates: Partial<HealthReminder>) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    // Reset timer if interval changed
    if (updates.intervalMinutes !== undefined) {
      startTimeRef.current[id] = Date.now();
    }
  };

  // Remove a reminder
  const removeReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
    delete startTimeRef.current[id];
  };

  // Toggle reminder on/off
  const toggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) => {
        if (r.id === id) {
          if (!r.enabled) {
            startTimeRef.current[id] = Date.now();
          }
          return { ...r, enabled: !r.enabled };
        }
        return r;
      })
    );
  };

  // Dismiss active reminder
  const dismissReminder = () => {
    setActiveReminder(null);
  };

  // Snooze reminder for 5 minutes
  const snoozeReminder = (id: string, minutes: number = 5) => {
    startTimeRef.current[id] = Date.now() - ((reminders.find(r => r.id === id)?.intervalMinutes || 30) - minutes) * 60 * 1000;
    setActiveReminder(null);
  };

  // Pause/resume all reminders
  const toggleActive = () => setIsActive(!isActive);

  // Reset all reminder timers
  const resetAllTimers = () => {
    const now = Date.now();
    reminders.forEach((reminder) => {
      if (reminder.enabled) {
        startTimeRef.current[reminder.id] = now;
      }
    });
  };

  return {
    reminders,
    timeUntilNext,
    isActive,
    activeReminder,
    formatTimeRemaining,
    getNextReminder,
    addReminder,
    updateReminder,
    removeReminder,
    toggleReminder,
    dismissReminder,
    snoozeReminder,
    toggleActive,
    resetAllTimers,
  };
}
