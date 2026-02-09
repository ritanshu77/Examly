"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "@/components/Toast";

interface SocketContextType {
  socket: Socket | null;
  isOnline: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isOnline: true, // Optimistic default
});

// Global socket instance to avoid multiple connections
let globalSocket: Socket | null = null;

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    if (!globalSocket) {
      globalSocket = io(BACKEND_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
    }

    const handleConnect = () => {
      console.log("Socket connected:", globalSocket?.id);
      setIsOnline(true);

      if (!isFirstMount.current) {
        toast("Backend Server is Connected! 🚀", "success");
      }
      isFirstMount.current = false;
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsOnline(false);
    };

    const handleServerStatus = (data: any) => {
      if (data?.status === "online") {
        setIsOnline(true);
      }
    };

    globalSocket.on("connect", handleConnect);
    globalSocket.on("disconnect", handleDisconnect);
    globalSocket.on("connect_error", handleDisconnect);
    globalSocket.on("server-status", handleServerStatus);

    // Initial check
    if (globalSocket.connected) {
      setIsOnline(true);
    }

    return () => {
      globalSocket?.off("connect", handleConnect);
      globalSocket?.off("disconnect", handleDisconnect);
      globalSocket?.off("connect_error", handleDisconnect);
      globalSocket?.off("server-status", handleServerStatus);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: globalSocket, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
