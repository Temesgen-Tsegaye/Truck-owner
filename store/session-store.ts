import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface SessionStore {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  initialize: () => Promise<void>;
}

async function setStorageToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (token === null) {
        localStorage.removeItem('session');
      } else {
        localStorage.setItem('session', token);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (token == null) {
      await SecureStore.deleteItemAsync('session');
    } else {
      await SecureStore.setItemAsync('session', token);
    }
  }
}

async function getStorageToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('session');
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
    return null;
  } else {
    try {
      return await SecureStore.getItemAsync('session');
    } catch (error) {
      console.error('Failed to read from SecureStore:', error);
      return null;
    }
  }
}

export const useSessionStore = create<SessionStore>((set) => ({
  token: null,
  isLoading: true,
  
  initialize: async () => {
    try {
      const token = await getStorageToken();
      set({ token, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize session:', error);
      set({ token: null, isLoading: false });
    }
  },
  
  setToken: async (token: string) => {
    await setStorageToken(token);
    set({ token, isLoading: false });
  },
  
  clearToken: async () => {
    await setStorageToken(null);
    set({ token: null, isLoading: false });
  },
}));

// Export store instance for use outside React components
export const sessionStore = useSessionStore;