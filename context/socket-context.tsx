import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { useSession } from '@/context/auth-context';

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  joinShipmentRoom: (shipmentId: string) => void;
  leaveShipmentRoom: (shipmentId: string) => void;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const useSocket = () => useContext(SocketContext);

const getSocketUrl = () => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl !== 'undefined') return backendUrl;
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { session: token, isLoading: isSessionLoading } = useSession();

  useEffect(() => {
    if (isSessionLoading || !token) return;

    console.log('[TruckOwner Socket] Initializing socket');
    const socketInstance = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[TruckOwner Socket] Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('[TruckOwner Socket] Disconnected');
    });

    setSocket(socketInstance);

    return () => {
      console.log('[TruckOwner Socket] Cleaning up');
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isSessionLoading]);

  const joinRoom = useCallback((roomId: string) => {
    socket?.emit('join_room', { roomId });
  }, [socket]);

  const leaveRoom = useCallback((roomId: string) => {
    socket?.emit('leave_room', { roomId });
  }, [socket]);

  const sendMessage = useCallback((roomId: string, content: string) => {
    socket?.emit('send_message', { roomId, content });
  }, [socket]);

  const joinShipmentRoom = useCallback((shipmentId: string) => {
    console.log(`[TruckOwner Socket] Joining shipment room: ${shipmentId}`);
    socket?.emit('join_shipment_room', { shipmentId });
  }, [socket]);

  const leaveShipmentRoom = useCallback((shipmentId: string) => {
    socket?.emit('leave_shipment_room', { shipmentId });
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinRoom,
      leaveRoom,
      sendMessage,
      joinShipmentRoom,
      leaveShipmentRoom,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
