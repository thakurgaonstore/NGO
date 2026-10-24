import { useEffect, useRef, useCallback } from 'react';

interface InactivityTimerOptions {
  timeoutMinutes?: number;
  onTimeout: () => void;
  enabled?: boolean;
  isBangla?: boolean;
}

const STORAGE_KEY = 'ngo_last_activity_time';

export function useInactivityTimer({
  timeoutMinutes = 60,
  onTimeout,
  enabled = true,
  isBangla = true
}: InactivityTimerOptions) {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const lastThrottleRef = useRef<number>(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const triggerLogout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    
    // Alert the user that session expired due to 60 mins of inactivity
    const message = isBangla
      ? 'নিরাপত্তার স্বার্থে ৬০ মিনিট কোনো কার্যক্রম না থাকায় আপনার সেশনটি স্বয়ংক্রিয়ভাবে বন্ধ করা হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।'
      : 'Your session has been automatically logged out due to 60 minutes of inactivity for security. Please sign in again.';
    
    alert(message);
    onTimeoutRef.current();
  }, [isBangla]);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    // Throttle localStorage writes to once every 5 seconds
    if (now - lastThrottleRef.current > 5000) {
      lastThrottleRef.current = now;
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initialize timestamp on mount
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (!existing) {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } else {
        const lastActive = parseInt(existing, 10);
        if (now - lastActive >= timeoutMs) {
          triggerLogout();
          return;
        }
      }
    } catch {}

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click'
    ];

    const handleUserActivity = () => {
      updateActivity();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check every 20 seconds if inactivity threshold exceeded
    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();
        const lastActive = raw ? parseInt(raw, 10) : now;
        if (now - lastActive >= timeoutMs) {
          clearInterval(interval);
          triggerLogout();
        }
      } catch {}
    }, 20000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(interval);
    };
  }, [enabled, timeoutMs, triggerLogout, updateActivity]);
}
