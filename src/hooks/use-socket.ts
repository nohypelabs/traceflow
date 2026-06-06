'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useSocket(options?: UseSocketOptions): UseSocketReturn {
  const { namespace = '/', autoConnect = true } = options ?? {};
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(namespace, {
      path: '/api/socketio',
      autoConnect: true,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socketRef.current = socket;
  }, [namespace]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
  };
}

// Hook for device-specific real-time updates
export function useDeviceLocation(deviceId: string) {
  const { socket } = useSocket();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    ignition?: boolean;
    timestamp: Date;
  } | null>(null);

  useEffect(() => {
    if (!socket || !deviceId) return;

    // Subscribe to device updates
    socket.emit('device:subscribe', deviceId);

    // Listen for location updates
    const handleLocation = (data: any) => {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        ignition: data.ignition,
        timestamp: new Date(data.timestamp),
      });
    };

    socket.on('device:location', handleLocation);

    return () => {
      socket.emit('device:unsubscribe', deviceId);
      socket.off('device:location', handleLocation);
    };
  }, [socket, deviceId]);

  return location;
}

// Hook for all device updates (dashboard)
export function useDeviceUpdates() {
  const { socket } = useSocket();
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: any) => {
      setUpdates((prev) => [data, ...prev.slice(0, 49)]); // Keep last 50 updates
    };

    socket.on('device:update', handleUpdate);

    return () => {
      socket.off('device:update', handleUpdate);
    };
  }, [socket]);

  return updates;
}
