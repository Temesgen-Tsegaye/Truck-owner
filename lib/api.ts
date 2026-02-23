import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { sessionStore } from '@/store/session-store';
import { userStore } from '@/store/user-store';

const getBaseUrl = () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

    if (apiUrl && apiUrl !== 'undefined') return apiUrl;
    if (backendUrl && backendUrl !== 'undefined') return backendUrl;
    
    // Default fallback for Android Emulator
    if (Platform.OS === 'android') {
        return "http://10.0.2.2:3000";
    }
    return "http://localhost:3000";
}

const baseURL = getBaseUrl();


export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  // Try to get token from session store first
  let token = sessionStore.getState().token;
  
  // Fallback to SecureStore if session store hasn't been initialized yet
  if (!token) {
    token = await SecureStore.getItemAsync('session');
    // If we get a token from SecureStore, update the session store
    if (token) {
      sessionStore.getState().setToken(token);
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log("[API]", config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("[API 401] Unauthorized - clearing session and user data");
      await sessionStore.getState().clearToken();
      userStore.getState().clearUser();
      // Redirect logic can be handled by app's auth context observer
    }
    console.log("[API ERROR]", error?.message, error?.config?.url);
    return Promise.reject(error);
  },
);


