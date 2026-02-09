"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "./Toast";

// Global variable to prevent double fetch in React Strict Mode (Development)
let globalIsChecking = false;

export default function ServerStatus() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    // Prevent double execution using global flag
    if (globalIsChecking) return;
    globalIsChecking = true;

    const checkServer = async () => {
      try {
        // Ping our local proxy
        const res = await fetch('/api/health');
        
        if (!res.ok) {
           throw new Error("Server sleeping");
        }
      } catch (e) {
        startCountdown();
      } finally {
        globalIsChecking = false;
      }
    };

    checkServer();
  }, []);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    setIsSleeping(true);
    setCountdown(40);

    // Visual countdown
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // When countdown ends, we rely on the polling to have fixed it, 
          // or we restart the visual countdown if still down.
          // But actually, if polling is running, we can just restart countdown for visuals.
          checkAgain(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Silent background polling every 10 seconds (instead of 3s)
    pollingRef.current = setInterval(() => {
        checkAgain(false); // Silent check
    }, 10000);
  };

  const checkAgain = async (restartCountdownIfFailed = false) => {
    // If we are already checking via another trigger, skip? 
    // Actually, we want to allow parallel checks if one is stuck, 
    // but typically we should avoid spam.
    // We'll skip global lock for silent polling to ensure we don't get blocked by a long pending request
    
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setIsSleeping(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (pollingRef.current) clearInterval(pollingRef.current);
        // Only show toast if it was sleeping
        toast("Backend Server is Connected! 🚀", "success");
      } else {
        // Still sleeping
        if (restartCountdownIfFailed) {
             startCountdown();
        }
      }
    } catch (e) {
        if (restartCountdownIfFailed) {
            startCountdown();
       }
    }
  };

  if (!isSleeping) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#ff9800', // Orange for warning/starting
      color: 'white',
      textAlign: 'center',
      padding: '12px',
      zIndex: 9999,
      fontWeight: 'bold',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    }}>
      <span>⚠️ Server is starting up... Please wait</span>
      <span style={{ 
        background: 'rgba(255,255,255,0.2)', 
        padding: '2px 8px', 
        borderRadius: '4px',
        fontFamily: 'monospace' 
      }}>
        {countdown}s
      </span>
    </div>
  );
}
