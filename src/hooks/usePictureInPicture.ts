import { useState, useEffect, useCallback, useRef } from 'react';

interface PiPOptions {
  width?: number;
  height?: number;
}

interface PiPContentOptions {
  title: string;
  message?: string;
  icon?: string;
  type: 'pomodoro' | 'break' | 'health';
  onDismiss?: () => void;
  onSnooze?: (minutes: number) => void;
}

export function usePictureInPicture() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const dismissCallbackRef = useRef<(() => void) | undefined>();
  const snoozeCallbackRef = useRef<((minutes: number) => void) | undefined>();

  // Check Document PiP API support
  useEffect(() => {
    setIsSupported('documentPictureInPicture' in window);
  }, []);

  // Copy styles from main window to PiP window
  const copyStylesToPiP = useCallback((pip: Window) => {
    // Add base styles
    const baseStyle = pip.document.createElement('style');
    baseStyle.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        color: #ffffff;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      .pip-container {
        text-align: center;
        padding: 24px;
        width: 100%;
      }
      .pip-icon {
        font-size: 48px;
        margin-bottom: 16px;
        animation: pulse 2s infinite;
      }
      .pip-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .pip-message {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 20px;
      }
      .pip-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      .pip-btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, opacity 0.2s;
      }
      .pip-btn:hover {
        transform: scale(1.05);
      }
      .pip-btn:active {
        transform: scale(0.95);
      }
      .pip-btn-primary {
        background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
        color: white;
      }
      .pip-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .pip-countdown {
        margin-top: 16px;
        font-size: 12px;
        opacity: 0.6;
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
    `;
    pip.document.head.appendChild(baseStyle);
  }, []);

  // Create HTML content for PiP
  const createPiPContent = useCallback((options: PiPContentOptions, pip: Window) => {
    const { title, message, icon, type, onDismiss, onSnooze } = options;

    // Store callbacks in refs for access in event handlers
    dismissCallbackRef.current = onDismiss;
    snoozeCallbackRef.current = onSnooze;

    // Get emoji based on type
    const getIcon = () => {
      if (icon) return icon;
      switch (type) {
        case 'pomodoro': return '🍅';
        case 'break': return '⏰';
        case 'health': return '💧';
        default: return '🔔';
      }
    };

    const container = pip.document.createElement('div');
    container.className = 'pip-container';
    container.innerHTML = `
      <div class="pip-icon">${getIcon()}</div>
      <h1 class="pip-title">${title}</h1>
      ${message ? `<p class="pip-message">${message}</p>` : ''}
      <div class="pip-actions">
        ${type === 'health' && onSnooze ? `<button class="pip-btn pip-btn-secondary" id="pip-snooze">Snooze 5 phút</button>` : ''}
        <button class="pip-btn pip-btn-primary" id="pip-dismiss">${type === 'health' ? 'Đã xong!' : 'Tiếp tục'}</button>
      </div>
      <p class="pip-countdown" id="pip-countdown">Tự đóng sau 30s</p>
    `;

    pip.document.body.appendChild(container);

    // Setup event listeners
    const dismissBtn = pip.document.getElementById('pip-dismiss');
    const snoozeBtn = pip.document.getElementById('pip-snooze');
    const countdownEl = pip.document.getElementById('pip-countdown');

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        dismissCallbackRef.current?.();
        pip.close();
      });
    }

    if (snoozeBtn && onSnooze) {
      snoozeBtn.addEventListener('click', () => {
        snoozeCallbackRef.current?.(5);
        pip.close();
      });
    }

    // Auto-close countdown
    let countdown = 30;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdownEl) {
        countdownEl.textContent = `Tự đóng sau ${countdown}s`;
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        dismissCallbackRef.current?.();
        pip.close();
      }
    }, 1000);

    // Play notification sound
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoAMprcmqiFJQBBr+GZdC0AWrDieVUhR7vh9qdaC0q04NmrfxQFbMP52ZJQABCmz+O3k1wCOK3l9rJ0EgFLtuD3r4ENAFq04/q1ixMBWrri+rJ/CgFfvOj8tnwKAV294fqzfQsCV73f+bF7CgJbvN/5sHkJAl6+4fqxdwgCX7/i+7B1BwJgwOP7r3MFAmHA4/ytcQQCYcDj/K1vAgJhwOP8rG0BAmHA4/ysawECYcDj/KtpAQJhwOP8q2cAAmHA4/yqZQACYcDj/KpjAAJhwOP8qWEAAmHA4/ypXwACYcHk/KldAAJhweT8qFsAAmHB5PynWQACYcHk/KdXAAJhweT8plQAAmHB5PylUgACYcHk/KVQAAJhweX8pE4AAmHB5fykTAACYcHl/KNKAAJhweX8o0gAAmHB5fyjRgACYcHl/KJEAAJhweX8okIAAmHC5vyiQAACYcLm/KE+AAJhwub8oTwAAmHC5vygOgACYcLm/KA4AAJhwub8oDYAAmHC5/yfNAACYcLn/J8yAAJhwuf8ny8AAmHC5/yeL gACYcLn/J4sAAJhwuf8nioAAmHC5/ydKAACYcPo/J0mAAJhw+j8nSQAAmHD6PycIgACYcPo/JwgAAJhw+j8nB4AAmHD6PybHAACYcPo/JsaAAJhw+n8mxgAAmHD6fybFgACYcPp/JoUAAJhw+n8mhIAAmHD6fyaEAACYcTq/JkOAAJhxOr8mQwAAmHE6vyZCgACYcTq/JkIAAJhxOr8mAYAAmHE6vyYBAACYcTq/JgDAAJhxOr8l/8AAmHE6/yX/AACYcTr/Jf6AAJhxOv8l/gAAmHE6/yW9gACYcTr/Jb0AAJhxOv8lvIAAmHF7PyW8AACYcXs/JbuAAJhxez8lu0AAmHF7PyW6wACYcXs/JbpAAJhxez8lugAAmHF7PyV5gACYcXs/JXkAAJhxe38leIAAmHF7fyV4AACYcXt/JXeAAJhxe38ld0AAmHG7vyU2wACYcbu/JTZAAJhxu78lNcAAmHG7vyU1QACYcbu/JTUAAFKPF5ob29zZg==';
    audio.play().catch(() => {});

    // Cleanup on close
    pip.addEventListener('pagehide', () => {
      clearInterval(countdownInterval);
    });
  }, []);

  // Open PiP window with content
  const openPiP = useCallback(async (
    options: PiPContentOptions,
    pipOptions?: PiPOptions
  ): Promise<Window | null> => {
    if (!isSupported || !window.documentPictureInPicture) {
      return null;
    }

    try {
      // Close existing PiP window if open
      if (pipWindow) {
        pipWindow.close();
      }

      const pip = await window.documentPictureInPicture.requestWindow({
        width: pipOptions?.width || 360,
        height: pipOptions?.height || 280,
      });

      // Copy styles
      copyStylesToPiP(pip);

      // Create content
      createPiPContent(options, pip);

      setPipWindow(pip);

      // Handle close
      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      return pip;
    } catch (error) {
      console.error('Failed to open PiP window:', error);
      return null;
    }
  }, [isSupported, pipWindow, copyStylesToPiP, createPiPContent]);

  // Close PiP window
  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
    }
    setPipWindow(null);
  }, [pipWindow]);

  return {
    pipWindow,
    isSupported,
    isOpen: pipWindow !== null,
    openPiP,
    closePiP,
  };
}
