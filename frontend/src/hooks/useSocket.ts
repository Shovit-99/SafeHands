import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ─── Module-level singleton so one connection is shared across re-renders ─────
let socketInstance: Socket | null = null;

const getSocket = (token: string): Socket => {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useSocket = (token: string | null): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    return () => {
      // Don't disconnect on unmount — keep the singleton alive.
      // The socket is only truly closed when the user logs out.
    };
  }, [token]);

  return socketRef.current;
};

// ─── Call this on logout to tear down the singleton ──────────────────────────
export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
