import { useCallback, useEffect, useRef } from 'react';
import { usePictureInPicture } from './usePictureInPicture';

export type NotificationType = 'pomodoro-complete' | 'break-complete' | 'health-reminder';

interface NotificationOptions {
  type: NotificationType;
  title: string;
  message?: string;
  icon?: string;
  reminderId?: string;
  onDismiss?: () => void;
  onSnooze?: (minutes: number) => void;
}

export function useNotificationPopup() {
  const pip = usePictureInPicture();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const callbacksRef = useRef<{
    onDismiss?: () => void;
    onSnooze?: (minutes: number) => void;
  }>({});

  // Setup BroadcastChannel for popup window communication
  useEffect(() => {
    channelRef.current = new BroadcastChannel('focusflow-notifications');

    channelRef.current.onmessage = (event) => {
      const { action, minutes } = event.data;
      
      if (action === 'dismiss') {
        callbacksRef.current.onDismiss?.();
      } else if (action === 'snooze' && minutes) {
        callbacksRef.current.onSnooze?.(minutes);
      }
    };

    return () => channelRef.current?.close();
  }, []);

  // Map notification type to PiP type
  const mapType = (type: NotificationType): 'pomodoro' | 'break' | 'health' => {
    switch (type) {
      case 'pomodoro-complete': return 'pomodoro';
      case 'break-complete': return 'break';
      case 'health-reminder': return 'health';
    }
  };

  // Show notification using PiP or fallback popup
  const showNotification = useCallback(async (options: NotificationOptions) => {
    const { type, title, message, icon, reminderId, onDismiss, onSnooze } = options;

    // Store callbacks for popup communication
    callbacksRef.current = { onDismiss, onSnooze };

    // Create dismiss handler that also closes PiP
    const handleDismiss = () => {
      pip.closePiP();
      onDismiss?.();
    };

    // Create snooze handler
    const handleSnooze = (minutes: number) => {
      pip.closePiP();
      onSnooze?.(minutes);
    };

    // Try PiP first
    if (pip.isSupported) {
      const pipWindow = await pip.openPiP({
        type: mapType(type),
        title,
        message,
        icon,
        onDismiss: handleDismiss,
        onSnooze: type === 'health-reminder' ? handleSnooze : undefined,
      }, {
        width: 360,
        height: 280,
      });

      if (pipWindow) {
        return; // PiP opened successfully
      }
    }

    // Fallback: Open popup window
    const params = new URLSearchParams({
      type: type === 'pomodoro-complete' ? 'pomodoro' : type === 'break-complete' ? 'break' : 'health',
      title: encodeURIComponent(title),
      message: encodeURIComponent(message || ''),
      icon: icon || '',
      id: reminderId || '',
    });

    const popupWidth = 400;
    const popupHeight = 350;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    window.open(
      `/notification?${params.toString()}`,
      'FocusFlowNotification',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},popup=true,resizable=no`
    );
  }, [pip]);

  // Close any open notification
  const closeNotification = useCallback(() => {
    pip.closePiP();
  }, [pip]);

  return {
    showNotification,
    closeNotification,
    isPiPSupported: pip.isSupported,
  };
}
