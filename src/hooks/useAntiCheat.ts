import { useEffect, useRef, useState } from 'react';

interface UseAntiCheatOptions {
  isEnabled: boolean;
  maxViolations?: number;
  maxAwayTimeMs?: number;
  onViolation: (violationCount: number, maxViolations: number) => void;
  onForceSubmit: (reason: string) => void;
}

export const useAntiCheat = ({
  isEnabled,
  maxViolations = 3,
  maxAwayTimeMs = 5000,
  onViolation,
  onForceSubmit
}: UseAntiCheatOptions) => {
  const [violationCount, setViolationCount] = useState(0);
  const [isAway, setIsAway] = useState(false);
  const [awayTimeLeft, setAwayTimeLeft] = useState(maxAwayTimeMs);
  
  const isAwayRef = useRef(false);
  const totalAwayTimeRef = useRef(0);
  const awayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAwayTimestampRef = useRef<number | null>(null);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const onForceSubmitRef = useRef(onForceSubmit);
  const onViolationRef = useRef(onViolation);
  
  useEffect(() => {
    onForceSubmitRef.current = onForceSubmit;
    onViolationRef.current = onViolation;
  }, [onForceSubmit, onViolation]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleViolation = () => {
      setViolationCount(prev => {
        const newCount = prev + 1;
        if (newCount > maxViolations) {
          onForceSubmitRef.current('Bạn đã vi phạm quá số lần cho phép.');
        } else {
          onViolationRef.current(newCount, maxViolations);
        }
        return newCount;
      });
    };

    const handleFullscreenChange = () => {
      if (isIOS) return; // Skip full-screen check on iOS
      const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement;
      if (!isFullscreen) {
        handleViolation();
      }
    };

    const handleAway = () => {
      if (!isAwayRef.current) {
        isAwayRef.current = true;
        setIsAway(true);
        handleViolation();
        
        lastAwayTimestampRef.current = Date.now();
        awayIntervalRef.current = setInterval(() => {
          if (lastAwayTimestampRef.current) {
            const now = Date.now();
            const delta = now - lastAwayTimestampRef.current;
            lastAwayTimestampRef.current = now;
            
            totalAwayTimeRef.current += delta;
            const remaining = Math.max(0, maxAwayTimeMs - totalAwayTimeRef.current);
            setAwayTimeLeft(remaining);
            
            if (totalAwayTimeRef.current >= maxAwayTimeMs) {
              if (awayIntervalRef.current) clearInterval(awayIntervalRef.current);
              onForceSubmitRef.current('Bạn đã rời khỏi màn hình thi quá tổng thời gian cho phép.');
            }
          }
        }, 100);
      }
    };

    const handleReturn = () => {
      if (isAwayRef.current) {
        isAwayRef.current = false;
        setIsAway(false);
        if (awayIntervalRef.current) {
          clearInterval(awayIntervalRef.current);
          awayIntervalRef.current = null;
        }
        if (lastAwayTimestampRef.current) {
          const now = Date.now();
          const delta = now - lastAwayTimestampRef.current;
          totalAwayTimeRef.current += delta;
          const remaining = Math.max(0, maxAwayTimeMs - totalAwayTimeRef.current);
          setAwayTimeLeft(remaining);
        }
        lastAwayTimestampRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleAway();
      } else {
        handleReturn();
      }
    };

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const forbiddenKeys = ['F12'];
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (
        forbiddenKeys.includes(e.key) ||
        (isCtrlOrCmd && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(e.key.toLowerCase())) ||
        (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Block right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block copy/paste/cut events
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Block drag and drop
    const handleDragDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    window.addEventListener('blur', handleAway);
    window.addEventListener('focus', handleReturn);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopyPaste);
    window.addEventListener('paste', handleCopyPaste);
    window.addEventListener('cut', handleCopyPaste);
    window.addEventListener('dragstart', handleDragDrop);
    window.addEventListener('drop', handleDragDrop);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      
      window.removeEventListener('blur', handleAway);
      window.removeEventListener('focus', handleReturn);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('cut', handleCopyPaste);
      window.removeEventListener('dragstart', handleDragDrop);
      window.removeEventListener('drop', handleDragDrop);
      
      if (awayIntervalRef.current) {
        clearInterval(awayIntervalRef.current);
        awayIntervalRef.current = null;
      }
    };
  }, [isEnabled, maxViolations, maxAwayTimeMs]);

  const requestFullscreen = async () => {
    if (!isEnabled || isIOS) return;
    const docEl = document.documentElement as any;
    const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
    
    if (requestFS) {
      try {
        await requestFS.call(docEl);
      } catch (err) {
        console.warn("Lỗi toàn màn hình:", err);
      }
    }
  };

  return { violationCount, requestFullscreen, isAway, awayTimeLeft };
};
