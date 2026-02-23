import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { sessionStore } from '@/store/session-store';

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  joinShipmentRoom: (shipmentId: string) => void;
  leaveShipmentRoom: (shipmentId: string) => void;
  sendLocationUpdate: (shipmentId: string, latitude: number, longitude: number, accuracy?: number) => void;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const useSocket = () => useContext(SocketContext);

const getSocketUrl = () => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl !== 'undefined') return backendUrl;
  return Platform.OS === 'android' ? "http://10.0.2.2:3000" : "http://localhost:3000";
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      const token = sessionStore.getState().token;
      if (!token) return;

      const socket = io(getSocketUrl(), {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('[Socket] Connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('[Socket] Disconnected');
      });

      socketRef.current = socket;
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinRoom = (roomId: string) => {
    socketRef.current?.emit('join_room', { roomId });
  };

  const leaveRoom = (roomId: string) => {
    socketRef.current?.emit('leave_room', { roomId });
  };

  const sendMessage = (roomId: string, content: string) => {
    socketRef.current?.emit('send_message', { roomId, content });
  };

  const joinShipmentRoom = (shipmentId: string) => {
    socketRef.current?.emit('join_shipment_room', { shipmentId });
  };

  const leaveShipmentRoom = (shipmentId: string) => {
    socketRef.current?.emit('leave_shipment_room', { shipmentId });
  };

  const sendLocationUpdate = (shipmentId: string, latitude: number, longitude: number, accuracy?: number) => {
    socketRef.current?.emit('location_update', { shipmentId, latitude, longitude, accuracy });
  };

  return (
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      isConnected, 
      joinRoom, 
      leaveRoom, 
      sendMessage,
      joinShipmentRoom,
      leaveShipmentRoom,
      sendLocationUpdate,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
