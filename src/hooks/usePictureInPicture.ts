import { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ReactNode } from 'react';

interface PiPOptions {
  width?: number;
  height?: number;
}

export function usePictureInPicture() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const rootRef = useRef<Root | null>(null);

  // Check Document PiP API support
  useEffect(() => {
    setIsSupported('documentPictureInPicture' in window);
  }, []);

  // Copy styles from main window to PiP window
  const copyStylesToPiP = useCallback((pip: Window) => {
    // Copy all stylesheets
    const allStyles = [...document.styleSheets];
    
    allStyles.forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          const newStyleEl = pip.document.createElement('style');
          Array.from(styleSheet.cssRules).forEach((cssRule) => {
            newStyleEl.appendChild(pip.document.createTextNode(cssRule.cssText));
          });
          pip.document.head.appendChild(newStyleEl);
        }
      } catch (e) {
        // Handle cross-origin stylesheets
        if (styleSheet.href) {
          const newLinkEl = pip.document.createElement('link');
          newLinkEl.rel = 'stylesheet';
          newLinkEl.href = styleSheet.href;
          pip.document.head.appendChild(newLinkEl);
        }
      }
    });

    // Copy CSS custom properties from :root
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars: string[] = [];
    
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i];
      if (prop.startsWith('--')) {
        cssVars.push(`${prop}: ${rootStyles.getPropertyValue(prop)};`);
      }
    }
    
    const varsStyle = pip.document.createElement('style');
    varsStyle.textContent = `:root { ${cssVars.join(' ')} }`;
    pip.document.head.appendChild(varsStyle);

    // Add base styles
    const baseStyle = pip.document.createElement('style');
    baseStyle.textContent = `
      body {
        margin: 0;
        padding: 0;
        font-family: system-ui, -apple-system, sans-serif;
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        overflow: hidden;
      }
      * {
        box-sizing: border-box;
      }
    `;
    pip.document.head.appendChild(baseStyle);
  }, []);

  // Open PiP window with React component
  const openPiP = useCallback(async (
    content: ReactNode,
    options?: PiPOptions
  ): Promise<Window | null> => {
    if (!isSupported || !window.documentPictureInPicture) {
      return null;
    }

    try {
      // Close existing PiP window if open
      if (pipWindow) {
        pipWindow.close();
      }
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }

      const pip = await window.documentPictureInPicture.requestWindow({
        width: options?.width || 360,
        height: options?.height || 240,
      });

      // Copy styles
      copyStylesToPiP(pip);

      // Create container and render React content
      const container = pip.document.createElement('div');
      container.id = 'pip-root';
      pip.document.body.appendChild(container);

      rootRef.current = createRoot(container);
      rootRef.current.render(content);

      setPipWindow(pip);

      // Handle close
      pip.addEventListener('pagehide', () => {
        if (rootRef.current) {
          rootRef.current.unmount();
          rootRef.current = null;
        }
        setPipWindow(null);
      });

      return pip;
    } catch (error) {
      console.error('Failed to open PiP window:', error);
      return null;
    }
  }, [isSupported, pipWindow, copyStylesToPiP]);

  // Close PiP window
  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
    }
    if (rootRef.current) {
      rootRef.current.unmount();
      rootRef.current = null;
    }
    setPipWindow(null);
  }, [pipWindow]);

  // Update PiP content
  const updatePiPContent = useCallback((content: ReactNode) => {
    if (rootRef.current) {
      rootRef.current.render(content);
    }
  }, []);

  return {
    pipWindow,
    isSupported,
    isOpen: pipWindow !== null,
    openPiP,
    closePiP,
    updatePiPContent,
  };
}
