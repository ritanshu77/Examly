"use client";

import { useEffect, useRef } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function TimeTracker() {
  const userIdRef = useRef<string | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const lastActiveTimeRef = useRef<number>(Date.now());
  const isPageVisibleRef = useRef<boolean>(true);
  const isInitializedRef = useRef<boolean>(false);

  // Helper to send time to server
  const sendTime = (timeInSeconds: number) => {
    if (!userIdRef.current || !deviceIdRef.current || timeInSeconds <= 0) return;

    // Use keepalive for reliability during unload
    fetch('/api/auth/session-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userIdRef.current,
        deviceId: deviceIdRef.current,
        time: timeInSeconds
      }),
      keepalive: true
    }).catch(err => console.error("TimeTracker sync failed:", err));
  };

  const syncTime = () => {
    if (!isPageVisibleRef.current) return; // Don't count time if already hidden

    const now = Date.now();
    const elapsedMs = now - lastActiveTimeRef.current;
    
    // Only send if significant time passed (e.g. > 1 second)
    if (elapsedMs > 1000) {
      const seconds = Math.round(elapsedMs / 1000);
      sendTime(seconds);
    }
    
    lastActiveTimeRef.current = now;
  };

  useEffect(() => {
    // Initialize User & Device
    const init = async () => {
      // Prevent duplicate init calls
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      // Get Device ID
      let dId = localStorage.getItem('deviceId');
      if (!dId) {
        try {
          const fp = await FingerprintJS.load();
          const { visitorId } = await fp.get();
          dId = visitorId;
          localStorage.setItem('deviceId', visitorId);
        } catch (e) {
          console.error("TimeTracker: FP error", e);
          dId = 'unknown_' + Math.random();
        }
      }
      deviceIdRef.current = dId;

      // Get User ID
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            userIdRef.current = data.user.id || data.user._id || data.user.userId;
          }
        }
      } catch (err) {
        console.error("TimeTracker: Failed to fetch user", err);
      }
    };

    init();

    // Event Listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden: Sync time and pause
        syncTime();
        isPageVisibleRef.current = false;
      } else {
        // Tab became visible: Resume tracking
        isPageVisibleRef.current = true;
        lastActiveTimeRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      syncTime();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Periodic backup sync (every 5 minutes) to prevent huge data loss on crash
    // User requested not to hit every second, so 5 mins is safe
    const intervalId = setInterval(() => {
        syncTime();
    }, 5 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(intervalId);
      syncTime(); // Final sync on component unmount
    };
  }, []);

  return null;
}
