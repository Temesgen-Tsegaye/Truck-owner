import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useSessionStore } from '@/store/session-store';

const getSocketUrl = () => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl !== 'undefined') {
    return backendUrl;
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

export function useLocalSocket() {
  const token = useSessionStore((state) => state.token);
  const isSessionLoading = useSessionStore((state) => state.isLoading);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isSessionLoading || !token) {
      return;
    }

    const socketInstance = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
    });

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isSessionLoading]);

  return { socket, isConnected };
}